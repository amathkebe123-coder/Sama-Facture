"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bell, Plus, Menu, SlidersHorizontal, X } from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedPeriodDate, setSelectedPeriodDate] = useState<string>("");

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 md:px-8 bg-white/90 backdrop-blur-md border-b border-slate-100 w-full max-w-full">
      {/* Mobile full-width search overlay if active */}
      {isMobileSearchOpen ? (
        <div className="absolute inset-0 z-40 flex items-center px-3 bg-white gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Rechercher factures, clients..."
              className="w-full pl-9 pr-3 py-2 text-base bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(false)}
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Fermer la recherche"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          {/* Left: Mobile hamburger & search input */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
            <button
              type="button"
              onClick={onOpenMobileSidebar}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center -ml-1 shrink-0"
              aria-label="Ouvrir le menu de navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop & Tablet Search Input */}
            <div className="relative hidden sm:block flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher des factures, clients, montants..."
                className="w-full pl-9 pr-12 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400 transition-all"
              />
              <kbd className="hidden md:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded">
                ⌘K
              </kbd>
            </div>

            {/* Mobile Search Toggle Icon */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="sm:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Actions, Notifications & Quick Action */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Date period selector (desktop only) */}
            <div className="hidden lg:block w-48">
              <DatePicker
                placeholder="30 derniers jours"
                value={selectedPeriodDate}
                onChange={setSelectedPeriodDate}
                size="sm"
                align="right"
              />
            </div>

            {/* Filter icon (desktop/tablet only) */}
            <button
              type="button"
              className="hidden sm:flex items-center justify-center p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-sm min-w-[40px] min-h-[40px]"
              title="Filtres avancés"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Notifications button */}
            <button
              type="button"
              className="relative p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-sm min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Primary CTA: Nouvelle facture */}
            <Link
              href="/factures/nouvelle"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 text-xs md:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm hover:shadow transition-all min-h-[40px] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle facture</span>
              <span className="sm:hidden text-xs font-bold">Créer</span>
            </Link>
          </div>
        </>
      )}
    </header>
  );
}
