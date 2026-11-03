"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronsUpDown,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInvoices } from "@/context/InvoiceContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { invoices, userProfile, signOut } = useInvoices();

  const mainNavItems = [
    { label: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
    {
      label: "Factures",
      href: "/factures",
      icon: Receipt,
      badge: invoices.length > 0 ? String(invoices.length) : undefined,
    },
    { label: "Clients", href: "/clients", icon: Users },
    { label: "Produits & Services", href: "/produits", icon: Package },
  ];

  const financeNavItems = [
    { label: "Paiements", href: "/paiements", icon: CreditCard },
    { label: "Rapports & TVA", href: "/rapports", icon: BarChart3 },
  ];

  const otherNavItems = [
    { label: "Paramètres", href: "/parametres", icon: Settings },
    { label: "Centre d'aide", href: "/aide", icon: HelpCircle },
  ];

  const initials = (userProfile?.fullName || "SF")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const renderNavGroup = (title: string, items: typeof mainNavItems) => (
    <div className="mb-5">
      <p className="px-3 mb-2 text-[10px] sm:text-[11px] font-semibold tracking-wider text-emerald-100/40 uppercase">
        {title}
      </p>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 min-h-[44px]",
                isActive
                  ? "bg-emerald-600/15 text-emerald-400 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-emerald-950/20"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive
                      ? "text-emerald-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "px-2 py-0.5 text-[10px] sm:text-xs rounded-full font-semibold tabular-nums shrink-0 transition-colors",
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-[#112117] text-slate-400 group-hover:bg-[#16291F] group-hover:text-slate-300"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-emerald-500" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-[260px] sm:w-[270px] bg-[#08100C] border-r border-[#15241C] text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Glow ambient background subtle */}
        <div className="absolute top-0 left-0 w-full h-40 bg-emerald-500/5 blur-3xl pointer-events-none" />

        {/* Header / Brand */}
        <div className="relative flex items-center justify-between h-16 px-4 border-b border-[#15241C]/80 shrink-0">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight text-white uppercase truncate">
                Yomb Facture
              </span>
              <span className="text-[10px] text-emerald-400/80 font-medium truncate">
                Sénégal • XOF
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-950/30"
              title="Changer d'organisation"
            >
              <ChevronsUpDown className="w-4 h-4" />
            </button>
            {/* Close button on mobile with generous touch target */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-emerald-950/40 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <div className="relative flex-1 px-3 py-4 overflow-y-auto">
          {renderNavGroup("Menu Principal", mainNavItems)}
          {renderNavGroup("Finances", financeNavItems)}
          {renderNavGroup("Autre", otherNavItems)}
        </div>

        {/* Footer / Account card & Sign out */}
        <div className="relative p-3 border-t border-[#15241C]/80 shrink-0 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#0D1812] border border-[#16291F]">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0 uppercase">
              {initials || "SF"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {userProfile.fullName || "Utilisateur"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {userProfile.email || "Compte actif"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-colors min-h-[44px]"
            title="Se déconnecter de votre espace"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
