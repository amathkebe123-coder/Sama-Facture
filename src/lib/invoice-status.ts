export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "partial";

export interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const INVOICE_STATUS_MAP: Record<InvoiceStatus, StatusConfig> = {
  paid: {
    label: "Payée",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    dotClass: "bg-emerald-500",
  },
  sent: {
    label: "Envoyée",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60",
    dotClass: "bg-amber-500",
  },
  overdue: {
    label: "En retard",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/60",
    dotClass: "bg-rose-500",
  },
  draft: {
    label: "Brouillon",
    badgeClass: "bg-slate-50 text-slate-600 border-slate-200/70",
    dotClass: "bg-slate-400",
  },
  partial: {
    label: "Partielle",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200/60",
    dotClass: "bg-blue-500",
  },
};

export function getInvoiceStatusConfig(status: InvoiceStatus): StatusConfig {
  return INVOICE_STATUS_MAP[status] ?? INVOICE_STATUS_MAP.draft;
}

