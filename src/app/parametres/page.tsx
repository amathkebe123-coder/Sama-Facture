"use client";

import React, { useState } from "react";
import { Settings, Building, Receipt, Shield, Bell, Check } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Paramètres de l&apos;entreprise
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Configurez vos mentions légales, numérotation et canaux de paiement
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all ${
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
          className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all ${
            activeTab === "billing"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Facturation & Numérotation
        </button>
      </div>

      {/* Content Form Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 max-w-3xl">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Raison sociale
              </label>
              <input
                type="text"
                defaultValue="Sama Facture SN SARL"
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numéro NINEA (Sénégal)
              </label>
              <input
                type="text"
                defaultValue="008472912 2G3"
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numéro RCCM
              </label>
              <input
                type="text"
                defaultValue="SN-DKR-2024-B-1420"
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Téléphone Wave / OM professionnel
              </label>
              <input
                type="text"
                defaultValue="+221 77 821 45 67"
                className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
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
              className="w-full px-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <Check className="w-4 h-4" />
                Modifications enregistrées avec succès
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="px-4 py-2 text-xs md:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm"
            >
              Enregistrer les paramètres
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

