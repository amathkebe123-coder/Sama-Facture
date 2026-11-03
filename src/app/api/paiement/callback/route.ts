import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { verifyPayDunyaHash, confirmPayDunyaInvoice } from "@/lib/paydunya";

/**
 * Extrait les données de l'IPN PayDunya quel que soit le format envoyé
 * (application/x-www-form-urlencoded avec clé 'data' JSON ou directe, ou application/json)
 */
async function parsePayDunyaPayload(request: NextRequest): Promise<{
  hash?: string;
  token?: string;
  raw: any;
}> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const json = await request.json().catch(() => ({}));
    const dataObj = json.data || json;
    return {
      hash: dataObj.hash || json.hash,
      token: dataObj.invoice?.token || dataObj.token || json.token,
      raw: json,
    };
  }

  // Cas form-urlencoded (format standard PayDunya IPN)
  const text = await request.text();
  const searchParams = new URLSearchParams(text);

  let dataField = searchParams.get("data");
  if (dataField) {
    try {
      const parsed = typeof dataField === "string" ? JSON.parse(dataField) : dataField;
      return {
        hash: parsed.hash,
        token: parsed.invoice?.token || parsed.token,
        raw: parsed,
      };
    } catch {
      // Si ce n'est pas du JSON brut dans data, continuer l'analyse des clés URL
    }
  }

  // Clés directes formatées comme data[hash] ou data[invoice][token]
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
    // 1. Lecture des données du callback
    const { hash, token } = await parsePayDunyaPayload(request);

    // 2. Vérification cryptographique : SHA-512 de PAYDUNYA_MASTER_KEY comparé au hash
    if (!hash || !verifyPayDunyaHash(hash)) {
      console.warn("Callback PayDunya refusé : hash absent ou invalide");
      return NextResponse.json(
        { error: "INVALID_HASH", message: "Signature de notification invalide." },
        { status: 400 }
      );
    }

    if (!token) {
      console.warn("Callback PayDunya refusé : token manquant");
      return NextResponse.json(
        { error: "MISSING_TOKEN", message: "Token de facture manquant." },
        { status: 400 }
      );
    }

    // 3. Recherche du paiement correspondant dans subscription_payments
    const adminSupabase = createAdminSupabaseClient();
    const { data: payment, error: fetchErr } = await adminSupabase
      .from("subscription_payments")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (fetchErr || !payment) {
      console.warn("Callback PayDunya : transaction introuvable pour ce token");
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Transaction introuvable." },
        { status: 404 }
      );
    }

    // 4. Anti-rejeu / Idempotence : si la transaction a déjà été confirmée, ne pas réactiver
    if (payment.status === "completed") {
      return NextResponse.json({
        success: true,
        message: "Transaction déjà confirmée précédemment.",
      });
    }

    // 5. Double vérification serveur auprès de PayDunya checkout-invoice/confirm/[token]
    const confirmation = await confirmPayDunyaInvoice(token);
    if (!confirmation.success) {
      console.error("Échec appel checkout-invoice/confirm PayDunya");
      return NextResponse.json(
        { error: "CONFIRM_FAILED", message: "Impossible de valider auprès de PayDunya." },
        { status: 502 }
      );
    }

    const paydunyaStatus = (confirmation.status || "").toLowerCase();
    const confirmedAmount = Math.round(Number(confirmation.amount) || 0);
    const expectedAmount = Math.round(Number(payment.amount) || 0);

    // 6. Si le statut PayDunya est annulé ou échoué
    if (paydunyaStatus === "cancelled" || paydunyaStatus === "failed") {
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
      // Paiement encore en attente ou autre statut intermédiaire
      return NextResponse.json({
        success: true,
        message: `Paiement en attente de statut final (${paydunyaStatus}).`,
      });
    }

    if (confirmedAmount !== expectedAmount) {
      console.error("Montant PayDunya divergent de la transaction enregistrée");
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
    const { error: rpcError } = await adminSupabase.rpc("activate_subscription", {
      p_token: token,
    });

    if (rpcError) {
      console.error("Erreur exécution activate_subscription RPC:", rpcError.message);
      return NextResponse.json(
        { error: "ACTIVATION_ERROR", message: "Erreur lors de l'activation de l'abonnement." },
        { status: 500 }
      );
    }

    // 9. Mise à jour de subscription_payments
    await adminSupabase
      .from("subscription_payments")
      .update({
        status: "completed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("token", token);

    return NextResponse.json({
      success: true,
      message: "Abonnement activé avec succès.",
    });
  } catch (err: any) {
    console.error("Exception /api/paiement/callback:", err?.message || err);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Erreur interne de traitement." },
      { status: 500 }
    );
  }
}

