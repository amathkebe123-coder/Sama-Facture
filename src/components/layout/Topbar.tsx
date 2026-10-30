"use client";

import React from "react";
import { Search, Bell, Plus, Menu, Calendar, SlidersHorizontal } from "lucide-react";

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100">
      {/* Left: Mobile hamburger & search input */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher des factures, clients, montants..."
            className="w-full pl-9 pr-12 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400 transition-all"
          />
          <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Notifications & Quick Action */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Date period selector */}
        <button
          type="button"
          className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>30 derniers jours</span>
        </button>

        {/* Filter icon */}
        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          title="Filtres avancés"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Notifications button */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Primary CTA: Nouvelle facture */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle facture</span>
          <span className="sm:hidden">Créer</span>
        </button>
      </div>
    </header>
  );
}

