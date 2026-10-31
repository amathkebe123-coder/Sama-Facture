"use client";

import React from "react";
import { BarChart3, Calendar } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { formatFCFA } from "@/lib/money";

export default function ReportsPage() {
  const monthsData = [
    { month: "Juillet 2026", caHT: 3559322, tva: 640678, caTTC: 4200000 },
    { month: "Juin 2026", caHT: 2372881, tva: 427119, caTTC: 2800000 },
    { month: "Mai 2026", caHT: 2881356, tva: 518644, caTTC: 3400000 },
    { month: "Avril 2026", caHT: 2457627, tva: 442373, caTTC: 2900000 },
  ];

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
      </div>

      {/* KPI 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
        <div className="p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total CA Réalisé TTC
          </span>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2 tabular-nums">
            {formatFCFA(18450000)}
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
            {formatFCFA(15635593)}
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
            {formatFCFA(2814407)}
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
              {monthsData.map((m, idx) => (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View (< 768px) */}
        <div className="md:hidden divide-y divide-slate-100">
          {monthsData.map((m, idx) => (
            <div key={idx} className="p-3.5 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{m.month}</span>
                </span>
                <span className="font-bold text-xs text-emerald-700 tabular-nums">
                  {formatFCFA(m.caTTC)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                <span>HT: {formatFCFA(m.caHT)}</span>
                <span className="font-semibold text-slate-700">TVA: {formatFCFA(m.tva)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
