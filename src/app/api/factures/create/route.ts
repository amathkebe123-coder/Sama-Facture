import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Vous devez être connecté pour créer une facture." },
        { status: 401 }
      );
    }

    // 1. Contrôle d'accès serveur : Vérification obligatoire de l'abonnement
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("status, expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError) {
      console.error("Erreur lecture subscriptions lors de la création de facture:", subError.message);
    }

    const now = Date.now();
    const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at).getTime() : null;
    const hasActiveSubscription = Boolean(
      subscription &&
      expiresAt &&
      expiresAt > now &&
      (subscription.status === "active" || subscription.status === "completed")
    );

    // Blocage serveur strict si expires_at est vide ou dépassé
    if (!hasActiveSubscription) {
      return NextResponse.json(
        {
          error: "SUBSCRIPTION_REQUIRED",
          message: "Un abonnement actif est requis pour créer une facture. Veuillez souscrire ou renouveler votre abonnement.",
          expiresAt: subscription?.expires_at || null,
        },
        { status: 403 }
      );
    }

    // 2. Traitement de la création de facture
    const body = await request.json().catch(() => ({}));
    const { invoiceData, invoiceNumber } = body;

    if (!invoiceData || !invoiceNumber) {
      return NextResponse.json(
        { error: "INVALID_DATA", message: "Données de facture incomplètes." },
        { status: 400 }
      );
    }

    const insertPayload: Record<string, any> = {
      user_id: user.id,
      invoice_number: invoiceNumber,
      client_id: invoiceData.client?.id,
      issue_date: invoiceData.issueDate,
      due_date: invoiceData.dueDate,
      channel: invoiceData.channel,
      status: invoiceData.status || "draft",
      subtotal: Math.round(invoiceData.subtotal || 0),
      tax_rate: invoiceData.taxRate || 18,
      tax_total: Math.round(invoiceData.taxTotal || 0),
      total: Math.round(invoiceData.total || 0),
      notes: invoiceData.notes || "",
      payment_terms: invoiceData.paymentTerms || "",
    };

    const { data: createdInvoice, error: invError } = await supabase
      .from("invoices")
      .insert(insertPayload)
      .select(`
        *,
        client:clients (
          id,
          name,
          email,
          phone,
          address,
          city,
          total_invoiced,
          total_paid,
          invoice_count
        )
      `)
      .single();

    if (invError) {
      console.error("Erreur insertion facture Supabase:", invError.message);
      return NextResponse.json(
        { error: "DB_ERROR", message: invError.message },
        { status: 500 }
      );
    }

    // Insertion des lignes
    if (invoiceData.lines && invoiceData.lines.length > 0) {
      const linesToInsert = invoiceData.lines.map((l: any) => ({
        invoice_id: createdInvoice.id,
        description: (l.description || "").trim(),
        quantity: Math.max(1, Number(l.quantity) || 1),
        unit_price: Math.round(Number(l.unitPrice) || 0),
        amount: Math.round((Number(l.quantity) || 1) * (Number(l.unitPrice) || 0)),
      }));

      const { data: insertedLines, error: linesError } = await supabase
        .from("invoice_lines")
        .insert(linesToInsert)
        .select();

      if (linesError) {
        console.error("Erreur insertion lignes Supabase:", linesError.message);
      } else {
        createdInvoice.lines = insertedLines;
      }
    }

    return NextResponse.json({
      success: true,
      invoice: createdInvoice,
    });
  } catch (err: any) {
    console.error("Exception /api/factures/create:", err?.message || err);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Erreur interne" },
      { status: 500 }
    );
  }
}

