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
  taxRate: number;   // 18%
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
  invoiceCount: number;
  invoiceCountTrend: number;
}

export const INITIAL_CLIENTS: Client[] = [
  {
    id: "cli-1",
    name: "Teranga Tech Solutions",
    email: "facturation@terangatech.sn",
    phone: "+221 33 821 45 67",
    address: "12 Avenue Léopold Sédar Senghor",
    city: "Dakar Plateau",
    totalInvoiced: 6500000,
    totalPaid: 6500000,
    invoiceCount: 4,
  },
  {
    id: "cli-2",
    name: "Baobab Digital Agency",
    email: "contact@baobabdigital.sn",
    phone: "+221 77 654 32 10",
    address: "Route des Almadies, Immeuble Kébé",
    city: "Dakar Almadies",
    totalInvoiced: 2700000,
    totalPaid: 1850000,
    invoiceCount: 3,
  },
  {
    id: "cli-3",
    name: "Cabinet Sène & Associés",
    email: "compta@sene-avocats.sn",
    phone: "+221 33 864 12 00",
    address: "Boulevard Martin Luther King",
    city: "Fann Résidence",
    totalInvoiced: 3200000,
    totalPaid: 1750000,
    invoiceCount: 2,
  },
  {
    id: "cli-4",
    name: "Dakar Logistique Express",
    email: "direction@dakarlogistique.com",
    phone: "+221 78 123 45 67",
    address: "Zone Franche Industrielle, Môle 2",
    city: "Port de Dakar",
    totalInvoiced: 4200000,
    totalPaid: 4200000,
    invoiceCount: 2,
  },
  {
    id: "cli-5",
    name: "Keur Jaraaf Éco-Lodge",
    email: "info@keurjaraaf.sn",
    phone: "+221 70 987 65 43",
    address: "Falaises de Toubab Dialaw",
    city: "Toubab Dialaw",
    totalInvoiced: 1200000,
    totalPaid: 600000,
    invoiceCount: 2,
  },
  {
    id: "cli-6",
    name: "Sénégal Agro Export",
    email: "commercial@senegalagro.sn",
    phone: "+221 33 951 23 45",
    address: "Route de Sindia, Zone Agro-Industrielle",
    city: "Thiès",
    totalInvoiced: 3900000,
    totalPaid: 1950000,
    invoiceCount: 2,
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "FAC-2026-0042",
    client: INITIAL_CLIENTS[0]!,
    issueDate: "2026-10-28",
    dueDate: "2026-11-27",
    channel: "Wave",
    status: "paid",
    lines: [
      {
        id: "l-1",
        description: "Développement Application Web & API Node.js",
        quantity: 1,
        unitPrice: 2200000,
        taxRate: 18,
        lineTotal: 2200000,
      },
      {
        id: "l-2",
        description: "Intégration Paiement Mobile Wave & Orange Money",
        quantity: 1,
        unitPrice: 554237,
        taxRate: 18,
        lineTotal: 554237,
      },
    ],
    subtotal: 2754237,
    taxRate: 18,
    taxTotal: 495763,
    total: 3250000,
    notes: "Paiement reçu intégralement par virement Wave. Merci pour votre confiance.",
    paymentTerms: "Paiement à 30 jours à compter de la date d'émission.",
  },
  {
    id: "inv-2",
    invoiceNumber: "FAC-2026-0041",
    client: INITIAL_CLIENTS[1]!,
    issueDate: "2026-10-24",
    dueDate: "2026-11-08",
    channel: "Orange Money",
    status: "sent",
    lines: [
      {
        id: "l-3",
        description: "Stratégie de Contenu & SEO Sénégal (Pack Q4)",
        quantity: 1,
        unitPrice: 720339,
        taxRate: 18,
        lineTotal: 720339,
      },
    ],
    subtotal: 720339,
    taxRate: 18,
    taxTotal: 129661,
    total: 850000,
    notes: "Règlement attendu sur notre compte Orange Money marchand.",
    paymentTerms: "Paiement à 15 jours.",
  },
  {
    id: "inv-3",
    invoiceNumber: "FAC-2026-0040",
    client: INITIAL_CLIENTS[2]!,
    issueDate: "2026-09-15",
    dueDate: "2026-10-15",
    channel: "Virement",
    status: "overdue",
    lines: [
      {
        id: "l-4",
        description: "Infogérance des serveurs sécurisés & sauvegardes cloud",
        quantity: 3,
        unitPrice: 409605,
        taxRate: 18,
        lineTotal: 1228814,
      },
    ],
    subtotal: 1228814,
    taxRate: 18,
    taxTotal: 221186,
    total: 1450000,
    notes: "Échéance dépassée de 15 jours. Prière de régulariser sous 48h.",
    paymentTerms: "Paiement comptant à réception.",
  },
  {
    id: "inv-4",
    invoiceNumber: "FAC-2026-0039",
    client: INITIAL_CLIENTS[3]!,
    issueDate: "2026-10-20",
    dueDate: "2026-11-19",
    channel: "Wave",
    status: "paid",
    lines: [
      {
        id: "l-5",
        description: "Paramétrage passerelle douanière temps-réel",
        quantity: 1,
        unitPrice: 1779661,
        taxRate: 18,
        lineTotal: 1779661,
      },
    ],
    subtotal: 1779661,
    taxRate: 18,
    taxTotal: 320339,
    total: 2100000,
    notes: "Reçu avec succès par Wave Business.",
  },
  {
    id: "inv-5",
    invoiceNumber: "FAC-2026-0038",
    client: INITIAL_CLIENTS[4]!,
    issueDate: "2026-10-29",
    dueDate: "2026-11-14",
    channel: "Espèces",
    status: "draft",
    lines: [
      {
        id: "l-6",
        description: "Conception plaquette commerciale & flyers éco-tourisme",
        quantity: 2,
        unitPrice: 254237,
        taxRate: 18,
        lineTotal: 508475,
      },
    ],
    subtotal: 508475,
    taxRate: 18,
    taxTotal: 91525,
    total: 600000,
    notes: "Brouillon en attente de validation des maquettes.",
  },
  {
    id: "inv-6",
    invoiceNumber: "FAC-2026-0037",
    client: INITIAL_CLIENTS[5]!,
    issueDate: "2026-10-10",
    dueDate: "2026-11-09",
    channel: "Virement",
    status: "sent",
    lines: [
      {
        id: "l-7",
        description: "Audit d'infrastructure réseau & cybersécurité",
        quantity: 1,
        unitPrice: 1652542,
        taxRate: 18,
        lineTotal: 1652542,
      },
    ],
    subtotal: 1652542,
    taxRate: 18,
    taxTotal: 297458,
    total: 1950000,
    notes: "À régler par virement bancaire sur notre compte BOA Sénégal.",
  },
];

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

// Compatibilité descendante pour l'ancien tableau
export const MOCK_RECENT_INVOICES = INITIAL_INVOICES.map((inv) => ({
  id: inv.id,
  invoiceNumber: inv.invoiceNumber,
  client: {
    name: inv.client.name,
    email: inv.client.email,
  },
  product: inv.lines[0]?.description || "Prestation de service",
  channel: inv.channel,
  date: formatDateFr(inv.issueDate),
  dueDate: formatDateFr(inv.dueDate),
  amount: inv.total,
  status: inv.status,
}));

export function formatDateFr(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("/")) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
