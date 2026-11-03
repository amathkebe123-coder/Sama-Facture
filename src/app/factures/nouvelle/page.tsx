"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Building2,
  Send,
  Save,
  ExternalLink,
  RefreshCw,
  Download,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { DatePicker } from "@/components/ui/DatePicker";
import { FeedbackModal, FeedbackModalVariant } from "@/components/ui/FeedbackModal";
import { useInvoices } from "@/context/InvoiceContext";
import { formatFCFA } from "@/lib/money";
import { Invoice, InvoiceLine } from "@/lib/data/fixtures";
import { downloadInvoicePdf } from "@/lib/pdf-generator";

export default function NewInvoicePage() {
  const router = useRouter();
  const { clients, products, companySettings, addInvoice, updateInvoice } = useInvoices();

  const taxRate = parseFloat(companySettings.defaultTax) || 18;
  const defaultTerms = parseInt(companySettings.paymentTerms, 10) || 30;

  // Dates par défaut
  const today = new Date().toISOString().split("T")[0]!;
  const defaultDue = new Date(Date.now() + defaultTerms * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]!;

  const [clientId, setClientId] = useState<string>(clients[0]?.id || "");
  const [issueDate, setIssueDate] = useState<string>(today);
  const [dueDate, setDueDate] = useState<string>(defaultDue);
  const [channel, setChannel] = useState<string>("Wave");
  const [notes, setNotes] = useState<string>(
    companySettings.companyName
      ? "Paiement attendu à échéance. Merci pour votre collaboration."
      : ""
  );

  // Lignes dynamiques : initialement vide
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
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  // État de persistance et détection de doublons / modifications
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"draft" | "sent">("draft");

  const handleDownloadPdf = async (invToDownload?: Invoice) => {
    const target = invToDownload || savedInvoice;
    if (!target) return;
    setIsDownloadingPdf(true);
    try {
      await downloadInvoicePdf(target);
    } catch (err) {
      console.error("Erreur téléchargement PDF:", err);
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Échec du téléchargement",
        description: "Une erreur est survenue lors de la génération du fichier PDF. Veuillez réessayer.",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Boîte de dialogue centrée (modale unique officielle)
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    variant: FeedbackModalVariant;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirmAction?: () => void;
  }>({
    isOpen: false,
    variant: "success",
    title: "",
    description: "",
  });

  // État de l'abonnement utilisateur pour alerte préventive
  const [subStatus, setSubStatus] = useState<{
    hasActiveSubscription: boolean;
    expiresAt: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/abonnement/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSubStatus(data);
      })
      .catch(() => {});
  }, []);

  // Calcule une empreinte JSON de l'état actuel du formulaire
  const getFormSnapshot = () =>
    JSON.stringify({
      clientId,
      issueDate,
      dueDate,
      channel,
      notes: notes.trim(),
      lines: lines.map((l) => ({
        description: l.description.trim(),
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
      })),
    });

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
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Prestation requise",
        description: "La facture doit comporter au moins une prestation de service.",
      });
      return;
    }
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const handleUpdateLine = (
    id: string,
    field: "description" | "quantity" | "unitPrice",
    val: string | number
  ) => {
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
    (acc, line) => acc + Math.round(line.quantity * (line.unitPrice || 0)),
    0
  );
  const taxTotal = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + taxTotal;

  const handleSubmit = (status: "draft" | "sent") => {
    const selectedClient = clients.find((c) => c.id === clientId);
    if (!selectedClient) {
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Destinataire manquant",
        description: "Veuillez sélectionner un client destinataire pour cette facture.",
      });
      return;
    }

    const hasEmptyDescription = lines.some((l) => !l.description.trim());
    if (hasEmptyDescription) {
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Description manquante",
        description: "Toutes les lignes de facture doivent avoir une description explicite.",
      });
      return;
    }

    if (subtotal <= 0) {
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Montant invalide",
        description: "Le montant total de la facture doit être supérieur à 0 FCFA.",
      });
      return;
    }

    // 1. Si la facture a déjà été enregistrée une première fois
    if (savedInvoice) {
      const currentSnapshot = getFormSnapshot();
      // Cas particulier : aucun champ modifié
      if (currentSnapshot === savedSnapshot) {
        setDialogState({
          isOpen: true,
          variant: "info",
          title: "Aucune modification",
          description: "Vous n'avez modifié aucune information depuis le dernier enregistrement.",
        });
        return;
      }

      // Des modifications ont été apportées : ouvrir la boîte de dialogue de confirmation
      setPendingStatus(status);
      setDialogState({
        isOpen: true,
        variant: "confirm",
        title: "Cet élément est déjà enregistré",
        description: `Voulez-vous mettre à jour la facture ${savedInvoice.invoiceNumber} avec les nouvelles informations ?`,
      });
      return;
    }

    // 2. PREMIER clic sur Enregistrer : création normale
    setIsSubmitting(true);
    const formattedLines: InvoiceLine[] = lines.map((l) => ({
      id: l.id,
      description: l.description.trim(),
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxRate: taxRate,
      lineTotal: Math.round(l.quantity * l.unitPrice),
    }));

    (async () => {
      try {
        const newInvoice = await addInvoice({
          client: selectedClient,
          issueDate,
          dueDate,
          channel,
          status,
          lines: formattedLines,
          subtotal,
          taxRate,
          taxTotal,
          total,
          notes,
          paymentTerms: `Paiement exigible au plus tard le ${dueDate}.`,
        });

        setSavedInvoice(newInvoice);
        setSavedSnapshot(getFormSnapshot());
        setIsSubmitting(false);
        setDialogState({
          isOpen: true,
          variant: "success",
          title: "Enregistré avec succès",
          description: `La facture ${newInvoice.invoiceNumber} a été enregistrée dans Supabase. Elle apparaîtra sur vos prochains tableaux de bord.`,
        });
      } catch (err: any) {
        setIsSubmitting(false);
        if (
          err?.code === "SUBSCRIPTION_REQUIRED" ||
          err?.message?.toLowerCase().includes("abonnement")
        ) {
          setDialogState({
            isOpen: true,
            variant: "confirm",
            title: "Abonnement requis ou expiré",
            description:
              "Votre abonnement actuel ne vous permet pas de créer de nouvelles factures. Cliquez sur Renouveler pour activer une formule.",
            confirmLabel: "Renouveler mon abonnement",
            cancelLabel: "Plus tard",
            onConfirmAction: () => router.push("/abonnement"),
          });
          return;
        }
        setDialogState({
          isOpen: true,
          variant: "error",
          title: "Erreur d'enregistrement",
          description: err?.message || "Impossible d'enregistrer la facture dans Supabase.",
        });
      }
    })();
  };

  // Confirmation de la mise à jour depuis la boîte de dialogue
  const handleConfirmUpdate = async () => {
    if (!savedInvoice) return;
    const selectedClient = clients.find((c) => c.id === clientId);
    if (!selectedClient) return;

    setIsSubmitting(true);

    const formattedLines: InvoiceLine[] = lines.map((l) => ({
      id: l.id,
      description: l.description.trim(),
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxRate: taxRate,
      lineTotal: Math.round(l.quantity * l.unitPrice),
    }));

    try {
      const updatedInvoice: Invoice = {
        ...savedInvoice,
        client: selectedClient,
        issueDate,
        dueDate,
        channel,
        status: pendingStatus,
        lines: formattedLines,
        subtotal,
        taxRate: taxRate,
        taxTotal,
        total,
        notes,
        paymentTerms: `Paiement exigible au plus tard le ${dueDate}.`,
      };

      await updateInvoice(savedInvoice.id, updatedInvoice);
      setSavedInvoice(updatedInvoice);
      setSavedSnapshot(getFormSnapshot());
      setIsSubmitting(false);
      setDialogState({
        isOpen: true,
        variant: "success",
        title: "Modifications enregistrées",
        description: `La facture ${savedInvoice.invoiceNumber} a été mise à jour avec succès.`,
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Erreur de mise à jour",
        description: err?.message || "Impossible de mettre à jour la facture dans Supabase.",
      });
    }
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
          {savedInvoice && (
            <>
              <button
                type="button"
                disabled={isDownloadingPdf}
                onClick={() => handleDownloadPdf()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 active:bg-emerald-200 rounded-xl transition-all shadow-sm min-h-[40px] disabled:opacity-50"
              >
                {isDownloadingPdf ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>Télécharger PDF</span>
              </button>
              <Link
                href={`/factures/${savedInvoice.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors min-h-[40px]"
              >
                <span>{savedInvoice.invoiceNumber}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("draft")}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 disabled:opacity-50 rounded-xl transition-colors shadow-sm min-h-[40px]"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-slate-400" />
            )}
            <span>Brouillon</span>
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("sent")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-xl transition-all shadow-sm min-h-[40px]"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{savedInvoice ? "Enregistrer" : "Valider et envoyer"}</span>
          </button>
        </div>
      </div>

      {/* Alerte si abonnement inactif ou expiré */}
      {subStatus && !subStatus.hasActiveSubscription && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm">Abonnement requis ou expiré</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Vous devez disposer d&apos;un abonnement actif pour créer et émettre de nouvelles factures.
              </p>
            </div>
          </div>
          <Link
            href="/abonnement"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm shrink-0 min-h-[40px]"
          >
            <span>Renouveler mon abonnement</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
                {clients.length === 0 ? (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-amber-900">Aucun client</p>
                      <p className="text-[11px] text-amber-700">Vous devez enregistrer un client avant de créer une facture.</p>
                    </div>
                    <Link
                      href="/clients"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm shrink-0 min-h-[36px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter un client</span>
                    </Link>
                  </div>
                ) : (
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium"
                  >
                    <option value="">-- Sélectionner un client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date d'émission */}
              <div className="w-full">
                <DatePicker
                  label="Date d'émission *"
                  value={issueDate}
                  onChange={setIssueDate}
                  placeholder="Sélectionner la date"
                />
              </div>

              {/* Date d'échéance */}
              <div className="w-full">
                <DatePicker
                  label="Date d'échéance *"
                  value={dueDate}
                  onChange={setDueDate}
                  placeholder="Sélectionner l'échéance"
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
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Prestations & Articles ({lines.length})
              </h2>
              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors min-h-[36px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une ligne</span>
              </button>
            </div>

            <div className="space-y-3">
              {lines.map((line, index) => (
                <div
                  key={line.id}
                  className="p-3.5 sm:p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Ligne {index + 1}
                    </span>
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title="Supprimer cette ligne"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {products.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Choisir depuis le catalogue (optionnel)
                      </label>
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const p = products.find((prod) => prod.id === e.target.value);
                          if (p) {
                            handleUpdateLine(line.id, "description", p.name);
                            handleUpdateLine(line.id, "unitPrice", p.unitPrice);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 font-medium"
                      >
                        <option value="">-- Sélectionner un produit ou service --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {formatFCFA(p.unitPrice)} HT ({p.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Description de la prestation *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Conception identité visuelle, Audit cybersécurité..."
                      value={line.description}
                      onChange={(e) =>
                        handleUpdateLine(line.id, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 text-base sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 items-end">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) =>
                          handleUpdateLine(line.id, "quantity", e.target.value)
                        }
                        className="w-full px-3 py-2 text-base sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-800 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Prix Unitaire HT (FCFA)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="0"
                        value={line.unitPrice === 0 ? "" : line.unitPrice}
                        onChange={(e) =>
                          handleUpdateLine(line.id, "unitPrice", e.target.value)
                        }
                        className="w-full px-3 py-2 text-base sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none text-slate-800 font-semibold"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Total Ligne HT
                      </span>
                      <div className="px-3 py-2 bg-slate-100 rounded-xl font-bold text-slate-800 text-xs sm:text-sm truncate">
                        {formatFCFA(Math.round(line.quantity * (line.unitPrice || 0)))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Financial Summary Card */}
        <div className="space-y-4 w-full min-w-0">
          <div className="p-4 sm:p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 sticky top-20 w-full">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Récapitulatif Financier
            </h2>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total HT</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatFCFA(subtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span>TVA Sénégalaise</span>
                  <span className="px-1.5 py-0.2 text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                    {taxRate} %
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
                disabled={isSubmitting}
                onClick={() => handleSubmit("sent")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-xl transition-all shadow-sm min-h-[48px]"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{savedInvoice ? "Enregistrer" : "Valider et envoyer"}</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit("draft")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 rounded-xl transition-colors min-h-[44px]"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Enregistrer brouillon</span>
              </button>

              {savedInvoice && (
                <button
                  type="button"
                  disabled={isDownloadingPdf}
                  onClick={() => handleDownloadPdf()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 active:bg-emerald-200 rounded-xl transition-all shadow-sm min-h-[44px] disabled:opacity-50"
                >
                  {isDownloadingPdf ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    <Download className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>Télécharger la facture (PDF)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Boîte de dialogue centrée réutilisable (modale officielle) */}
      <FeedbackModal
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        variant={dialogState.variant}
        title={dialogState.title}
        description={dialogState.description}
        closeLabel="Fermer"
        confirmLabel={dialogState.confirmLabel || "Mettre à jour"}
        cancelLabel={dialogState.cancelLabel || "Annuler"}
        onConfirm={dialogState.onConfirmAction || handleConfirmUpdate}
        isLoading={isSubmitting}
        onDownload={
          savedInvoice && dialogState.variant === "success"
            ? () => handleDownloadPdf()
            : undefined
        }
        downloadLabel="Télécharger la facture"
        isDownloading={isDownloadingPdf}
      />
    </AppShell>
  );
}
