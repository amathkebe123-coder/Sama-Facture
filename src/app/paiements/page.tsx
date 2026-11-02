"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle2, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FeedbackModal, FeedbackModalVariant } from "@/components/ui/FeedbackModal";
import { formatFCFA } from "@/lib/money";
import { useInvoices } from "@/context/InvoiceContext";

export default function PaymentsPage() {
  const { payments, addPayment, updatePayment, invoices } = useInvoices();

  // Modal d'enregistrement de paiement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Wave Business");
  const [ref, setRef] = useState("");

  // Détection des doublons & mise à jour
  const [savedPayment, setSavedPayment] = useState<{ id: string; ref: string } | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    variant: FeedbackModalVariant;
    title: string;
    description: string;
  }>({
    isOpen: false,
    variant: "info",
    title: "",
    description: "",
  });

  const getPaymentSnapshot = () =>
    JSON.stringify({
      invoiceNumber: invoiceNumber.trim(),
      client: client.trim(),
      amount: amount.trim(),
      method: method.trim(),
      ref: ref.trim(),
    });

  const handleOpenAddModal = () => {
    setSavedPayment(null);
    setSavedSnapshot(null);
    const sampleInv = invoices[0];
    setInvoiceNumber(sampleInv ? sampleInv.invoiceNumber : "");
    setClient(sampleInv ? sampleInv.client.name : "");
    setAmount(sampleInv ? String(sampleInv.total) : "");
    setMethod("Wave Business");
    setRef(`WAV-SN-${Math.floor(10000 + Math.random() * 90000)}-M`);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim() || !client.trim() || !amount.trim()) return;

    const currentSnapshot = getPaymentSnapshot();

    // Si déjà enregistré
    if (savedPayment) {
      if (currentSnapshot === savedSnapshot) {
        setDialogState({
          isOpen: true,
          variant: "info",
          title: "Aucune modification",
          description: "Vous n'avez modifié aucune information sur ce paiement depuis le dernier enregistrement.",
        });
        return;
      }
      setDialogState({
        isOpen: true,
        variant: "confirm",
        title: "Cet élément est déjà enregistré",
        description: `Voulez-vous mettre à jour le paiement de la facture ${invoiceNumber} (Réf. ${savedPayment.ref}) avec les nouvelles informations ?`,
      });
      return;
    }

    // PREMIER clic : création normale
    setIsSubmitting(true);
    (async () => {
      try {
        const parsedAmount = parseInt(amount.replace(/\s/g, ""), 10) || 0;
        const newPay = await addPayment({
          invoiceNumber: invoiceNumber.trim(),
          client: client.trim(),
          amount: parsedAmount,
          method: method.trim(),
          date: new Date().toLocaleDateString("fr-FR"),
          ref: ref.trim(),
          status: "Confirmé",
        });

        setSavedPayment({ id: newPay.id, ref: newPay.ref });
        setSavedSnapshot(currentSnapshot);
        setIsSubmitting(false);
        setIsModalOpen(false);
        setDialogState({
          isOpen: true,
          variant: "success",
          title: "Paiement enregistré",
          description: `Le paiement de ${formatFCFA(newPay.amount)} pour la facture ${newPay.invoiceNumber} a été enregistré avec succès dans Supabase.`,
        });
      } catch (err: any) {
        setIsSubmitting(false);
        setDialogState({
          isOpen: true,
          variant: "error",
          title: "Erreur d'enregistrement",
          description: err?.message || "Impossible d'enregistrer le paiement dans Supabase.",
        });
      }
    })();
  };

  const handleConfirmUpdate = async () => {
    if (!savedPayment) return;
    setIsSubmitting(true);

    try {
      const parsedAmount = parseInt(amount.replace(/\s/g, ""), 10) || 0;
      await updatePayment(savedPayment.id, {
        invoiceNumber: invoiceNumber.trim(),
        client: client.trim(),
        amount: parsedAmount,
        method: method.trim(),
        ref: ref.trim(),
      });

      setSavedSnapshot(getPaymentSnapshot());
      setIsSubmitting(false);
      setIsModalOpen(false);
      setDialogState({
        isOpen: true,
        variant: "success",
        title: "Modifications enregistrées",
        description: `Le paiement de la facture ${invoiceNumber} a été mis à jour avec succès dans Supabase.`,
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Erreur de mise à jour",
        description: err?.message || "Impossible de mettre à jour le paiement dans Supabase.",
      });
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Paiements & Encaissements
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              {payments.length} {payments.length <= 1 ? "reçu" : "reçus"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Historique certifié des règlements Mobile Money et virements
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shrink-0 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer un paiement</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden w-full">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Derniers encaissements
            </h3>
          </div>
        </div>

        {/* Desktop Table View (>= 768px) */}
        {payments.length === 0 ? (
          <div className="py-14 text-center px-4 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Aucun paiement enregistré
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Enregistrez vos règlements clients par Wave, Orange Money ou virement bancaire.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Facture</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Montant encaissé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {p.client}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {p.ref}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{p.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600 tabular-nums">
                    {formatFCFA(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (< 768px) */}
        <div className="md:hidden divide-y divide-slate-100">
          {payments.map((p) => (
            <div key={p.id} className="p-3.5 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-bold text-xs text-slate-900">
                    {p.invoiceNumber}
                  </span>
                  <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                    {p.client}
                  </p>
                </div>
                <span className="font-bold text-xs text-emerald-600 tabular-nums">
                  {formatFCFA(p.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                <span>{p.method} • {p.date}</span>
                <span className="font-mono text-[10px] text-slate-400">{p.ref}</span>
              </div>
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      {/* Modal Nouveau Règlement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Enregistrer un paiement certifié
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Renseignez la référence de la transaction
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
              {invoices.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sélectionner une facture existante (optionnel)
                  </label>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const inv = invoices.find((i) => i.id === e.target.value);
                      if (inv) {
                        setInvoiceNumber(inv.invoiceNumber);
                        setClient(inv.client.name);
                        setAmount(String(inv.total));
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-medium"
                  >
                    <option value="">-- Choisir une facture à régler --</option>
                    {invoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — {inv.client.name} ({formatFCFA(inv.total)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numéro de facture *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="FAC-2026-XXXX"
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Montant perçu (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="850000"
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom du client ou entreprise *
                </label>
                <input
                  type="text"
                  required
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Ex: Baobab Digital Agency"
                  className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Canal d&apos;encaissement
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px] bg-white"
                  >
                    <option value="Wave Business">Wave Business</option>
                    <option value="Orange Money Marchand">Orange Money Marchand</option>
                    <option value="Virement Bancaire">Virement Bancaire</option>
                    <option value="Espèces">Espèces</option>
                    <option value="Chèque">Chèque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Référence transaction *
                  </label>
                  <input
                    type="text"
                    required
                    value={ref}
                    onChange={(e) => setRef(e.target.value)}
                    placeholder="WAV-SN-XXXXX"
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Boîte de dialogue de retour */}
      <FeedbackModal
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmUpdate}
        variant={dialogState.variant}
        title={dialogState.title}
        description={dialogState.description}
      />
    </AppShell>
  );
}
