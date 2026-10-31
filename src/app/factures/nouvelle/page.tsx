"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Send,
  Save,
  FileText,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useInvoices } from "@/context/InvoiceContext";
import { formatFCFA } from "@/lib/money";
import { InvoiceLine } from "@/lib/data/fixtures";

export default function NewInvoicePage() {
  const router = useRouter();
  const { clients, addInvoice } = useInvoices();

  // Dates par défaut
  const today = new Date().toISOString().split("T")[0]!;
  const defaultDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;

  const [clientId, setClientId] = useState<string>(clients[0]?.id || "");
  const [issueDate, setIssueDate] = useState<string>(today);
  const [dueDate, setDueDate] = useState<string>(defaultDue);
  const [channel, setChannel] = useState<string>("Wave");
  const [notes, setNotes] = useState<string>(
    "Paiement attendu à échéance. Merci pour votre collaboration."
  );

  // Lignes dynamiques
  const [lines, setLines] = useState<
    Array<{
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }>
  >([
    {
      id: "line-1",
      description: "Prestation de service numérique & conseil",
      quantity: 1,
      unitPrice: 500000,
    },
  ]);

  const [error, setError] = useState<string | null>(null);

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 1) {
      setError("La facture doit comporter au moins une prestation.");
      return;
    }
    setError(null);
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const handleUpdateLine = (
    id: string,
    field: "description" | "quantity" | "unitPrice",
    val: string | number
  ) => {
    setError(null);
    setLines((prev) =>
      prev.map((line) => {
        if (line.id === id) {
          return {
            ...line,
            [field]:
              field === "quantity" || field === "unitPrice"
                ? Math.max(0, Number(val) || 0)
                : val,
          };
        }
        return line;
      })
    );
  };

  const setDueDateDays = (days: number) => {
    const base = new Date(issueDate || today);
    const target = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    setDueDate(target.toISOString().split("T")[0]!);
  };

  const subtotal = lines.reduce(
    (acc, line) => acc + Math.round(line.quantity * line.unitPrice),
    0
  );
  const taxRate = 18;
  const taxTotal = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + taxTotal;

  const handleSubmit = (status: "draft" | "sent") => {
    const selectedClient = clients.find((c) => c.id === clientId);
    if (!selectedClient) {
      setError("Veuillez sélectionner un client destinataire.");
      return;
    }

    const hasEmptyDescription = lines.some((l) => !l.description.trim());
    if (hasEmptyDescription) {
      setError("Toutes les lignes de facture doivent avoir une description.");
      return;
    }

    if (subtotal <= 0) {
      setError("Le montant de la facture doit être supérieur à 0 FCFA.");
      return;
    }

    const formattedLines: InvoiceLine[] = lines.map((l) => ({
      id: l.id,
      description: l.description,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxRate: 18,
      lineTotal: Math.round(l.quantity * l.unitPrice),
    }));

    const newInvoice = addInvoice({
      client: selectedClient,
      issueDate,
      dueDate,
      channel,
      status,
      lines: formattedLines,
      subtotal,
      taxRate: 18,
      taxTotal,
      total,
      notes,
      paymentTerms: `Paiement exigible au plus tard le ${dueDate}.`,
    });

    router.push(`/factures/${newInvoice.id}`);
  };

  return (
    <AppShell>
      {/* Top Header / Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/factures"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-sm min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
            aria-label="Retour aux factures"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 truncate">
              Créer une facture
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              Générez une facture conforme en FCFA
            </p>
          </div>
        </div>

        {/* Action Buttons Top (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-xl transition-colors shadow-sm min-h-[40px]"
          >
            <Save className="w-4 h-4 text-slate-400" />
            <span>Brouillon</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("sent")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm min-h-[40px]"
          >
            <Send className="w-4 h-4" />
            <span>Valider et envoyer</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200/70 rounded-xl text-rose-700 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
        {/* Left Column: Client & Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 w-full min-w-0">
          {/* Card: Client & Metadata */}
          <div className="p-4 sm:p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 w-full">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Destinataire & Modalités</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
              {/* Select Client */}
              <div className="sm:col-span-2 w-full">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client destinataire *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date d'émission */}
              <div className="w-full">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date d&apos;émission *
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-medium min-h-[44px]"
                />
              </div>

              {/* Date d'échéance */}
              <div className="w-full">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date d&apos;échéance *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-medium min-h-[44px]"
                />
                {/* Raccourcis d'échéance tactiles */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-400">Raccourcis:</span>
                  {[15, 30, 45, 60].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDueDateDays(days)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors min-h-[32px]"
                    >
                      +{days}j
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Items / Prestations */}
          <div className="p-4 sm:p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 w-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Lignes de prestations</span>
              </h2>
              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 rounded-xl transition-colors min-h-[36px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            {/* Lines List - Responsive layout */}
            <div className="space-y-3 w-full">
              {lines.map((line, idx) => {
                const lineTotal = Math.round(line.quantity * line.unitPrice);

                return (
                  <div
                    key={line.id}
                    className="p-3 sm:p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-3 w-full"
                  >
                    {/* Ligne 1 : Description pleine largeur */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase">
                          Ligne #{idx + 1} — Description
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 flex items-center gap-1 text-[11px]"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span className="sm:hidden text-rose-600 font-semibold">Supprimer</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Ex: Refonte application web..."
                        value={line.description}
                        onChange={(e) =>
                          handleUpdateLine(line.id, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 text-base sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                      />
                    </div>

                    {/* Ligne 2 : Qté + PU + Total HT */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 items-end">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Quantité
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={line.quantity}
                          onChange={(e) =>
                            handleUpdateLine(line.id, "quantity", e.target.value)
                          }
                          className="w-full px-3 py-2 text-base sm:text-sm bg-white border border-slate-200 rounded-xl text-center font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Prix Unit. HT
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={line.unitPrice}
                          onChange={(e) =>
                            handleUpdateLine(line.id, "unitPrice", e.target.value)
                          }
                          className="w-full px-3 py-2 text-base sm:text-sm bg-white border border-slate-200 rounded-xl font-bold text-slate-800 tabular-nums"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1 flex flex-col justify-end text-right bg-white sm:bg-transparent p-2 sm:p-0 rounded-lg border sm:border-none border-slate-100">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Total HT calculé
                        </span>
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                          {formatFCFA(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Totaux & Options (1 Col) */}
        <div className="space-y-4 sm:space-y-6 w-full min-w-0">
          <div className="p-4 sm:p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 w-full">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Récapitulatif financier
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Sous-total HT</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatFCFA(subtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span>TVA légale</span>
                  <span className="px-1.5 py-0.2 text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                    18 %
                  </span>
                </span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatFCFA(taxTotal)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <div>
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    Total TTC
                  </span>
                  <p className="text-[10px] text-slate-400">Net à payer</p>
                </div>
                <span className="text-lg sm:text-xl font-bold text-emerald-600 tabular-nums">
                  {formatFCFA(total)}
                </span>
              </div>
            </div>

            {/* Canal de paiement */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Canal de règlement
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 font-medium"
              >
                <option value="Wave">Wave</option>
                <option value="Orange Money">Orange Money</option>
                <option value="Virement">Virement bancaire</option>
                <option value="Espèces">Espèces</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes & Mentions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 text-base sm:text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 resize-none"
              />
            </div>

            {/* Mobile Actions Full Width (Thumb-friendly >= 44px) */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleSubmit("sent")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm min-h-[48px]"
              >
                <Send className="w-4 h-4" />
                <span>Valider et envoyer</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-colors min-h-[44px]"
              >
                <Save className="w-3.5 h-3.5 text-slate-400" />
                <span>Enregistrer brouillon</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
