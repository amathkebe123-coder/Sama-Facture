"use client";

import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { formatFCFA } from "@/lib/money";

interface ChartItem {
  month: string;
  facturé: number;
  encaissé: number;
  isCurrent?: boolean;
}

interface RevenueChartProps {
  data: ChartItem[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(6); // Default on Juillet (current)

  const maxVal = Math.max(...data.map((d) => Math.max(d.facturé, d.encaissé)), 4500000);

  return (
    <div className="flex flex-col justify-between p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Évolution du Chiffre d&apos;Affaires
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Comparaison entre montants facturés et montants réellement encaissés
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400" />
            <span className="text-slate-600">Facturé (Mois en cours)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" />
            <span className="text-slate-400">Périodes antérieures</span>
          </div>
        </div>
      </div>

      {/* Histogram SVG Chart */}
      <div className="relative w-full h-[240px] pt-4">
        {/* Y Axis Guide lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-medium">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-1">
            <span>4,0M</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-1">
            <span>3,0M</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-1">
            <span>2,0M</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-1">
            <span>1,0M</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <span>0 FCFA</span>
          </div>
        </div>

        {/* Bars Container */}
        <div className="relative h-full flex items-end justify-between px-6 z-10">
          {data.map((item, index) => {
            const heightPercent = item.facturé > 0 ? (item.facturé / maxVal) * 100 : 4;
            const isHovered = hoveredIndex === index;
            const isCurrent = item.isCurrent;

            return (
              <div
                key={item.month}
                className="relative flex flex-col items-center flex-1 h-full justify-end cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(index)}
              >
                {/* Floating tooltip on hover / active */}
                {isHovered && item.facturé > 0 && (
                  <div className="absolute -top-14 z-30 flex flex-col px-3 py-1.5 bg-slate-900/95 backdrop-blur-sm text-white rounded-xl shadow-xl text-left pointer-events-none whitespace-nowrap border border-slate-700/60 transition-all">
                    <span className="text-[10px] font-medium text-slate-400">
                      {item.month} 2026
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {formatFCFA(item.facturé)}
                    </span>
                    <span className="text-[10px] text-slate-300">
                      Encaissé : {formatFCFA(item.encaissé)}
                    </span>
                  </div>
                )}

                {/* The Bar */}
                <div className="w-full max-w-[32px] mx-auto flex items-end justify-center h-full pb-6">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isCurrent
                        ? "bg-gradient-to-t from-emerald-500/20 via-emerald-400/80 to-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.35)] relative overflow-hidden"
                        : item.facturé > 0
                        ? "bg-slate-200 group-hover:bg-slate-300"
                        : "bg-slate-100/60"
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-emerald-400" />
                    )}
                  </div>
                </div>

                {/* X Axis Label */}
                <span
                  className={`absolute bottom-0 text-[11px] font-semibold transition-colors ${
                    isCurrent
                      ? "text-emerald-700 font-bold"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

