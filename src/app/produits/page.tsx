"use client";

import React from "react";
import { Package, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export default function ProductsPage() {
  const dummyProducts = [
    {
      id: "prod-1",
      name: "Développement Plateforme Web & API",
      category: "Ingénierie Logicielle",
      unitPrice: "2 200 000 FCFA",
      taxRate: "18%",
      unit: "Projet / Forfait",
    },
    {
      id: "prod-2",
      name: "Intégration Passerelle Mobile Wave & OM",
      category: "Paiement & Fintech",
      unitPrice: "550 000 FCFA",
      taxRate: "18%",
      unit: "Module",
    },
    {
      id: "prod-3",
      name: "Infogérance Cloud & Sécurité Serveurs",
      category: "Maintenance",
      unitPrice: "400 000 FCFA",
      taxRate: "18%",
      unit: "Mois",
    },
    {
      id: "prod-4",
      name: "Audit de Conformité & Sécurité Système",
      category: "Cybersécurité",
      unitPrice: "1 650 000 FCFA",
      taxRate: "18%",
      unit: "Audit",
    },
  ];

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Produits & Services
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              Catalogue
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gérez vos prestations pour accélérer la rédaction de factures
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Le catalogue complet sera éditable en Phase 2.")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau produit</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden w-full">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Prestations actives
            </h3>
          </div>
        </div>

        {/* Desktop Table View (>= 768px) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Unité</th>
                <th className="py-3 px-4 text-center">Taux TVA</th>
                <th className="py-3 px-4 text-right">Prix Unitaire HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {dummyProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {p.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {p.unit}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600">
                    {p.taxRate}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                    {p.unitPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (< 768px) */}
        <div className="md:hidden divide-y divide-slate-100">
          {dummyProducts.map((p) => (
            <div key={p.id} className="p-3.5 space-y-1.5">
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-xs text-slate-900">
                  {p.name}
                </span>
                <span className="font-bold text-xs text-emerald-700 tabular-nums shrink-0">
                  {p.unitPrice}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {p.category}
                </span>
                <span>Unité : {p.unit} • TVA {p.taxRate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
