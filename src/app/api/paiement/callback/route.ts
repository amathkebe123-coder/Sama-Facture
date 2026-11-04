import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { verifyPayDunyaHash, confirmPayDunyaInvoice } from "@/lib/paydunya";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Extrait les données de l'IPN PayDunya quel que soit le format envoyé
 * (application/x-www-form-urlencoded avec clé 'data' JSON ou directe, multipart/form-data, ou application/json)
 */
async function parsePayDunyaPayload(request: NextRequest): Promise<{
  hash?: string;
  token?: string;
  raw: any;
}> {
  const contentType = request.headers.get("content-type") || "";

  // 1. Format JSON
  if (contentType.includes("application/json")) {
    const json = await request.json().catch(() => ({}));
    const dataObj = json.data || json;
    return {
      hash: dataObj.hash || json.hash,
      token: dataObj.invoice?.token || dataObj.token || json.token,
      raw: json,
    };
  }

  // 2. Format multipart/form-data
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);
    if (formData) {
      const dataField = formData.get("data");
      if (typeof dataField === "string") {
        try {
          const parsed = JSON.parse(dataField);
          return {
            hash: parsed.hash,
            token: parsed.invoice?.token || parsed.token,
            raw: parsed,
          };
        } catch {}
      }
      const hash = (formData.get("data[hash]") || formData.get("hash") || undefined) as string | undefined;
      const token = (formData.get("data[invoice][token]") || formData.get("data[token]") || formData.get("token") || undefined) as string | undefined;
      return { hash, token, raw: Object.fromEntries(formData.entries()) };
    }
  }

  // 3. Format application/x-www-form-urlencoded standard PayDunya
  const text = await request.text();
  const searchParams = new URLSearchParams(text);

  const dataField = searchParams.get("data");
  if (dataField) {
    try {
      const parsed = typeof dataField === "string" ? JSON.parse(dataField) : dataField;
      return {
        hash: parsed.hash,
        token: parsed.invoice?.token || parsed.token,
        raw: parsed,
      };
    } catch {
      // Continuer si ce n'est pas du JSON brut dans data
    }
  }

  const hash = searchParams.get("data[hash]") || searchParams.get("hash") || undefined;
  const token =
    searchParams.get("data[invoice][token]") ||
    searchParams.get("data[token]") ||
    searchParams.get("token") ||
    undefined;

  return { hash, token, raw: Object.fromEntries(searchParams.entries()) };
}

export async function POST(request: NextRequest) {
  try {
    console.log("[CALLBACK] Réception d'une notification PayDunya (IPN)...");

    // 1. Lecture des données du callback
    const { hash, token } = await parsePayDunyaPayload(request);

    // 2. Vérification cryptographique : SHA-512 de PAYDUNYA_MASTER_KEY comparé au hash
    if (!hash || !verifyPayDunyaHash(hash, token)) {
      console.warn("[CALLBACK] Signature PayDunya absente ou invalide. Requête rejetée.");
      return NextResponse.json(
        { error: "INVALID_HASH", message: "Signature de notification invalide." },
        { status: 400 }
      );
    }

    if (!token) {
      console.warn("[CALLBACK] Token de facture manquant dans la notification.");
      return NextResponse.json(
        { error: "MISSING_TOKEN", message: "Token de facture manquant." },
        { status: 400 }
      );
    }

    console.log("[CALLBACK] Signature validée. Recherche de la transaction en attente...");

    // 3. Recherche du paiement correspondant dans subscription_payments
    const adminSupabase = createAdminSupabaseClient();
    const { data: payment, error: fetchErr } = await adminSupabase
      .from("subscription_payments")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (fetchErr || !payment) {
      console.warn("[CALLBACK] Aucune transaction trouvée pour ce token.");
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Transaction introuvable." },
        { status: 404 }
      );
    }

    console.log(`[CALLBACK] Transaction trouvée (statut actuel: ${payment.status}).`);

    // 4. Anti-rejeu / Idempotence : si la transaction a déjà été confirmée, ne pas réactiver
    if (payment.status === "completed") {
      console.log("[CALLBACK] Transaction déjà traitée et confirmée (idempotence).");
      return NextResponse.json({
        success: true,
        message: "Transaction déjà confirmée précédemment.",
      });
    }

    // 5. Double vérification serveur auprès de PayDunya checkout-invoice/confirm/[token]
    console.log("[CALLBACK] Vérification de confirmation auprès de l'API PayDunya...");
    const confirmation = await confirmPayDunyaInvoice(token);
    if (!confirmation.success) {
      console.error("[CALLBACK] Échec de confirmation auprès de PayDunya:", confirmation.message);
      return NextResponse.json(
        { error: "CONFIRM_FAILED", message: "Impossible de valider auprès de PayDunya." },
        { status: 502 }
      );
    }

    const paydunyaStatus = (confirmation.status || "").toLowerCase();
    const confirmedAmount = Math.round(Number(confirmation.amount) || 0);
    const expectedAmount = Math.round(Number(payment.amount) || 0);

    console.log(`[CALLBACK] Statut PayDunya confirmé: ${paydunyaStatus}`);

    // 6. Si le statut PayDunya est annulé ou échoué
    if (paydunyaStatus === "cancelled" || paydunyaStatus === "failed") {
      console.log(`[CALLBACK] Paiement ${paydunyaStatus}. Mise à jour sans activation.`);
      await adminSupabase
        .from("subscription_payments")
        .update({
          status: paydunyaStatus,
        })
        .eq("token", token);

      return NextResponse.json({
        success: true,
        message: `Statut mis à jour : ${paydunyaStatus}. Aucun abonnement activé.`,
      });
    }

    // 7. Vérification que le statut est completed et que le montant correspond exactement
    if (paydunyaStatus !== "completed") {
      console.log(`[CALLBACK] Statut intermédiaire: ${paydunyaStatus}. En attente de finalisation.`);
      return NextResponse.json({
        success: true,
        message: `Paiement en attente de statut final (${paydunyaStatus}).`,
      });
    }

    if (confirmedAmount !== expectedAmount) {
      console.error("[CALLBACK] Écart de montant détecté. Transaction marquée amount_mismatch.");
      await adminSupabase
        .from("subscription_payments")
        .update({
          status: "amount_mismatch",
        })
        .eq("token", token);

      return NextResponse.json(
        { error: "AMOUNT_MISMATCH", message: "Le montant payé ne correspond pas à l'offre." },
        { status: 400 }
      );
    }

    // 8. Tout est conforme : appel de activate_subscription(p_token) avec la clé service role
    console.log("[CALLBACK] Validation complète réussie. Activation de l'abonnement via activate_subscription...");
    const { error: rpcError } = await adminSupabase.rpc("activate_subscription", {
      p_token: token,
    });

    if (rpcError) {
      console.error("[CALLBACK] Erreur lors de l'appel activate_subscription RPC:", rpcError.message);
      return NextResponse.json(
        { error: "ACTIVATION_ERROR", message: "Erreur lors de l'activation de l'abonnement." },
        { status: 500 }
      );
    }

    console.log("[CALLBACK] RPC activate_subscription exécutée avec succès.");

    // 9. Mise à jour finale de subscription_payments
    await adminSupabase
      .from("subscription_payments")
      .update({
        status: "completed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("token", token);

    console.log("[CALLBACK] Statut subscription_payments mis à jour en completed. Traitement terminé.");

    return NextResponse.json({
      success: true,
      message: "Abonnement activé avec succès.",
    });
  } catch (err: any) {
    console.error("[CALLBACK] Exception non gérée:", err?.message || err);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Erreur interne de traitement." },
      { status: 500 }
    );
  }
}
