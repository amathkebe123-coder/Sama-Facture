"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCards } from "@/components/dashboard/StatCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { PaymentChannels } from "@/components/dashboard/PaymentChannels";
import { RecentInvoicesTable } from "@/components/dashboard/RecentInvoicesTable";
import { formatDateFr } from "@/lib/data/fixtures";
import { useInvoices } from "@/context/InvoiceContext";

const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export default function DashboardPage() {
  const { invoices, payments, userProfile } = useInvoices();
  const displayName = userProfile?.fullName ? userProfile.fullName.split(" ")[0] : "Bienvenue";

  // Date actuelle en français (ex: Lundi 2 novembre 2026)
  const todayFormatted = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const capitalizedDate =
    todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  // Calcul dynamique des statistiques depuis la base de données
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
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  const dynamicStats = {
    totalInvoiced,
    totalInvoicedTrend: 0,
    totalCollected,
    totalCollectedTrend: 0,
    pendingAmount,
    pendingCount,
    overdueCount,
    invoiceCount: invoices.length,
    invoiceCountTrend: 0,
  };

  // Calcul dynamique de l'évolution financière mensuelle
  const currentMonthIdx = new Date().getMonth();
  const dynamicRevenueTrend = MONTH_NAMES.map((name, idx) => {
    let facturé = 0;
    let encaissé = 0;

    for (const inv of invoices) {
      if (inv.issueDate) {
        const d = new Date(inv.issueDate);
        if (!isNaN(d.getTime()) && d.getMonth() === idx) {
          if (inv.status !== "draft") facturé += inv.total;
          if (inv.status === "paid") encaissé += inv.total;
        }
      }
    }

    return {
      month: name,
      facturé,
      encaissé,
      isCurrent: idx === currentMonthIdx,
    };
  });

  // Facture en retard critique
  const overdueInvoice = invoices.find((i) => i.status === "overdue");

  // Convertir les factures réelles pour l'affichage dans la table
  const formattedRecentInvoices = invoices.slice(0, 6).map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    client: {
      name: inv.client?.name || "Client",
      email: inv.client?.email || "",
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 truncate">
            Bonjour, {displayName} ! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">
            Prête à suivre les encaissements de votre entreprise ?
          </p>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-100/80">
            {capitalizedDate}
          </span>
        </div>
      </div>

      {/* 4 Primary KPI Stat Cards */}
      <StatCards stats={dynamicStats} />

      {/* Mid Section: Revenue Chart & Insights / Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
        {/* Left: 2 Columns for Revenue Chart */}
        <div className="lg:col-span-2 w-full min-w-0">
          <RevenueChart data={dynamicRevenueTrend} />
        </div>

        {/* Right: 1 Column for Insight & Payment Channels */}
        <div className="space-y-4 sm:space-y-6 flex flex-col justify-between w-full min-w-0">
          <InsightCard overdueInvoice={overdueInvoice} />
          <PaymentChannels payments={payments} invoices={invoices} />
        </div>
      </div>

      {/* Bottom Section: Recent Invoices Table */}
      <div className="w-full min-w-0">
        <RecentInvoicesTable invoices={formattedRecentInvoices} />
      </div>
    </AppShell>
  );
}
