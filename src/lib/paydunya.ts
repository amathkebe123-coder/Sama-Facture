import crypto from "crypto";

export interface PayDunyaInvoicePayload {
  totalAmount: number;
  description: string;
  cancelUrl: string;
  returnUrl: string;
  callbackUrl: string;
  customData?: Record<string, any>;
}

export interface PayDunyaCreateInvoiceResponse {
  success: boolean;
  token?: string;
  url?: string;
  message?: string;
}

export interface PayDunyaConfirmResponse {
  success: boolean;
  status?: string; // 'completed', 'cancelled', 'failed', 'pending'
  invoiceToken?: string;
  amount?: number;
  message?: string;
  raw?: any;
}

/**
 * Retourne l'URL de base PayDunya selon le mode configuré (test/sandbox ou live/production)
 */
export function getPayDunyaBaseUrl(): string {
  const mode = (process.env.PAYDUNYA_MODE || "test").trim().toLowerCase();
  if (mode === "live") {
    return "https://app.paydunya.com/api/v1";
  }
  return "https://app.paydunya.com/sandbox-api/v1";
}

/**
 * En-têtes HTTP requis par PayDunya
 */
function getPayDunyaHeaders(): Record<string, string> {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY || "";
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY || "";
  const token = process.env.PAYDUNYA_TOKEN || "";

  if (!masterKey || !privateKey || !token) {
    throw new Error("Clés d'API PayDunya manquantes dans les variables d'environnement.");
  }

  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": masterKey,
    "PAYDUNYA-PRIVATE-KEY": privateKey,
    "PAYDUNYA-TOKEN": token,
  };
}

/**
 * Crée une facture de redirection (PAR) via l'API PayDunya checkout-invoice/create
 */
export async function createPayDunyaInvoice(
  params: PayDunyaInvoicePayload
): Promise<PayDunyaCreateInvoiceResponse> {
  const baseUrl = getPayDunyaBaseUrl();
  const headers = getPayDunyaHeaders();
  const appUrl = (process.env.APP_URL || "https://sama-facture-one.vercel.app").trim().replace(/\/$/, "");

  const body = {
    invoice: {
      total_amount: Math.round(params.totalAmount),
      description: params.description,
    },
    store: {
      name: "Yomb Facture",
      website_url: appUrl,
    },
    actions: {
      cancel_url: params.cancelUrl,
      return_url: params.returnUrl,
      callback_url: params.callbackUrl,
    },
    ...(params.customData ? { custom_data: params.customData } : {}),
  };

  const response = await fetch(`${baseUrl}/checkout-invoice/create`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      success: false,
      message: `Erreur API PayDunya (${response.status}): ${errorText}`,
    };
  }

  const data = await response.json();

  // PayDunya renvoie response_code: "00" en cas de succès avec token et response_text ou response_url
  const paymentUrl = data.response_text || data.response_url;
  if (data.response_code === "00" && data.token && paymentUrl) {
    return {
      success: true,
      token: data.token,
      url: paymentUrl,
    };
  }

  return {
    success: false,
    message: data.response_text || data.description || "Échec de création de la facture PayDunya",
  };
}

/**
 * Vérifie le statut d'une facture PayDunya via l'API checkout-invoice/confirm/[token]
 */
export async function confirmPayDunyaInvoice(
  token: string
): Promise<PayDunyaConfirmResponse> {
  const baseUrl = getPayDunyaBaseUrl();
  const headers = getPayDunyaHeaders();

  const response = await fetch(`${baseUrl}/checkout-invoice/confirm/${encodeURIComponent(token)}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errText = await response.text();
    return {
      success: false,
      message: `Erreur confirmation PayDunya (${response.status}): ${errText}`,
    };
  }

  const data = await response.json();

  // Dans la réponse PayDunya :
  // data.status peut être 'completed', 'cancelled', 'failed', 'pending'
  // data.invoice contient total_amount, token, etc.
  const status = (data.status || "").toLowerCase();
  const amount = Number(data.invoice?.total_amount ?? data.total_amount ?? 0);

  return {
    success: data.response_code === "00" || status === "completed",
    status,
    invoiceToken: data.invoice?.token || token,
    amount,
    raw: data,
  };
}

/**
 * Calcule le hash SHA-512 de la clé principale PAYDUNYA_MASTER_KEY
 */
export function computePayDunyaMasterHash(): string {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY || "";
  return crypto.createHash("sha512").update(masterKey).digest("hex");
}

/**
 * Vérifie que le hash reçu dans l'IPN correspond au SHA-512 de PAYDUNYA_MASTER_KEY
 * (supporte également la variante sha512(masterKey + token))
 */
export function verifyPayDunyaHash(receivedHash: string | undefined | null, token?: string): boolean {
  if (!receivedHash || typeof receivedHash !== "string") {
    return false;
  }
  const masterKey = process.env.PAYDUNYA_MASTER_KEY || "";
  if (!masterKey) {
    return false;
  }

  const compare = (a: string, b: string) => {
    try {
      const bufA = Buffer.from(a.trim().toLowerCase(), "utf8");
      const bufB = Buffer.from(b.trim().toLowerCase(), "utf8");
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  };

  const expectedHash = computePayDunyaMasterHash();
  if (compare(receivedHash, expectedHash)) {
    return true;
  }

  // Variante avec token si fourni
  if (token) {
    const expectedWithToken = crypto.createHash("sha512").update(masterKey + token).digest("hex");
    if (compare(receivedHash, expectedWithToken)) {
      return true;
    }
  }

  return false;
}

