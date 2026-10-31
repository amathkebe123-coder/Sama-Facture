"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Paramètres de l&apos;entreprise
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Mentions légales, numérotation et canaux de paiement
          </p>
        </div>
      </div>

      {/* Tabs with horizontal scroll on mobile */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto w-full">
        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap min-h-[40px] ${
            activeTab === "company"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Entreprise & Mentions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap min-h-[40px] ${
            activeTab === "billing"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Facturation & Numérotation
        </button>
      </div>

      {/* Content Form Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-6 max-w-3xl w-full">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Raison sociale
              </label>
              <input
                type="text"
                defaultValue="Sama Facture SN SARL"
                className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numéro NINEA (Sénégal)
              </label>
              <input
                type="text"
                defaultValue="008472912 2G3"
                className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numéro RCCM
              </label>
              <input
                type="text"
                defaultValue="SN-DKR-2024-B-1420"
                className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Téléphone Wave / OM pro
              </label>
              <input
                type="text"
                defaultValue="+221 77 821 45 67"
                className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adresse du siège social
            </label>
            <input
              type="text"
              defaultValue="12 Avenue Léopold Sédar Senghor, Dakar Plateau"
              className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                <Check className="w-4 h-4" />
                Enregistré avec succès
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm min-h-[44px]"
            >
              Enregistrer les paramètres
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
