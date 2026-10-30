"use client";

import React from "react";
import { AlertCircle, ArrowRight, MessageSquare } from "lucide-react";

export function InsightCard() {
  return (
    <div className="relative overflow-hidden p-5 rounded-2xl bg-[#09150F] border border-[#173022] text-white shadow-sm flex flex-col justify-between">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <AlertCircle className="w-3 h-3" />
            Alerte Relance
          </span>
        </div>

        <h4 className="text-sm font-bold text-white mb-1.5">
          1 facture en retard d&apos;échéance
        </h4>

        <p className="text-xs text-slate-300 leading-relaxed">
          Le <span className="font-semibold text-white">Cabinet Sène & Associés</span> a un solde impayé de <span className="font-semibold text-emerald-400">1 450 000 FCFA</span> depuis 15 jours.
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#173022]">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-xl transition-colors shadow-[0_0_12px_rgba(52,211,153,0.3)]"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Relancer via WhatsApp</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

