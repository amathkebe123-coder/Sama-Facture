"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCards } from "@/components/dashboard/StatCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { PaymentChannels } from "@/components/dashboard/PaymentChannels";
import { RecentInvoicesTable } from "@/components/dashboard/RecentInvoicesTable";
import {
  MOCK_REVENUE_TREND,
  formatDateFr,
} from "@/lib/data/fixtures";
import { useInvoices } from "@/context/InvoiceContext";

export default function DashboardPage() {
  const { invoices } = useInvoices();

  // Date actuelle en français (ex: Samedi 31 octobre 2026)
  const todayFormatted = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const capitalizedDate =
    todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  // Calcul dynamique des statistiques basé sur les factures en temps réel
  const nonDraftInvoices = invoices.filter((i) => i.status !== "draft");
  const totalInvoiced = nonDraftInvoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalCollected = invoices
    .filter((i) => i.status === "paid")
    .reduce((acc, curr) => acc + curr.total, 0);
  const pendingAmount = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((acc, curr) => acc + curr.total, 0);
  const pendingCount = invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue"
  ).length;

  const dynamicStats = {
    totalInvoiced: totalInvoiced || 18450000,
    totalInvoicedTrend: 12.4,
    totalCollected: totalCollected || 14200000,
    totalCollectedTrend: 8.6,
    pendingAmount: pendingAmount || 4250000,
    pendingCount: pendingCount || 6,
    invoiceCount: invoices.length,
    invoiceCountTrend: 15.2,
  };

  // Convertir les factures pour l'affichage dans la table
  const formattedRecentInvoices = invoices.slice(0, 6).map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    client: {
      name: inv.client.name,
      email: inv.client.email,
    },
    product: inv.lines[0]?.description || "Prestation de service",
    channel: inv.channel,
    date: formatDateFr(inv.issueDate),
    dueDate: formatDateFr(inv.dueDate),
    amount: inv.total,
    status: inv.status,
  }));

  return (
    <AppShell>
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
      <StatCards stats={dynamicStats} />

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
      <RecentInvoicesTable invoices={formattedRecentInvoices} />
    </AppShell>
  );
}
