"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Trash2,
  Edit,
  Printer,
  Receipt,
  Mail,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useInvoices } from "@/context/InvoiceContext";
import { formatFCFA } from "@/lib/money";
import { getInvoiceStatusConfig, InvoiceStatus } from "@/lib/invoice-status";
import { formatDateFr } from "@/lib/data/fixtures";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getInvoice, updateInvoiceStatus, deleteInvoice, updateInvoice } =
    useInvoices();

  const invoiceId = params?.id as string;
  const invoice = getInvoice(invoiceId);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNotes, setEditNotes] = useState(invoice?.notes || "");
  const [editDueDate, setEditDueDate] = useState(invoice?.dueDate || "");

  if (!invoice) {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4 px-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Facture introuvable
          </h2>
          <p className="text-xs text-slate-500">
            Cette facture n&apos;existe pas ou a été supprimée.
          </p>
          <Link
            href="/factures"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl min-h-[44px]"
          >
            Retour aux factures
          </Link>
        </div>
      </AppShell>
    );
  }

  const statusCfg = getInvoiceStatusConfig(invoice.status);

  const handleStatusChange = (newStatus: InvoiceStatus) => {
    updateInvoiceStatus(invoice.id, newStatus);
  };

  const handleDeleteConfirm = () => {
    deleteInvoice(invoice.id);
    setIsDeleteModalOpen(false);
    router.push("/factures");
  };

  const handleSaveEdit = () => {
    updateInvoice(invoice.id, {
      notes: editNotes,
      dueDate: editDueDate,
    });
    setIsEditModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour ${invoice.client.name},\nVoici votre facture ${invoice.invoiceNumber} d'un montant de ${formatFCFA(invoice.total)}.\nÉchéance : ${formatDateFr(invoice.dueDate)}.\nMerci pour votre règlement.`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <AppShell>
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/factures"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-sm min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 truncate">
                {invoice.invoiceNumber}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}
                />
                {statusCfg.label}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
              Émise le {formatDateFr(invoice.issueDate)} • Échéance le{" "}
              {formatDateFr(invoice.dueDate)}
            </p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Quick Status Switcher */}
          <div className="flex items-center bg-white border border-slate-200/80 rounded-xl px-2 py-1.5 shadow-sm min-h-[40px] flex-1 sm:flex-initial">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">
              Statut:
            </span>
            <select
              value={invoice.status}
              onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer w-full"
            >
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 active:bg-emerald-100 rounded-xl transition-colors min-h-[40px] shrink-0"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 text-slate-600 bg-white border border-slate-200/80 rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Modifier"
          >
            <Edit className="w-4 h-4 text-slate-500" />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm min-h-[40px]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 text-rose-600 bg-rose-50 border border-rose-100 rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Invoice Sheet (A4 Pro Container) */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-8 md:p-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 w-full overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Invoice Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 pb-6 border-b border-slate-100 w-full">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm shrink-0">
                SF
              </div>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                Sama Facture SN
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Société de Services & Ingénierie Logicielle
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              NINEA : 008472912 • RCCM : SN-DKR-2024-B-1420
            </p>
            <p className="text-[11px] text-slate-400">Dakar Plateau, Sénégal</p>
          </div>

          <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-none border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 block">
              FACTURE OFFICIELLE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {invoice.invoiceNumber}
            </h2>
            <div className="mt-2 space-y-0.5 text-xs text-slate-500">
              <p>
                Émission :{" "}
                <span className="font-semibold text-slate-700">
                  {formatDateFr(invoice.issueDate)}
                </span>
              </p>
              <p>
                Échéance :{" "}
                <span className="font-semibold text-slate-700">
                  {formatDateFr(invoice.dueDate)}
                </span>
              </p>
              <p>
                Règlement :{" "}
                <span className="font-semibold text-slate-700">
                  {invoice.channel || "Wave"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Client & Bill-To Section */}
        <div className="p-3.5 sm:p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl flex flex-col sm:flex-row justify-between gap-3 w-full">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Destinataire
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              {invoice.client.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {invoice.client.address || "Adresse non renseignée"}
            </p>
            <p className="text-xs text-slate-500">{invoice.client.city}</p>
          </div>
          <div className="text-xs text-slate-500 space-y-1 sm:text-right pt-2 sm:pt-0 border-t sm:border-none border-slate-200/60">
            <p className="flex sm:justify-end items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{invoice.client.email}</span>
            </p>
            <p className="flex sm:justify-end items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{invoice.client.phone || "+221 -- --- -- --"}</span>
            </p>
          </div>
        </div>

        {/* Items Section - Desktop Table / Mobile Card List */}
        <div className="w-full">
          {/* Desktop Table View (>= 640px) */}
          <div className="hidden sm:block overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-2">Prestation / Service</th>
                  <th className="py-2.5 px-2 text-center w-20">Qté</th>
                  <th className="py-2.5 px-2 text-right w-32">Prix Unit. HT</th>
                  <th className="py-2.5 px-2 text-center w-20">TVA</th>
                  <th className="py-2.5 px-2 text-right w-36">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {invoice.lines.map((line, idx) => (
                  <tr key={line.id || idx}>
                    <td className="py-3 px-2 font-medium text-slate-900">
                      {line.description}
                    </td>
                    <td className="py-3 px-2 text-center text-slate-600">
                      {line.quantity}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-slate-700 tabular-nums">
                      {formatFCFA(line.unitPrice)}
                    </td>
                    <td className="py-3 px-2 text-center text-slate-500">
                      {line.taxRate || 18} %
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-slate-900 tabular-nums">
                      {formatFCFA(line.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Items Cards (< 640px) */}
          <div className="sm:hidden space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Prestations facturées
            </span>
            {invoice.lines.map((line, idx) => (
              <div
                key={line.id || idx}
                className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-1.5"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-semibold text-slate-900">
                    {line.description}
                  </span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums shrink-0">
                    {formatFCFA(line.lineTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>
                    Qté: {line.quantity} × {formatFCFA(line.unitPrice)}
                  </span>
                  <span>TVA: {line.taxRate || 18}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-5 pt-4 border-t border-slate-200 w-full">
          <div className="w-full sm:max-w-xs space-y-1.5 text-xs text-slate-500">
            <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] sm:text-[11px]">
              Notes & Modalités
            </h4>
            <p className="leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {invoice.notes || "Paiement net sans escompte."}
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span>Sous-total HT</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {formatFCFA(invoice.subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>TVA (18 %)</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {formatFCFA(invoice.taxTotal)}
              </span>
            </div>
            <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                Total TTC
              </span>
              <span className="font-bold text-emerald-600 text-base sm:text-xl tabular-nums">
                {formatFCFA(invoice.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Confirmation de Suppression */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm safe-bottom">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Supprimer la facture ?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement la facture{" "}
                <span className="font-bold text-slate-800">
                  {invoice.invoiceNumber}
                </span>{" "}
                ?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-colors shadow-sm min-h-[44px]"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modification Rapide */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm safe-bottom">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Modifier l&apos;échéance & notes
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date d&apos;échéance
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes de règlement
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-xl resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl min-h-[44px]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm min-h-[44px]"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
