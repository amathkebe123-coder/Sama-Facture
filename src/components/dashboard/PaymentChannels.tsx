"use client";

import React from "react";
import { formatFCFA } from "@/lib/money";
import { PaymentItem } from "@/lib/supabase-db";
import { Invoice } from "@/lib/data/fixtures";

interface PaymentChannelsProps {
  payments?: PaymentItem[];
  invoices?: Invoice[];
}

export function PaymentChannels({ payments = [], invoices = [] }: PaymentChannelsProps) {
  // Calculer la répartition par canal
  const channels = [
    { name: "Wave", color: "#1DC8F3", match: ["wave"] },
    { name: "Orange Money", color: "#FF7900", match: ["orange", "om"] },
    { name: "Virement Bancaire", color: "#10B981", match: ["virement", "banque", "boa", "cbao"] },
    { name: "Espèces / Autre", color: "#64748B", match: ["espèces", "especes", "cash", "chèque", "cheque"] },
  ];

  // Si on a des paiements ou factures réels
  const channelSums: Record<string, number> = {
    Wave: 0,
    "Orange Money": 0,
    "Virement Bancaire": 0,
    "Espèces / Autre": 0,
  };

  let totalAmount = 0;

  if (payments.length > 0) {
    for (const p of payments) {
      totalAmount += p.amount;
      const lower = (p.method || "").toLowerCase();
      if (lower.includes("wave")) channelSums["Wave"] += p.amount;
      else if (lower.includes("orange") || lower.includes("om")) channelSums["Orange Money"] += p.amount;
      else if (lower.includes("virement")) channelSums["Virement Bancaire"] += p.amount;
      else channelSums["Espèces / Autre"] += p.amount;
    }
  } else if (invoices.length > 0) {
    for (const inv of invoices) {
      totalAmount += inv.total;
      const lower = (inv.channel || "").toLowerCase();
      if (lower.includes("wave")) channelSums["Wave"] += inv.total;
      else if (lower.includes("orange") || lower.includes("om")) channelSums["Orange Money"] += inv.total;
      else if (lower.includes("virement")) channelSums["Virement Bancaire"] += inv.total;
      else channelSums["Espèces / Autre"] += inv.total;
    }
  }

  const computedChannels = channels.map((c) => {
    const amount = channelSums[c.name] || 0;
    const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
    return {
      name: c.name,
      amount,
      percentage,
      color: c.color,
    };
  });

  return (
    <div className="p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between w-full">
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider">
          Canaux d&apos;encaissement
        </h4>
        <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">En temps réel</span>
      </div>

      {/* Progress bar multi-segments */}
      <div className="w-full h-2.5 flex rounded-full overflow-hidden bg-slate-100 gap-0.5 mb-3.5">
        {totalAmount > 0 ? (
          computedChannels.map((channel) => (
            channel.percentage > 0 && (
              <div
                key={channel.name}
                style={{
                  width: `${channel.percentage}%`,
                  backgroundColor: channel.color,
                }}
                title={`${channel.name}: ${channel.percentage}%`}
                className="h-full transition-all duration-300"
              />
            )
          ))
        ) : (
          <div className="w-full h-full bg-slate-100" />
        )}
      </div>

      {/* Details list */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {computedChannels.map((channel) => (
          <div key={channel.name} className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: channel.color }}
              />
              <span className="text-[11px] sm:text-xs font-medium text-slate-600 truncate">
                {channel.name}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-900 ml-auto shrink-0">
                {channel.percentage}%
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 pl-3.5 tabular-nums truncate">
              {formatFCFA(channel.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
