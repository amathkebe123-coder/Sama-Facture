"use client";

import React from "react";
import { MessageSquare, BookOpen, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export default function HelpPage() {
  const faqs = [
    {
      q: "Comment fonctionne la TVA sénégalaise à 18% sur Sama Facture ?",
      a: "Toutes les lignes de facture appliquent automatiquement le taux de TVA standard de 18% conformément au code général des impôts sénégalais. Les montants HT, TVA et TTC sont calculés avec arrondi entier.",
    },
    {
      q: "Comment partager une facture directement sur WhatsApp ?",
      a: "Sur chaque facture, cliquez sur le bouton 'WhatsApp' : un message pré-formaté avec le numéro de facture, le client et le montant en FCFA est généré pour être envoyé en un clic via l'API wa.me.",
    },
    {
      q: "Puis-je modifier une facture après son émission ?",
      a: "Tant qu'une facture n'est pas soldée, vous pouvez ajuster l'échéance ou les notes depuis sa page de détail.",
    },
  ];

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Centre d&apos;aide & Support
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              Support Sénégal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Guides, foire aux questions et assistance technique
          </p>
        </div>
      </div>

      {/* 3 Support Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
        <div className="p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Support WhatsApp</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Équipe basée à Dakar du lundi au vendredi.
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Guide Facturation</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Mentions obligatoires : NINEA, RCCM et TVA 18%.
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Conformité Légale</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Numérotation séquentielle certifiée sans trou ni doublon.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-6 space-y-4 w-full">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          Questions Fréquentes
        </h3>
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                {faq.q}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
