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
  const currentMonthIdx = data.findIndex((d) => d.isCurrent);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(
    currentMonthIdx >= 0 ? currentMonthIdx : null
  );

  const highestVal = Math.max(...data.map((d) => Math.max(d.facturé, d.encaissé)), 0);
  const hasAnyData = highestVal > 0;
  const maxVal = hasAnyData ? Math.max(Math.ceil(highestVal / 500000) * 500000, 1000000) : 1000000;

  const formatGuide = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace(".0", "")}M`;
    if (val >= 1000) return `${Math.round(val / 1000)}k`;
    return "0";
  };

  return (
    <div className="flex flex-col justify-between p-4 sm:p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] w-full overflow-hidden">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Évolution du Chiffre d&apos;Affaires
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Facturé vs Encaissé en temps réel
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-medium flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400 shrink-0" />
            <span className="text-slate-600">Facturé (Mois courant)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 shrink-0" />
            <span className="text-slate-400">Périodes antérieures</span>
          </div>
        </div>
      </div>

      {/* Histogram SVG Chart */}
      <div className="relative w-full h-[210px] sm:h-[240px] pt-3">
        {/* Y Axis Guide lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] sm:text-[10px] text-slate-400 font-medium pb-5">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-0.5">
            <span>{formatGuide(maxVal)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-0.5">
            <span>{formatGuide(maxVal * 0.75)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-0.5">
            <span>{formatGuide(maxVal * 0.5)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-0.5">
            <span>{formatGuide(maxVal * 0.25)}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
            <span>0</span>
          </div>
        </div>

        {/* Bars Container */}
        <div className="relative h-full flex items-end justify-between px-1 sm:px-4 md:px-6 z-10 gap-0.5 sm:gap-1">
          {data.map((item, index) => {
            const heightPercent = item.facturé > 0 ? (item.facturé / maxVal) * 100 : 4;
            const isHovered = hoveredIndex === index;
            const isCurrent = item.isCurrent;

            return (
              <div
                key={item.month}
                className="relative flex flex-col items-center flex-1 h-full justify-end cursor-pointer group"
                onClick={() => setHoveredIndex(index)}
                onMouseEnter={() => setHoveredIndex(index)}
              >
                {/* Floating tooltip on hover / active */}
                {isHovered && item.facturé > 0 && (
                  <div className="absolute -top-12 z-30 flex flex-col px-2.5 py-1 bg-slate-900/95 backdrop-blur-sm text-white rounded-xl shadow-xl text-left pointer-events-none whitespace-nowrap border border-slate-700/60 max-w-[160px]">
                    <span className="text-[9px] text-slate-400">
                      {item.month} 2026
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400">
                      {formatFCFA(item.facturé)}
                    </span>
                  </div>
                )}

                {/* The Bar */}
                <div className="w-full max-w-[18px] sm:max-w-[26px] md:max-w-[32px] mx-auto flex items-end justify-center h-full pb-5">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md sm:rounded-t-lg transition-all duration-300 ${
                      isCurrent
                        ? "bg-gradient-to-t from-emerald-500/20 via-emerald-400/80 to-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)] relative overflow-hidden"
                        : item.facturé > 0
                        ? "bg-slate-200 group-hover:bg-slate-300 active:bg-slate-300"
                        : "bg-slate-100/50"
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-emerald-400" />
                    )}
                  </div>
                </div>

                {/* X Axis Label */}
                <span
                  className={`absolute bottom-0 text-[9px] sm:text-[11px] font-semibold transition-colors ${
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
