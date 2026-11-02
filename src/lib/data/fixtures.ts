import { InvoiceStatus } from "../invoice-status";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  totalInvoiced?: number;
  totalPaid?: number;
  invoiceCount?: number;
}

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // en FCFA
  taxRate: number;   // 18% par défaut
  lineTotal: number; // arrondi entier HT
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  client: {
    name: string;
    email: string;
    avatar?: string;
  };
  product: string;
  channel: string;
  date: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: Client;
  issueDate: string;  // AAAA-MM-JJ pour input et converti en JJ/MM/AAAA pour affichage
  dueDate: string;    // AAAA-MM-JJ ou JJ/MM/AAAA
  channel: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotal: number;   // Somme HT
  taxRate: number;    // 18% par défaut
  taxTotal: number;   // TVA 18%
  total: number;      // Total TTC
  notes?: string;
  paymentTerms?: string;
}

export interface DashboardStats {
  totalInvoiced: number;
  totalInvoicedTrend: number;
  totalCollected: number;
  totalCollectedTrend: number;
  pendingAmount: number;
  pendingCount: number;
  overdueCount?: number;
  invoiceCount: number;
  invoiceCountTrend: number;
}

export function formatDateFr(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("/")) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
