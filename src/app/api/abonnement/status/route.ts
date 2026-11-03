import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Non connecté" },
        { status: 401 }
      );
    }

    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("status, plan, expires_at, created_at, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError) {
      console.error("Erreur lecture subscriptions:", subError.message);
      return NextResponse.json(
        { error: "DB_ERROR", message: "Erreur lecture abonnement" },
        { status: 500 }
      );
    }

    const now = Date.now();
    const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at).getTime() : null;
    const isActive = Boolean(
      subscription &&
      expiresAt &&
      expiresAt > now &&
      (subscription.status === "active" || subscription.status === "completed")
    );

    return NextResponse.json({
      hasActiveSubscription: isActive,
      subscription: subscription
        ? {
            status: subscription.status,
            plan: subscription.plan,
            expiresAt: subscription.expires_at,
          }
        : null,
    });
  } catch (err: any) {
    console.error("Exception /api/abonnement/status:", err?.message || err);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Erreur interne" },
      { status: 500 }
    );
  }
}

