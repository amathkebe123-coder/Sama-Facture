import { supabase, isSupabaseConfigured } from "./supabase";
import { Invoice, InvoiceLine, Client } from "./data/fixtures";
import { InvoiceStatus } from "./invoice-status";
import { CompanySettings, DEFAULT_COMPANY_SETTINGS, saveCompanySettings } from "./company";

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  taxRate: number;
  unit: string;
}

export interface PaymentItem {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  method: string;
  date: string;
  ref: string;
  status: string;
}

// -----------------------------------------------------------------------------
// CLIENTS
// -----------------------------------------------------------------------------

export function mapClientFromRow(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email || "",
    phone: row.phone || "",
    address: row.address || "",
    city: row.city || "Dakar",
    totalInvoiced: Number(row.total_invoiced || 0),
    totalPaid: Number(row.total_paid || 0),
    invoiceCount: Number(row.invoice_count || 0),
  };
}

export async function fetchClients(): Promise<Client[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur lors de la récupération des clients Supabase:", error);
    throw error;
  }

  return (data || []).map(mapClientFromRow);
}

export async function createClientInDb(data: Omit<Client, "id">, userId?: string): Promise<Client> {
  const insertPayload: Record<string, any> = {
    name: data.name.trim(),
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || "+221 ",
    address: data.address?.trim() || "",
    city: data.city?.trim() || "Dakar",
    total_invoiced: data.totalInvoiced || 0,
    total_paid: data.totalPaid || 0,
    invoice_count: data.invoiceCount || 0,
  };

  if (userId) insertPayload.user_id = userId;

  const { data: created, error } = await supabase
    .from("clients")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error("Erreur création client Supabase:", error);
    throw error;
  }

  return mapClientFromRow(created);
}

export async function updateClientInDb(id: string, data: Partial<Client>): Promise<Client> {
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.email !== undefined) updatePayload.email = data.email.trim();
  if (data.phone !== undefined) updatePayload.phone = data.phone.trim();
  if (data.address !== undefined) updatePayload.address = data.address.trim();
  if (data.city !== undefined) updatePayload.city = data.city.trim();
  if (data.totalInvoiced !== undefined) updatePayload.total_invoiced = data.totalInvoiced;
  if (data.totalPaid !== undefined) updatePayload.total_paid = data.totalPaid;
  if (data.invoiceCount !== undefined) updatePayload.invoice_count = data.invoiceCount;

  const { data: updated, error } = await supabase
    .from("clients")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erreur mise à jour client Supabase:", error);
    throw error;
  }

  return mapClientFromRow(updated);
}

export async function deleteClientFromDb(id: string): Promise<void> {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) {
    console.error("Erreur suppression client Supabase:", error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// INVOICES & LINES
// -----------------------------------------------------------------------------

export function mapInvoiceFromRow(row: any): Invoice {
  const clientObj = row.client || {
    id: row.client_id,
    name: "Client Inconnu",
    email: "",
    phone: "",
    address: "",
    city: "Dakar",
  };

  const lines: InvoiceLine[] = (row.lines || []).map((l: any) => ({
    id: l.id,
    description: l.description,
    quantity: Number(l.quantity) || 1,
    unitPrice: Number(l.unit_price) || 0,
    taxRate: Number(l.tax_rate) || 18,
    lineTotal: Number(l.line_total) || 0,
  }));

  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    client: {
      id: clientObj.id,
      name: clientObj.name,
      email: clientObj.email || "",
      phone: clientObj.phone || "",
      address: clientObj.address || "",
      city: clientObj.city || "Dakar",
      totalInvoiced: Number(clientObj.total_invoiced || 0),
      totalPaid: Number(clientObj.total_paid || 0),
      invoiceCount: Number(clientObj.invoice_count || 0),
    },
    issueDate: row.issue_date,
    dueDate: row.due_date,
    channel: row.channel || "Wave",
    status: row.status as InvoiceStatus,
    lines,
    subtotal: Number(row.subtotal) || 0,
    taxRate: Number(row.tax_rate) || 18,
    taxTotal: Number(row.tax_total) || 0,
    total: Number(row.total) || 0,
    notes: row.notes || "",
    paymentTerms: row.payment_terms || "",
  };
}

export async function fetchInvoices(): Promise<Invoice[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      client_id,
      issue_date,
      due_date,
      channel,
      status,
      subtotal,
      tax_rate,
      tax_total,
      total,
      notes,
      payment_terms,
      created_at,
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
      ),
      lines:invoice_lines (
        id,
        description,
        quantity,
        unit_price,
        tax_rate,
        line_total
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur lors de la récupération des factures Supabase:", error);
    throw error;
  }

  return (data || []).map(mapInvoiceFromRow);
}

export async function createInvoiceInDb(
  data: Omit<Invoice, "id" | "invoiceNumber">,
  invoiceNumber: string,
  userId?: string
): Promise<Invoice> {
  const insertPayload: Record<string, any> = {
    invoice_number: invoiceNumber,
    client_id: data.client.id,
    issue_date: data.issueDate,
    due_date: data.dueDate,
    channel: data.channel,
    status: data.status,
    subtotal: Math.round(data.subtotal),
    tax_rate: data.taxRate,
    tax_total: Math.round(data.taxTotal),
    total: Math.round(data.total),
    notes: data.notes || "",
    payment_terms: data.paymentTerms || "",
  };

  if (userId) insertPayload.user_id = userId;

  // 1. Insertion de la facture
  const { data: invRow, error: invError } = await supabase
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
    console.error("Erreur création facture Supabase:", invError);
    throw invError;
  }

  // 2. Insertion des lignes de facturation
  let linesInserted: InvoiceLine[] = [];
  if (data.lines && data.lines.length > 0) {
    const linesToInsert = data.lines.map((l) => {
      const linePayload: Record<string, any> = {
        invoice_id: invRow.id,
        description: l.description.trim(),
        quantity: l.quantity,
        unit_price: Math.round(l.unitPrice),
        tax_rate: l.taxRate || 18,
        line_total: Math.round(l.lineTotal),
      };
      if (userId) linePayload.user_id = userId;
      return linePayload;
    });

    const { data: insertedLines, error: linesError } = await supabase
      .from("invoice_lines")
      .insert(linesToInsert)
      .select();

    if (linesError) {
      console.error("Erreur création lignes de facture Supabase:", linesError);
      throw linesError;
    }

    linesInserted = (insertedLines || []).map((l: any) => ({
      id: l.id,
      description: l.description,
      quantity: Number(l.quantity),
      unitPrice: Number(l.unit_price),
      taxRate: Number(l.tax_rate),
      lineTotal: Number(l.line_total),
    }));
  }

  // 3. Mettre à jour les compteurs du client en base
  try {
    const { data: clientRow } = await supabase
      .from("clients")
      .select("total_invoiced, total_paid, invoice_count")
      .eq("id", data.client.id)
      .single();

    if (clientRow) {
      const prevTotalInvoiced = Number(clientRow.total_invoiced || 0);
      const prevTotalPaid = Number(clientRow.total_paid || 0);
      const prevCount = Number(clientRow.invoice_count || 0);

      await supabase
        .from("clients")
        .update({
          total_invoiced: prevTotalInvoiced + Math.round(data.total),
          invoice_count: prevCount + 1,
          total_paid:
            data.status === "paid"
              ? prevTotalPaid + Math.round(data.total)
              : prevTotalPaid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.client.id);
    }
  } catch (err) {
    console.warn("Mise à jour stats client ignorée:", err);
  }

  return {
    ...mapInvoiceFromRow(invRow),
    lines: linesInserted,
  };
}

export async function updateInvoiceInDb(id: string, data: Partial<Invoice>, userId?: string): Promise<void> {
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (data.notes !== undefined) updatePayload.notes = data.notes;
  if (data.dueDate !== undefined) updatePayload.due_date = data.dueDate;
  if (data.issueDate !== undefined) updatePayload.issue_date = data.issueDate;
  if (data.channel !== undefined) updatePayload.channel = data.channel;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.subtotal !== undefined) updatePayload.subtotal = Math.round(data.subtotal);
  if (data.taxTotal !== undefined) updatePayload.tax_total = Math.round(data.taxTotal);
  if (data.total !== undefined) updatePayload.total = Math.round(data.total);

  const { error } = await supabase
    .from("invoices")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    console.error("Erreur mise à jour facture Supabase:", error);
    throw error;
  }

  // Si les lignes sont fournies, les réinsérer
  if (data.lines && data.lines.length > 0) {
    await supabase.from("invoice_lines").delete().eq("invoice_id", id);

    const linesToInsert = data.lines.map((l) => {
      const linePayload: Record<string, any> = {
        invoice_id: id,
        description: l.description.trim(),
        quantity: l.quantity,
        unit_price: Math.round(l.unitPrice),
        tax_rate: l.taxRate || 18,
        line_total: Math.round(l.lineTotal),
      };
      if (userId) linePayload.user_id = userId;
      return linePayload;
    });

    await supabase.from("invoice_lines").insert(linesToInsert);
  }
}

export async function updateInvoiceStatusInDb(id: string, status: InvoiceStatus): Promise<void> {
  const { error } = await supabase
    .from("invoices")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Erreur mise à jour statut facture Supabase:", error);
    throw error;
  }
}

export async function deleteInvoiceFromDb(id: string): Promise<void> {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) {
    console.error("Erreur suppression facture Supabase:", error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// PRODUCTS
// -----------------------------------------------------------------------------

export function mapProductFromRow(row: any): ProductItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category || "Services",
    unitPrice: Number(row.unit_price || 0),
    taxRate: Number(row.tax_rate || 18),
    unit: row.unit || "Prestation",
  };
}

const DEMO_PRODUCT_NAMES = [
  "Développement Plateforme Web & API",
  "Intégration Passerelle Mobile Wave & OM",
  "Infogérance Cloud & Sécurité Serveurs",
  "Audit de Conformité & Sécurité Système",
];

export async function fetchProducts(): Promise<ProductItem[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur récupération produits Supabase:", error);
    throw error;
  }

  // Si des produits de démo hérités de l'ancien trigger existent, on les supprime automatiquement de Supabase
  const demoProducts = (data || []).filter((p) => DEMO_PRODUCT_NAMES.includes(p.name));
  if (demoProducts.length > 0) {
    const demoIds = demoProducts.map((p) => p.id);
    await supabase.from("products").delete().in("id", demoIds);
    return (data || [])
      .filter((p) => !DEMO_PRODUCT_NAMES.includes(p.name))
      .map(mapProductFromRow);
  }

  return (data || []).map(mapProductFromRow);
}

export async function createProductInDb(data: Omit<ProductItem, "id">, userId?: string): Promise<ProductItem> {
  const insertPayload: Record<string, any> = {
    name: data.name.trim(),
    category: data.category.trim(),
    unit_price: Math.round(data.unitPrice),
    tax_rate: data.taxRate || 18,
    unit: data.unit.trim(),
  };
  if (userId) insertPayload.user_id = userId;

  const { data: created, error } = await supabase
    .from("products")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error("Erreur création produit Supabase:", error);
    throw error;
  }

  return mapProductFromRow(created);
}

export async function updateProductInDb(id: string, data: Partial<ProductItem>): Promise<ProductItem> {
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.category !== undefined) updatePayload.category = data.category.trim();
  if (data.unitPrice !== undefined) updatePayload.unit_price = Math.round(data.unitPrice);
  if (data.taxRate !== undefined) updatePayload.tax_rate = data.taxRate;
  if (data.unit !== undefined) updatePayload.unit = data.unit.trim();

  const { data: updated, error } = await supabase
    .from("products")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erreur mise à jour produit Supabase:", error);
    throw error;
  }

  return mapProductFromRow(updated);
}

export async function deleteProductFromDb(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("Erreur suppression produit Supabase:", error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// PAYMENTS
// -----------------------------------------------------------------------------

export function mapPaymentFromRow(row: any): PaymentItem {
  let formattedDate = "";
  if (row.payment_date) {
    const parts = row.payment_date.split("-");
    formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : row.payment_date;
  }

  return {
    id: row.id,
    invoiceNumber: row.invoice_number || "",
    client: row.client_name || "",
    amount: Number(row.amount || 0),
    method: row.method || "Wave Business",
    date: formattedDate || new Date().toLocaleDateString("fr-FR"),
    ref: row.reference || "",
    status: row.status || "Confirmé",
  };
}

export async function fetchPayments(): Promise<PaymentItem[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur récupération paiements Supabase:", error);
    throw error;
  }

  return (data || []).map(mapPaymentFromRow);
}

export async function createPaymentInDb(data: Omit<PaymentItem, "id">, userId?: string): Promise<PaymentItem> {
  let sqlDate = new Date().toISOString().split("T")[0];
  if (data.date && data.date.includes("/")) {
    const p = data.date.split("/");
    if (p.length === 3) sqlDate = `${p[2]}-${p[1]}-${p[0]}`;
  }

  const insertPayload: Record<string, any> = {
    invoice_number: data.invoiceNumber.trim(),
    client_name: data.client.trim(),
    amount: Math.round(data.amount),
    method: data.method.trim(),
    payment_date: sqlDate,
    reference: data.ref.trim(),
    status: data.status || "Confirmé",
  };
  if (userId) insertPayload.user_id = userId;

  const { data: created, error } = await supabase
    .from("payments")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error("Erreur création paiement Supabase:", error);
    throw error;
  }

  return mapPaymentFromRow(created);
}

export async function updatePaymentInDb(id: string, data: Partial<PaymentItem>): Promise<PaymentItem> {
  const updatePayload: Record<string, any> = {};

  if (data.invoiceNumber !== undefined) updatePayload.invoice_number = data.invoiceNumber.trim();
  if (data.client !== undefined) updatePayload.client_name = data.client.trim();
  if (data.amount !== undefined) updatePayload.amount = Math.round(data.amount);
  if (data.method !== undefined) updatePayload.method = data.method.trim();
  if (data.ref !== undefined) updatePayload.reference = data.ref.trim();
  if (data.status !== undefined) updatePayload.status = data.status;

  const { data: updated, error } = await supabase
    .from("payments")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erreur mise à jour paiement Supabase:", error);
    throw error;
  }

  return mapPaymentFromRow(updated);
}

export async function deletePaymentFromDb(id: string): Promise<void> {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) {
    console.error("Erreur suppression paiement Supabase:", error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// COMPANY SETTINGS
// -----------------------------------------------------------------------------

export async function fetchCompanySettingsFromDb(): Promise<CompanySettings> {
  if (!isSupabaseConfigured()) return DEFAULT_COMPANY_SETTINGS;

  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Erreur récupération paramètres entreprise Supabase:", error);
    return DEFAULT_COMPANY_SETTINGS;
  }

  if (!data) return DEFAULT_COMPANY_SETTINGS;

  const settings: CompanySettings = {
    companyName: data.company_name || DEFAULT_COMPANY_SETTINGS.companyName,
    ninea: data.ninea || "",
    rccm: data.rccm || "",
    phone: data.phone || "+221 ",
    address: data.address || "",
    prefix: data.invoice_prefix || "FAC-2026-",
    defaultTax: String(data.default_tax_rate || "18"),
    paymentTerms: String(data.default_payment_terms || "30"),
  };

  // Synchroniser avec localStorage pour le générateur PDF
  saveCompanySettings(settings);

  return settings;
}

export async function updateCompanySettingsInDb(settings: CompanySettings, userId?: string): Promise<void> {
  saveCompanySettings(settings);

  if (!isSupabaseConfigured()) return;

  const { data: existing } = await supabase
    .from("company_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  const payload: Record<string, any> = {
    company_name: settings.companyName.trim(),
    ninea: settings.ninea.trim(),
    rccm: settings.rccm.trim(),
    phone: settings.phone.trim(),
    address: settings.address.trim(),
    invoice_prefix: settings.prefix.trim(),
    default_tax_rate: parseFloat(settings.defaultTax) || 18,
    default_payment_terms: parseInt(settings.paymentTerms, 10) || 30,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("company_settings")
      .update(payload)
      .eq("id", existing.id);
    if (error) console.error("Erreur mise à jour settings Supabase:", error);
  } else {
    if (userId) payload.user_id = userId;
    const { error } = await supabase.from("company_settings").insert(payload);
    if (error) console.error("Erreur insertion settings Supabase:", error);
  }
}
