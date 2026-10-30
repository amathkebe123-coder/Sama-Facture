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
    <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-900">
              Factures récentes
            </h3>
            <p className="text-xs text-slate-500">
              Dernières émissions et statuts de règlement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/factures"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-xl transition-colors"
          >
            <span>Voir tout</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
            title="Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
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
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Aperçu"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Télécharger PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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

      {/* Mobile Card List View (< 768px) */}
      <div className="md:hidden divide-y divide-slate-100">
        {invoices.map((inv) => {
          const statusCfg = getInvoiceStatusConfig(inv.status);

          return (
            <div key={inv.id} className="p-4 space-y-2 hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">
                  {inv.invoiceNumber}
                </span>
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
                  <p className="text-[11px] text-slate-400">{inv.product}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 tabular-nums">
                    {formatFCFA(inv.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400">Éch. {inv.dueDate}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 text-xs">
                <button
                  type="button"
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-600 bg-slate-100 rounded-lg"
                >
                  <Download className="w-3 h-3" />
                  PDF
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 px-2.5 py-1 text-emerald-700 bg-emerald-50 rounded-lg font-semibold"
                >
                  <Share2 className="w-3 h-3" />
                  WhatsApp
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

