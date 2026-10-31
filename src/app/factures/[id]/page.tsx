"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Send,
  Building2,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  AlertTriangle,
  Receipt,
  Printer,
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

  // État de modal de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // État de modal de modification rapide
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNotes, setEditNotes] = useState(invoice?.notes || "");
  const [editDueDate, setEditDueDate] = useState(invoice?.dueDate || "");

  if (!invoice) {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Facture introuvable
          </h2>
          <p className="text-xs text-slate-500">
            La facture demandée n&apos;existe pas ou a été supprimée.
          </p>
          <Link
            href="/factures"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/factures"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                {invoice.invoiceNumber}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeClass}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}
                />
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Émise le {formatDateFr(invoice.issueDate)} • Échéance le{" "}
              {formatDateFr(invoice.dueDate)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Status Switcher */}
          <div className="flex items-center bg-white border border-slate-200/80 rounded-xl p-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase">
              Statut:
            </span>
            <select
              value={invoice.status}
              onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-2"
            >
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyée</option>
              <option value="paid">Payée</option>
              <option value="overdue">En retard</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-xl transition-colors shadow-sm"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Modifier</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimer / PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
            title="Supprimer la facture"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Invoice Sheet (Pro Format A4 Style) */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 md:p-10 max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Invoice Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm">
                SF
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 uppercase">
                Sama Facture SN
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Société de Services & Ingénierie Logicielle
            </p>
            <p className="text-xs text-slate-400 mt-1">
              NINEA : 008472912 • RCCM : SN-DKR-2024-B-1420
            </p>
            <p className="text-xs text-slate-400">Dakar Plateau, Sénégal</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              FACTURE OFFICIELLE
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {invoice.invoiceNumber}
            </h2>
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <p>
                Date d&apos;émission :{" "}
                <span className="font-semibold text-slate-700">
                  {formatDateFr(invoice.issueDate)}
                </span>
              </p>
              <p>
                Date d&apos;échéance :{" "}
                <span className="font-semibold text-slate-700">
                  {formatDateFr(invoice.dueDate)}
                </span>
              </p>
              <p>
                Mode de règlement :{" "}
                <span className="font-semibold text-slate-700">
                  {invoice.channel || "Wave / Virement"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Client & Bill-To Section */}
        <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Facturé à
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              {invoice.client.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {invoice.client.address || "Adresse non renseignée"}
            </p>
            <p className="text-xs text-slate-500">{invoice.client.city}</p>
          </div>
          <div className="text-xs text-slate-500 space-y-1 sm:text-right">
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

        {/* Items Table */}
        <div className="overflow-x-auto">
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

        {/* Financial Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
          <div className="max-w-xs space-y-2 text-xs text-slate-500">
            <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Notes & Instructions
            </h4>
            <p className="leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {invoice.notes || "Paiement net sans escompte."}
            </p>
            <p className="text-[11px] text-slate-400">
              Coordonnées de paiement : Wave / Orange Money au +221 77 000 00 00
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs md:text-sm">
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
              <span className="font-bold text-slate-900 text-sm md:text-base">
                Total TTC
              </span>
              <span className="font-bold text-emerald-600 text-lg md:text-xl tabular-nums">
                {formatFCFA(invoice.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Confirmation de Suppression */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Supprimer cette facture ?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Êtes-vous sûr de vouloir supprimer la facture{" "}
                <span className="font-semibold text-slate-800">
                  {invoice.invoiceNumber}
                </span>{" "}
                ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modification Rapide */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Modifier la facture {invoice.invoiceNumber}
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes & Instructions
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
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

