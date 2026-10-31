"use client";

import React from "react";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { formatFCFA } from "@/lib/money";

export default function PaymentsPage() {
  const dummyPayments = [
    {
      id: "pay-1",
      invoiceNumber: "FAC-2026-0042",
      client: "Teranga Tech Solutions",
      amount: 3250000,
      method: "Wave Business",
      date: "28/10/2026",
      ref: "WAV-SN-98234-A",
      status: "Confirmé",
    },
    {
      id: "pay-2",
      invoiceNumber: "FAC-2026-0039",
      client: "Dakar Logistique Express",
      amount: 2100000,
      method: "Wave Business",
      date: "20/10/2026",
      ref: "WAV-SN-78119-K",
      status: "Confirmé",
    },
    {
      id: "pay-3",
      invoiceNumber: "FAC-2026-0035",
      client: "Baobab Digital Agency",
      amount: 1850000,
      method: "Orange Money Marchand",
      date: "14/10/2026",
      ref: "OM-SN-44301-D",
      status: "Confirmé",
    },
  ];

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Paiements & Encaissements
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              {dummyPayments.length} reçus
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Historique certifié des règlements Mobile Money et virements
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden w-full">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Derniers encaissements
            </h3>
          </div>
        </div>

        {/* Desktop Table View (>= 768px) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Facture</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Montant encaissé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {dummyPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {p.client}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {p.ref}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{p.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600 tabular-nums">
                    {formatFCFA(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View (< 768px) */}
        <div className="md:hidden divide-y divide-slate-100">
          {dummyPayments.map((p) => (
            <div key={p.id} className="p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-slate-900">
                  {p.invoiceNumber}
                </span>
                <span className="font-bold text-xs text-emerald-700 tabular-nums">
                  {formatFCFA(p.amount)}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {p.client}
              </p>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                  {p.method}
                </span>
                <span>{p.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
