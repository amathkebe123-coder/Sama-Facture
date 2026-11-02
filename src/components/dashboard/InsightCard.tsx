"use client";

import React from "react";
import { AlertCircle, ArrowRight, MessageSquare, CheckCircle2 } from "lucide-react";
import { Invoice } from "@/lib/data/fixtures";
import { formatFCFA } from "@/lib/money";

interface InsightCardProps {
  overdueInvoice?: Invoice;
}

export function InsightCard({ overdueInvoice }: InsightCardProps) {
  if (!overdueInvoice) {
    return (
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-[#09150F] border border-[#173022] text-white shadow-sm flex flex-col justify-between w-full">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              Statut Trésorerie
            </span>
          </div>

          <h4 className="text-sm font-bold text-white mb-1">
            Aucun retard d&apos;échéance
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            Toutes vos factures émises sont à jour ou en cours de traitement.
          </p>
        </div>
      </div>
    );
  }

  const clientName = overdueInvoice.client?.name || "Client";
  const amountStr = formatFCFA(overdueInvoice.total);
  const invoiceNum = overdueInvoice.invoiceNumber;

  return (
    <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-[#09150F] border border-[#173022] text-white shadow-sm flex flex-col justify-between w-full">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" />
            Alerte Relance
          </span>
        </div>

        <h4 className="text-sm font-bold text-white mb-1">
          Facture en retard d&apos;échéance
        </h4>

        <p className="text-xs text-slate-300 leading-relaxed">
          Le <span className="font-semibold text-white">{clientName}</span> a un solde impayé de <span className="font-semibold text-emerald-400">{amountStr}</span>.
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#173022]">
        <button
          type="button"
          onClick={() => {
            const msg = encodeURIComponent(
              `Bonjour ${clientName}, rappel concernant la facture ${invoiceNum} d'un montant de ${amountStr} en attente de règlement.`
            );
            window.open(`https://wa.me/?text=${msg}`, "_blank");
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-xl transition-colors shadow-[0_0_12px_rgba(52,211,153,0.3)] min-h-[44px]"
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span className="truncate">Relancer via WhatsApp</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>
    </div>
  );
}
