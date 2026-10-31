"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Receipt,
  Download,
  Share2,
  Eye,
  Filter,
  ArrowUpDown,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useInvoices } from "@/context/InvoiceContext";
import { formatFCFA } from "@/lib/money";
import { getInvoiceStatusConfig, InvoiceStatus } from "@/lib/invoice-status";
import { formatDateFr } from "@/lib/data/fixtures";

export default function InvoicesListPage() {
  const { invoices } = useInvoices();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Filtres par statut avec compteurs
  const statusTabs = [
    { id: "all", label: "Toutes", count: invoices.length },
    {
      id: "paid",
      label: "Payées",
      count: invoices.filter((i) => i.status === "paid").length,
    },
    {
      id: "sent",
      label: "Envoyées",
      count: invoices.filter((i) => i.status === "sent").length,
    },
    {
      id: "overdue",
      label: "En retard",
      count: invoices.filter((i) => i.status === "overdue").length,
    },
    {
      id: "draft",
      label: "Brouillons",
      count: invoices.filter((i) => i.status === "draft").length,
    },
  ];

  // Filtrage combiné : statut + recherche (nom client, email ou n° de facture)
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      selectedStatus === "all" ? true : inv.status === selectedStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      inv.invoiceNumber.toLowerCase().includes(query) ||
      inv.client.name.toLowerCase().includes(query) ||
      inv.client.email.toLowerCase().includes(query) ||
      (inv.lines[0]?.description &&
        inv.lines[0].description.toLowerCase().includes(query));

    return matchesStatus && matchesQuery;
  });

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Factures
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              {invoices.length} factures
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Gérez, filtrez et suivez l&apos;état des règlements de vos clients
          </p>
        </div>

        <Link
          href="/factures/nouvelle"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm hover:shadow shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle facture</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Status Tabs Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-white font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    isActive
                      ? "bg-slate-800 text-slate-200"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input in table bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher client, n° facture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Aucune facture trouvée
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Aucune facture ne correspond à votre filtre actuel. Essayez une autre recherche ou créez une nouvelle facture.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">N° Facture</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Prestation principale</th>
                    <th className="py-3 px-4">Date d&apos;émission</th>
                    <th className="py-3 px-4">Échéance</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Montant TTC</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredInvoices.map((inv) => {
                    const statusCfg = getInvoiceStatusConfig(inv.status);

                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <Link
                            href={`/factures/${inv.id}`}
                            className="hover:text-emerald-600 transition-colors inline-flex items-center gap-1.5"
                          >
                            <span>{inv.invoiceNumber}</span>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/factures/${inv.id}`}
                            className="block group-hover:text-emerald-700"
                          >
                            <span className="font-semibold text-slate-900 block">
                              {inv.client.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {inv.client.city}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[220px] truncate">
                          {inv.lines[0]?.description || "Prestation de services"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {formatDateFr(inv.issueDate)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {formatDateFr(inv.dueDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusCfg.badgeClass}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}
                            />
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          {formatFCFA(inv.total)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              href={`/factures/${inv.id}`}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Voir le détail"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() =>
                                alert(`Téléchargement de la facture ${inv.invoiceNumber}`)
                              }
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Télécharger PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const text = encodeURIComponent(
                                  `Bonjour ${inv.client.name}, voici votre facture ${inv.invoiceNumber} d'un montant de ${formatFCFA(inv.total)}.`
                                );
                                window.open(`https://wa.me/?text=${text}`, "_blank");
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Partager sur WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const statusCfg = getInvoiceStatusConfig(inv.status);

                return (
                  <div key={inv.id} className="p-4 space-y-2 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/factures/${inv.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-emerald-600"
                      >
                        {inv.invoiceNumber}
                      </Link>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.badgeClass}`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${statusCfg.dotClass}`}
                        />
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {inv.client.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {inv.lines[0]?.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 tabular-nums">
                          {formatFCFA(inv.total)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Éch. {formatDateFr(inv.dueDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <Link
                        href={`/factures/${inv.id}`}
                        className="text-xs font-semibold text-emerald-600 hover:underline"
                      >
                        Consulter détail →
                      </Link>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const text = encodeURIComponent(
                              `Bonjour ${inv.client.name}, voici votre facture ${inv.invoiceNumber} (${formatFCFA(inv.total)}).`
                            );
                            window.open(`https://wa.me/?text=${text}`, "_blank");
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-xl"
                        >
                          <Share2 className="w-3 h-3" />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

