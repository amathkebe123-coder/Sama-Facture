import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";
import { SUBSCRIPTION_PLANS, isValidPlanId } from "@/lib/subscription-plans";
import { createPayDunyaInvoice } from "@/lib/paydunya";

export async function POST(request: NextRequest) {
  try {
    // 1. Vérification de l'authentification utilisateur via cookies serveur
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Vous devez être connecté pour souscrire un abonnement." },
        { status: 401 }
      );
    }

    // 2. Lecture et validation stricte du code de l'offre
    const body = await request.json().catch(() => ({}));
    const { plan } = body;

    if (!isValidPlanId(plan)) {
      return NextResponse.json(
        {
          error: "INVALID_PLAN",
          message: "L'offre sélectionnée est invalide. Choisissez entre 'monthly', 'six_months' ou 'yearly'.",
        },
        { status: 400 }
      );
    }

    // 3. Récupération du prix et du libellé depuis la constante serveur unique
    const planConfig = SUBSCRIPTION_PLANS[plan];
    const amount = planConfig.amount;
    const description = `Abonnement Yomb Facture - ${planConfig.name} (${planConfig.durationLabel})`;

    // 4. Configuration des adresses de redirection et de rappel
    const appUrl = (process.env.APP_URL || "").trim().replace(/\/$/, "");
    if (!appUrl) {
      return NextResponse.json(
        { error: "CONFIG_ERROR", message: "La variable APP_URL n'est pas configurée côté serveur." },
        { status: 500 }
      );
    }

    const returnUrl = `${appUrl}/abonnement/retour`;
    const cancelUrl = `${appUrl}/abonnement`;
    const callbackUrl = `${appUrl}/api/paiement/callback`;

    // 5. Création de la facture PayDunya (PAR)
    const paydunyaRes = await createPayDunyaInvoice({
      totalAmount: amount,
      description,
      cancelUrl,
      returnUrl,
      callbackUrl,
    });

    if (!paydunyaRes.success || !paydunyaRes.token || !paydunyaRes.url) {
      return NextResponse.json(
        {
          error: "PAYDUNYA_ERROR",
          message: paydunyaRes.message || "Impossible d'initialiser le paiement avec PayDunya.",
        },
        { status: 502 }
      );
    }

    // 6. Enregistrement dans subscription_payments avec status = 'pending'
    const adminSupabase = createAdminSupabaseClient();
    const { error: dbError } = await adminSupabase.from("subscription_payments").insert({
      user_id: user.id,
      token: paydunyaRes.token,
      amount: amount,
      plan: plan,
      status: "pending",
    });

    if (dbError) {
      console.error("Erreur enregistrement subscription_payments:", dbError.message);
      return NextResponse.json(
        { error: "DB_ERROR", message: "Erreur lors de l'enregistrement de la transaction." },
        { status: 500 }
      );
    }

    // 7. Renvoi strict de l'URL de paiement uniquement (aucun secret ni token exposé)
    return NextResponse.json({
      url: paydunyaRes.url,
    });
  } catch (err: any) {
    console.error("Exception /api/paiement/create:", err?.message || err);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}

