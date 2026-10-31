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
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useInvoices } from "@/context/InvoiceContext";
import { formatFCFA } from "@/lib/money";
import { getInvoiceStatusConfig } from "@/lib/invoice-status";
import { formatDateFr } from "@/lib/data/fixtures";

export default function InvoicesListPage() {
  const { invoices } = useInvoices();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Factures
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              {invoices.length} factures
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Suivi des règlements et émissions de l&apos;entreprise
          </p>
        </div>

        <Link
          href="/factures/nouvelle"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle facture</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-3 bg-white p-3 sm:p-4 border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] w-full">
        {/* Status Tabs Pills with smooth horizontal scrolling */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 touch-pan-x">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[36px] ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200"
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

        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher client, n° facture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden w-full">
        {filteredInvoices.length === 0 ? (
          <div className="py-14 text-center px-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Aucune facture trouvée
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Aucune facture ne correspond à vos critères.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto w-full">
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
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Voir le détail"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                const text = encodeURIComponent(
                                  `Bonjour ${inv.client.name}, voici votre facture ${inv.invoiceNumber} d'un montant de ${formatFCFA(inv.total)}.`
                                );
                                window.open(`https://wa.me/?text=${text}`, "_blank");
                              }}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
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

            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const statusCfg = getInvoiceStatusConfig(inv.status);

                return (
                  <div key={inv.id} className="p-3.5 sm:p-4 space-y-2.5 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/factures/${inv.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-emerald-600 flex items-center gap-1"
                      >
                        <span>{inv.invoiceNumber}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.badgeClass}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}
                        />
                        {statusCfg.label}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {inv.client.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {inv.lines[0]?.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-baseline pt-1 border-t border-slate-50">
                      <span className="text-[10px] text-slate-400">
                        Éch. {formatDateFr(inv.dueDate)}
                      </span>
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {formatFCFA(inv.total)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/factures/${inv.id}`}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 active:bg-slate-200 rounded-xl min-h-[44px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Consulter</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const text = encodeURIComponent(
                            `Bonjour ${inv.client.name}, voici votre facture ${inv.invoiceNumber} (${formatFCFA(inv.total)}).`
                          );
                          window.open(`https://wa.me/?text=${text}`, "_blank");
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 active:bg-emerald-100 rounded-xl min-h-[44px] transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>
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
