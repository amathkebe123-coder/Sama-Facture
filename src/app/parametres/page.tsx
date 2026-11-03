"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, RefreshCw, Calendar, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FeedbackModal, FeedbackModalVariant } from "@/components/ui/FeedbackModal";
import { getCompanySettings, saveCompanySettings } from "@/lib/company";
import { SUBSCRIPTION_PLANS, SubscriptionPlanId } from "@/lib/subscription-plans";
import { formatFCFA } from "@/lib/money";

import { useInvoices } from "@/context/InvoiceContext";

export default function SettingsPage() {
  const { companySettings, updateSettings } = useInvoices();
  const [activeTab, setActiveTab] = useState("company");

  // Champs contrôlés
  const [companyName, setCompanyName] = useState(companySettings.companyName);
  const [ninea, setNinea] = useState(companySettings.ninea);
  const [rccm, setRccm] = useState(companySettings.rccm);
  const [phone, setPhone] = useState(companySettings.phone);
  const [address, setAddress] = useState(companySettings.address);

  // Facturation
  const [prefix, setPrefix] = useState(companySettings.prefix);
  const [defaultTax, setDefaultTax] = useState(companySettings.defaultTax);
  const [paymentTerms, setPaymentTerms] = useState(companySettings.paymentTerms);

  // État de l'abonnement
  const [subData, setSubData] = useState<{
    hasActiveSubscription: boolean;
    subscription: { status: string; plan: string; expiresAt: string | null } | null;
  } | null>(null);
  const [isLoadingSub, setIsLoadingSub] = useState(true);

  useEffect(() => {
    async function fetchSub() {
      try {
        const res = await fetch("/api/abonnement/status");
        if (res.ok) {
          const json = await res.json();
          setSubData(json);
        }
      } catch (e) {
        console.error("Erreur chargement abonnement paramètres:", e);
      } finally {
        setIsLoadingSub(false);
      }
    }
    fetchSub();
  }, []);

  useEffect(() => {
    if (companySettings) {
      setCompanyName(companySettings.companyName);
      setNinea(companySettings.ninea);
      setRccm(companySettings.rccm);
      setPhone(companySettings.phone);
      setAddress(companySettings.address);
      setPrefix(companySettings.prefix);
      setDefaultTax(companySettings.defaultTax);
      setPaymentTerms(companySettings.paymentTerms);
    }
  }, [companySettings]);

  const getSettingsSnapshot = () =>
    JSON.stringify({
      companyName: companyName.trim(),
      ninea: ninea.trim(),
      rccm: rccm.trim(),
      phone: phone.trim(),
      address: address.trim(),
      prefix: prefix.trim(),
      defaultTax: defaultTax.trim(),
      paymentTerms: paymentTerms.trim(),
    });

  const [savedSnapshot, setSavedSnapshot] = useState<string>(() => getSettingsSnapshot());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Boîte de dialogue centrée
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    variant: FeedbackModalVariant;
    title: string;
    description: string;
  }>({
    isOpen: false,
    variant: "success",
    title: "",
    description: "",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSnap = getSettingsSnapshot();

    // Cas particulier : aucun champ modifié
    if (currentSnap === savedSnapshot) {
      setDialogState({
        isOpen: true,
        variant: "info",
        title: "Aucune modification",
        description:
          "Vous n'avez modifié aucune information depuis le dernier enregistrement.",
      });
      return;
    }

    // Champs modifiés : ouvrir la boîte de dialogue de confirmation
    setDialogState({
      isOpen: true,
      variant: "confirm",
      title: "Cet élément est déjà enregistré",
      description:
        "Voulez-vous mettre à jour les paramètres de l'entreprise avec les nouvelles informations ?",
    });
  };

  const handleConfirmUpdate = async () => {
    setIsSubmitting(true);
    try {
      await updateSettings({
        companyName: companyName.trim(),
        ninea: ninea.trim(),
        rccm: rccm.trim(),
        phone: phone.trim(),
        address: address.trim(),
        prefix: prefix.trim(),
        defaultTax: defaultTax.trim(),
        paymentTerms: paymentTerms.trim(),
      });
      setSavedSnapshot(getSettingsSnapshot());
      setIsSubmitting(false);
      setDialogState({
        isOpen: true,
        variant: "success",
        title: "Paramètres mis à jour",
        description:
          "Les informations de votre entreprise ont bien été enregistrées dans Supabase. Elles apparaîtront sur vos prochaines factures.",
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Erreur d'enregistrement",
        description: err?.message || "Impossible de sauvegarder les paramètres dans Supabase.",
      });
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Paramètres de l&apos;entreprise
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Mentions légales, numérotation et canaux de paiement
          </p>
        </div>
      </div>

      {/* Tabs with horizontal scroll on mobile */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto w-full">
        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap min-h-[40px] ${
            activeTab === "company"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Entreprise & Mentions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap min-h-[40px] ${
            activeTab === "billing"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Facturation & Numérotation
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subscription")}
          className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap min-h-[40px] ${
            activeTab === "subscription"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Abonnement & Formule
        </button>
      </div>

      {/* Content Form Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4 sm:p-6 max-w-3xl w-full">
        <form onSubmit={handleSave} className="space-y-4">
          {activeTab === "company" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Raison sociale
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numéro NINEA (Sénégal)
                  </label>
                  <input
                    type="text"
                    value={ninea}
                    onChange={(e) => setNinea(e.target.value)}
                    className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numéro RCCM
                  </label>
                  <input
                    type="text"
                    value={rccm}
                    onChange={(e) => setRccm(e.target.value)}
                    className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone Wave / OM pro
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse du siège social
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                />
              </div>
            </>
          ) : activeTab === "billing" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Préfixe de numérotation
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Taux de TVA par défaut (%)
                </label>
                <input
                  type="number"
                  value={defaultTax}
                  onChange={(e) => setDefaultTax(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Délai de règlement par défaut (jours)
                </label>
                <input
                  type="number"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {isLoadingSub ? (
                <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                  <span className="text-xs sm:text-sm">Chargement de votre statut...</span>
                </div>
              ) : (
                <>
                  <div
                    className={`p-5 rounded-2xl border ${
                      subData?.hasActiveSubscription
                        ? "bg-emerald-50/60 border-emerald-200 text-slate-900"
                        : "bg-amber-50/60 border-amber-200 text-slate-900"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            subData?.hasActiveSubscription
                              ? "bg-emerald-600 text-white"
                              : "bg-amber-600 text-white"
                          }`}
                        >
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base sm:text-lg">
                              {subData?.hasActiveSubscription
                                ? "Abonnement Actif"
                                : subData?.subscription?.expiresAt
                                ? "Abonnement Expiré"
                                : "Aucun abonnement actif"}
                            </h3>
                            {subData?.subscription?.plan && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
                                {SUBSCRIPTION_PLANS[subData.subscription.plan as SubscriptionPlanId]?.name || subData.subscription.plan}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            {subData?.hasActiveSubscription ? (
                              <>
                                Date de fin de l&apos;abonnement :{" "}
                                <strong className="text-slate-900 font-bold">
                                  {subData.subscription?.expiresAt
                                    ? new Date(subData.subscription.expiresAt).toLocaleDateString("fr-FR", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "Non renseignée"}
                                </strong>
                              </>
                            ) : subData?.subscription?.expiresAt ? (
                              <>
                                Votre formule a expiré le{" "}
                                <strong className="text-slate-900 font-bold">
                                  {new Date(subData.subscription.expiresAt).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </strong>
                              </>
                            ) : (
                              "Activez un abonnement pour émettre des factures et encaisser vos paiements."
                            )}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/abonnement"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm shrink-0 min-h-[44px]"
                      >
                        <span>{subData?.hasActiveSubscription ? "Prolonger l'offre" : "Choisir une offre"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block mb-0.5">Règlement certifié PayDunya</strong>
                      <span>
                        Vos paiements sont sécurisés et certifiés par PayDunya via Wave, Orange Money et carte bancaire. La durée acquise se cumule automatiquement à votre solde restant.
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab !== "subscription" && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-xl transition-all shadow-sm min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enregistrement en cours...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Enregistrer les paramètres</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Boîte de dialogue centrée (modale officielle) */}
      <FeedbackModal
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        variant={dialogState.variant}
        title={dialogState.title}
        description={dialogState.description}
        closeLabel="Fermer"
        confirmLabel="Mettre à jour"
        cancelLabel="Annuler"
        onConfirm={handleConfirmUpdate}
        isLoading={isSubmitting}
      />
    </AppShell>
  );
}
