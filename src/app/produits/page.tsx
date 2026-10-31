"use client";

import React from "react";
import Link from "next/link";
import { Package, Plus, Sparkles } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Produits & Services
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              Catalogue (Phase 1)
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Gérez votre catalogue de prestations pour accélérer la rédaction de factures
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Le catalogue complet sera éditable en Phase 2.")}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm hover:shadow shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau produit / service</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Catalogue actif
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
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
      </div>
    </AppShell>
  );
}

