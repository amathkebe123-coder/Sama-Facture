"use client";

import React, { useState } from "react";
import { BarChart3, Calendar } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { DatePicker } from "@/components/ui/DatePicker";
import { formatFCFA } from "@/lib/money";
import { useInvoices } from "@/context/InvoiceContext";

export default function ReportsPage() {
  const { invoices } = useInvoices();
  const [filterDate, setFilterDate] = useState<string>("");

  // Filtrer les factures (exclure les brouillons pour la compta)
  const nonDraftInvoices = invoices.filter((i) => i.status !== "draft");

  const totalCA = nonDraftInvoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalHT = nonDraftInvoices.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalTVA = nonDraftInvoices.reduce((acc, curr) => acc + curr.taxTotal, 0);

  // Groupement mensuel dynamique
  const monthlyGroups: Record<string, { caHT: number; tva: number; caTTC: number }> = {};

  for (const inv of nonDraftInvoices) {
    if (inv.issueDate) {
      const d = new Date(inv.issueDate);
      if (!isNaN(d.getTime())) {
        const monthKey = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
        const capitalized = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
        if (!monthlyGroups[capitalized]) {
          monthlyGroups[capitalized] = { caHT: 0, tva: 0, caTTC: 0 };
        }
        monthlyGroups[capitalized].caHT += inv.subtotal;
        monthlyGroups[capitalized].tva += inv.taxTotal;
        monthlyGroups[capitalized].caTTC += inv.total;
      }
    }
  }

  const monthsData = Object.entries(monthlyGroups).map(([month, data]) => ({
    month,
    caHT: data.caHT,
    tva: data.tva,
    caTTC: data.caTTC,
  }));

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Rapports & TVA
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              TVA 18% Sénégal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Synthèse comptable pour vos déclarations fiscales
          </p>
        </div>
        <div className="w-full sm:w-56 shrink-0">
          <DatePicker
            placeholder="Période comptable"
            value={filterDate}
            onChange={setFilterDate}
            size="sm"
            align="right"
          />
        </div>
      </div>

      {/* KPI 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
        <div className="p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total CA Réalisé TTC
          </span>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2 tabular-nums">
            {formatFCFA(totalCA)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">
            Exercice en cours
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Base HT
          </span>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2 tabular-nums">
            {formatFCFA(totalHT)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">
            Chiffre d&apos;affaires taxable
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            TVA 18% Collectée
          </span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1 sm:mt-2 tabular-nums">
            {formatFCFA(totalTVA)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 block">
            À déclarer à la DGID
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden w-full">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Décomposition mensuelle
            </h3>
          </div>
        </div>

        {/* Desktop Table View (>= 768px) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Période</th>
                <th className="py-3 px-4 text-right">Chiffre d&apos;affaires HT</th>
                <th className="py-3 px-4 text-right">TVA 18% collectée</th>
                <th className="py-3 px-4 text-right">Chiffre d&apos;affaires TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {monthsData.length > 0 ? (
                monthsData.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.month}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700 tabular-nums">
                      {formatFCFA(m.caHT)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800 tabular-nums">
                      {formatFCFA(m.tva)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 tabular-nums">
                      {formatFCFA(m.caTTC)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                    Aucune facture émise pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (< 768px) */}
        <div className="md:hidden divide-y divide-slate-100">
          {monthsData.length > 0 ? (
            monthsData.map((m, idx) => (
              <div key={idx} className="p-3.5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900">{m.month}</span>
                  <span className="font-bold text-xs text-emerald-600 tabular-nums">
                    {formatFCFA(m.caTTC)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Base HT : {formatFCFA(m.caHT)}</span>
                  <span>TVA : {formatFCFA(m.tva)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              Aucune facture émise pour le moment
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
