import { InvoiceStatus } from "../invoice-status";

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
  date: string;       // Format JJ/MM/AAAA
  dueDate: string;    // Format JJ/MM/AAAA
  amount: number;     // En FCFA
  status: InvoiceStatus;
}

export interface DashboardStats {
  totalInvoiced: number;       // Total facturé
  totalInvoicedTrend: number;
  totalCollected: number;      // Encaissé
  totalCollectedTrend: number;
  pendingAmount: number;       // En attente
  pendingCount: number;
  invoiceCount: number;        // Nombre de factures
  invoiceCountTrend: number;
}

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalInvoiced: 18450000,
  totalInvoicedTrend: 12.4,
  totalCollected: 14200000,
  totalCollectedTrend: 8.6,
  pendingAmount: 4250000,
  pendingCount: 6,
  invoiceCount: 42,
  invoiceCountTrend: 15.2,
};

export const MOCK_REVENUE_TREND = [
  { month: "Jan", facturé: 1200000, encaissé: 1100000 },
  { month: "Fév", facturé: 1850000, encaissé: 1600000 },
  { month: "Mar", facturé: 2100000, encaissé: 1950000 },
  { month: "Avr", facturé: 2900000, encaissé: 2400000 },
  { month: "Mai", facturé: 3400000, encaissé: 3100000 },
  { month: "Juin", facturé: 2800000, encaissé: 2650000 },
  { month: "Juil", facturé: 4200000, encaissé: 3800000, isCurrent: true },
  { month: "Août", facturé: 0, encaissé: 0 },
  { month: "Sep", facturé: 0, encaissé: 0 },
  { month: "Oct", facturé: 0, encaissé: 0 },
  { month: "Nov", facturé: 0, encaissé: 0 },
  { month: "Déc", facturé: 0, encaissé: 0 },
];

export const MOCK_PAYMENT_CHANNELS = [
  { name: "Wave", percentage: 48, amount: 6816000, color: "#1DC8F3" },
  { name: "Orange Money", percentage: 32, amount: 4544000, color: "#FF7900" },
  { name: "Virement Bancaire", percentage: 15, amount: 2130000, color: "#10B981" },
  { name: "Espèces", percentage: 5, amount: 710000, color: "#64748B" },
];

export const MOCK_RECENT_INVOICES: InvoiceItem[] = [
  {
    id: "inv-1",
    invoiceNumber: "FAC-2026-0042",
    client: {
      name: "Teranga Tech Solutions",
      email: "facturation@terangatech.sn",
    },
    product: "Refonte Plateforme Web & API",
    channel: "Wave",
    date: "28/10/2026",
    dueDate: "27/11/2026",
    amount: 3250000,
    status: "paid",
  },
  {
    id: "inv-2",
    invoiceNumber: "FAC-2026-0041",
    client: {
      name: "Baobab Digital Agency",
      email: "contact@baobabdigital.sn",
    },
    product: "Accompagnement Stratégie SEO",
    channel: "Orange Money",
    date: "24/10/2026",
    dueDate: "08/11/2026",
    amount: 850000,
    status: "sent",
  },
  {
    id: "inv-3",
    invoiceNumber: "FAC-2026-0040",
    client: {
      name: "Cabinet Sène & Associés",
      email: "compta@sene-avocats.sn",
    },
    product: "Maintenance & Infogérance Q3",
    channel: "Virement",
    date: "15/09/2026",
    dueDate: "15/10/2026",
    amount: 1450000,
    status: "overdue",
  },
  {
    id: "inv-4",
    invoiceNumber: "FAC-2026-0039",
    client: {
      name: "Dakar Logistique Express",
      email: "direction@dakarlogistique.com",
    },
    product: "Intégration Passerelle Mobile Money",
    channel: "Wave",
    date: "20/10/2026",
    dueDate: "19/11/2026",
    amount: 2100000,
    status: "paid",
  },
  {
    id: "inv-5",
    invoiceNumber: "FAC-2026-0038",
    client: {
      name: "Keur Jaraaf Éco-Lodge",
      email: "info@keurjaraaf.sn",
    },
    product: "Création Charte Graphique & Print",
    channel: "Espèces",
    date: "29/10/2026",
    dueDate: "14/11/2026",
    amount: 600000,
    status: "draft",
  },
  {
    id: "inv-6",
    invoiceNumber: "FAC-2026-0037",
    client: {
      name: "Sénégal Agro Export",
      email: "commercial@senegalagro.sn",
    },
    product: "Audit et Sécurité Système",
    channel: "Virement",
    date: "10/10/2026",
    dueDate: "09/11/2026",
    amount: 1950000,
    status: "sent",
  },
];

