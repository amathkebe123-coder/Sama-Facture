"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { StatCards } from "@/components/dashboard/StatCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { PaymentChannels } from "@/components/dashboard/PaymentChannels";
import { RecentInvoicesTable } from "@/components/dashboard/RecentInvoicesTable";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_REVENUE_TREND,
  MOCK_RECENT_INVOICES,
} from "@/lib/data/fixtures";

export default function DashboardPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Date actuelle en français (ex: Vendredi 30 octobre 2026)
  const todayFormatted = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const capitalizedDate =
    todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      {/* Dark modern Sidebar (Desktop & Mobile Drawer) */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (offset by sidebar width on lg screens) */}
      <div className="lg:pl-[260px] flex flex-col min-h-screen transition-all">
        {/* Sticky Topbar */}
        <Topbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome greeting banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                Bonjour, Awa ! 👋
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Prête à suivre les encaissements de votre entreprise ?
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-100/80">
                {capitalizedDate}
              </span>
            </div>
          </div>

          {/* 4 Primary KPI Stat Cards */}
          <StatCards stats={MOCK_DASHBOARD_STATS} />

          {/* Mid Section: Revenue Chart & Insights / Channels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: 2 Columns for Revenue Chart */}
            <div className="lg:col-span-2">
              <RevenueChart data={MOCK_REVENUE_TREND} />
            </div>

            {/* Right: 1 Column for Insight & Payment Channels */}
            <div className="space-y-6 flex flex-col justify-between">
              <InsightCard />
              <PaymentChannels />
            </div>
          </div>

          {/* Bottom Section: Recent Invoices Table */}
          <RecentInvoicesTable invoices={MOCK_RECENT_INVOICES} />
        </main>
      </div>
    </div>
  );
}

