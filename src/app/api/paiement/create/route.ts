import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";
import { SUBSCRIPTION_PLANS, isValidPlanId } from "@/lib/subscription-plans";
import { createPayDunyaInvoice } from "@/lib/paydunya";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 1. Diagnostic serveur (booléens uniquement, jamais de valeurs ni longueurs)
    console.log("[PAIEMENT] Démarrage initialisation paiement d'abonnement", {
      hasAppUrl: Boolean(process.env.APP_URL),
      hasMasterKey: Boolean(process.env.PAYDUNYA_MASTER_KEY),
      hasPrivateKey: Boolean(process.env.PAYDUNYA_PRIVATE_KEY),
      hasToken: Boolean(process.env.PAYDUNYA_TOKEN),
      hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      mode: (process.env.PAYDUNYA_MODE || "test").trim().toLowerCase(),
    });

    // 2. Vérification de l'authentification utilisateur via cookies serveur
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn("[PAIEMENT] Tentative d'accès non authentifié.");
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Vous devez être connecté pour souscrire un abonnement." },
        { status: 401 }
      );
    }

    console.log("[PAIEMENT] Session utilisateur validée.");

    // 3. Lecture et validation stricte du code de l'offre
    const body = await request.json().catch(() => ({}));
    const { plan } = body;

    if (!isValidPlanId(plan)) {
      console.warn("[PAIEMENT] Identifiant d'offre invalide reçu:", plan);
      return NextResponse.json(
        {
          error: "INVALID_PLAN",
          message: "L'offre sélectionnée est invalide. Choisissez entre 'monthly', 'six_months' ou 'yearly'.",
        },
        { status: 400 }
      );
    }

    // 4. Récupération du prix et du libellé depuis la constante serveur unique
    const planConfig = SUBSCRIPTION_PLANS[plan];
    const amount = planConfig.amount;
    const description = `Abonnement Yomb Facture - ${planConfig.name} (${planConfig.durationLabel})`;

    console.log(`[PAIEMENT] Offre sélectionnée: ${plan} (${amount} FCFA). Préparation des URLs...`);

    // 5. Configuration des adresses de redirection et de rappel (utilise APP_URL sinon fallback production)
    const appUrl = (process.env.APP_URL || "https://sama-facture-one.vercel.app")
      .trim()
      .replace(/\/$/, "");

    const returnUrl = `${appUrl}/abonnement/retour`;
    const cancelUrl = `${appUrl}/abonnement`;
    const callbackUrl = `${appUrl}/api/paiement/callback`;

    // 6. Création de la facture PayDunya (PAR)
    console.log("[PAIEMENT] Appel de l'API PayDunya pour génération du lien de paiement...");
    const paydunyaRes = await createPayDunyaInvoice({
      totalAmount: amount,
      description,
      cancelUrl,
      returnUrl,
      callbackUrl,
    });

    if (!paydunyaRes.success || !paydunyaRes.token || !paydunyaRes.url) {
      console.error("[PAIEMENT] Échec de l'initialisation PayDunya:", paydunyaRes.message);
      const safeMessage =
        paydunyaRes.message && !paydunyaRes.message.includes("<")
          ? paydunyaRes.message
          : "Le paiement est momentanément indisponible. Réessaie dans quelques minutes.";
      return NextResponse.json(
        {
          error: "PAYDUNYA_ERROR",
          message: safeMessage,
        },
        { status: 502 }
      );
    }

    console.log("[PAIEMENT] Facture PayDunya créée avec succès. Enregistrement en base de données...");

    // 7. Enregistrement dans subscription_payments avec status = 'pending'
    const adminSupabase = createAdminSupabaseClient();
    const { error: dbError } = await adminSupabase.from("subscription_payments").insert({
      user_id: user.id,
      token: paydunyaRes.token,
      amount: amount,
      plan: plan,
      status: "pending",
    });

    if (dbError) {
      console.error("[PAIEMENT] Erreur enregistrement subscription_payments:", dbError.message);
      return NextResponse.json(
        { error: "DB_ERROR", message: "Erreur lors de l'enregistrement de la transaction." },
        { status: 500 }
      );
    }

    console.log("[PAIEMENT] Transaction enregistrée avec succès (statut pending). Redirection vers PayDunya.");

    // 8. Renvoi strict de l'URL de paiement uniquement (aucun secret ni token exposé)
    return NextResponse.json({
      url: paydunyaRes.url,
    });
  } catch (err: any) {
    console.error("[PAIEMENT] Exception lors de l'initialisation:", err?.message || err);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Une erreur interne est survenue lors de l'initialisation du paiement." },
      { status: 500 }
    );
  }
}
