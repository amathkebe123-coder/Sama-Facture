"use client";

import React from "react";
import { formatFCFA } from "@/lib/money";
import { MOCK_PAYMENT_CHANNELS } from "@/lib/data/fixtures";

export function PaymentChannels() {
  return (
    <div className="p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between w-full">
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-wider">
          Canaux d&apos;encaissement
        </h4>
        <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">Ce mois-ci</span>
      </div>

      {/* Progress bar multi-segments */}
      <div className="w-full h-2.5 flex rounded-full overflow-hidden bg-slate-100 gap-0.5 mb-3.5">
        {MOCK_PAYMENT_CHANNELS.map((channel) => (
          <div
            key={channel.name}
            style={{
              width: `${channel.percentage}%`,
              backgroundColor: channel.color,
            }}
            title={`${channel.name}: ${channel.percentage}%`}
            className="h-full transition-all duration-300"
          />
        ))}
      </div>

      {/* Details list */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {MOCK_PAYMENT_CHANNELS.map((channel) => (
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
