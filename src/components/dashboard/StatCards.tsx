"use client";

import React from "react";
import { MoreHorizontal, ArrowUpRight, Clock, CheckCircle2, TrendingUp, Receipt } from "lucide-react";
import { formatFCFA } from "@/lib/money";
import { DashboardStats } from "@/lib/data/fixtures";

interface StatCardsProps {
  stats: DashboardStats;
}

export function StatCards({ stats }: StatCardsProps) {
  const overdueCount = stats.overdueCount || 0;
  const collectionRate =
    stats.totalInvoiced > 0
      ? Math.round((stats.totalCollected / stats.totalInvoiced) * 100)
      : 0;

  const cards = [
    {
      title: "Total Facturé",
      value: formatFCFA(stats.totalInvoiced),
      period: "Exercice en cours",
      trend: "Temps réel",
      trendPositive: true,
      icon: TrendingUp,
      iconColor: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Montant Encaissé",
      value: formatFCFA(stats.totalCollected),
      period: "Paiements reçus",
      trend: `${collectionRate}% encaissé`,
      trendPositive: true,
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "En Attente",
      value: formatFCFA(stats.pendingAmount),
      period: `${stats.pendingCount} ${stats.pendingCount <= 1 ? "facture" : "factures"} en cours`,
      trend:
        overdueCount > 0
          ? `${overdueCount} en retard`
          : stats.pendingCount === 0
          ? "À jour"
          : "En cours",
      trendPositive: overdueCount === 0,
      icon: Clock,
      iconColor: "text-amber-600 bg-amber-50",
    },
    {
      title: "Factures Émises",
      value: `${stats.invoiceCount}`,
      period: "Total créé",
      trend: `${stats.invoiceCount} ${stats.invoiceCount <= 1 ? "facture" : "factures"}`,
      trendPositive: true,
      icon: Receipt,
      iconColor: "text-blue-600 bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full">
      {cards.map((card, idx) => {
        return (
          <div
            key={idx}
            className="flex flex-col justify-between p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-200/80 transition-all duration-150 w-full"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                {card.title}
              </span>
              <button
                type="button"
                className="p-1.5 -mr-1 text-slate-300 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
                aria-label="Plus d'options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums block truncate">
                {card.value}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-50">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
                {card.period}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold rounded-full shrink-0 ${
                  card.trendPositive
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100/80"
                    : "bg-rose-50 text-rose-600 border border-rose-100/80"
                }`}
              >
                <ArrowUpRight className="w-3 h-3" />
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
