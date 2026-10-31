"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  ArrowUpRight,
  Receipt,
  Download,
  Share2,
  Eye,
  ChevronRight,
} from "lucide-react";
import { formatFCFA } from "@/lib/money";
import { getInvoiceStatusConfig } from "@/lib/invoice-status";
import { InvoiceItem } from "@/lib/data/fixtures";

interface RecentInvoicesTableProps {
  invoices: InvoiceItem[];
}

export function RecentInvoicesTable({ invoices }: RecentInvoicesTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(invoices.map((inv) => inv.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden w-full">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-900">
              Factures récentes
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Dernières émissions et règlements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/factures"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-xl transition-colors min-h-[36px]"
          >
            <span>Voir tout</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === invoices.length && invoices.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="py-3 px-4">N° Facture</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Prestation</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Échéance</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Montant</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {invoices.map((inv) => {
              const statusCfg = getInvoiceStatusConfig(inv.status);
              const isSelected = selectedIds.includes(inv.id);

              return (
                <tr
                  key={inv.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? "bg-emerald-50/30" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(inv.id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                    <Link
                      href={`/factures/${inv.id}`}
                      className="hover:text-emerald-600 hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">
                        {inv.client.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {inv.client.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">
                    {inv.product}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {inv.date}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {inv.dueDate}
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
                    {formatFCFA(inv.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/factures/${inv.id}`}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Aperçu"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const text = encodeURIComponent(
                            `Bonjour ${inv.client.name}, voici votre facture ${inv.invoiceNumber} d'un montant de ${formatFCFA(inv.amount)}.`
                          );
                          window.open(`https://wa.me/?text=${text}`, "_blank");
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Partager WhatsApp"
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

      {/* Mobile Card List View (< 768px) - Ergonomie 100% pensée pour téléphone */}
      <div className="md:hidden divide-y divide-slate-100">
        {invoices.map((inv) => {
          const statusCfg = getInvoiceStatusConfig(inv.status);

          return (
            <div key={inv.id} className="p-3.5 sm:p-4 space-y-2.5 hover:bg-slate-50/70 transition-colors">
              {/* Header card : Numéro + Statut */}
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

              {/* Client & Prestation */}
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {inv.client.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {inv.product}
                </p>
              </div>

              {/* Montant & Date */}
              <div className="flex justify-between items-baseline pt-1 border-t border-slate-50">
                <span className="text-[10px] text-slate-400">
                  Éch. {inv.dueDate}
                </span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {formatFCFA(inv.amount)}
                </span>
              </div>

              {/* Actions tactiles confortables (min-h 44px) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href={`/factures/${inv.id}`}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 active:bg-slate-200 rounded-xl min-h-[44px] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Détail</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const text = encodeURIComponent(
                      `Bonjour ${inv.client.name}, voici votre facture ${inv.invoiceNumber} (${formatFCFA(inv.amount)}).`
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
    </div>
  );
}
