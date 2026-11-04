"use client";

import React, { useState, useEffect } from "react";
import { Check, ShieldCheck, Zap, ArrowRight, RefreshCw, Calendar, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { FeedbackModal, FeedbackModalVariant } from "@/components/ui/FeedbackModal";
import { SUBSCRIPTION_PLANS, SubscriptionPlanId } from "@/lib/subscription-plans";
import { formatFCFA } from "@/lib/money";

interface UserSubscription {
  status: string;
  plan: string;
  expiresAt: string | null;
}

export default function SubscriptionPage() {
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanId | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [hasActiveSub, setHasActiveSub] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

  // Modale unique de retour utilisateur
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

  // Charger le statut actuel de l'abonnement
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("/api/abonnement/status");
        if (res.ok) {
          const data = await res.json();
          setSubscription(data.subscription);
          setHasActiveSub(Boolean(data.hasActiveSubscription));
        }
      } catch (err) {
        console.error("Erreur chargement statut abonnement:", err);
      } finally {
        setIsLoadingStatus(false);
      }
    }
    loadStatus();
  }, []);

  const handleSelectPlan = async (planId: SubscriptionPlanId) => {
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/paiement/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setDialogState({
          isOpen: true,
          variant: "error",
          title: "Erreur d'initialisation",
          description:
            data.message ||
            "Impossible d'initialiser le paiement sécurisé avec PayDunya. Veuillez réessayer.",
        });
        return;
      }

      // Redirection sécurisée vers la page de paiement PayDunya (PAR)
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Erreur paiement:", err);
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Connexion impossible",
        description:
          "Une erreur réseau est survenue. Vérifiez votre connexion et réessayez.",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "Non définie";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const planOrder: SubscriptionPlanId[] = ["monthly", "six_months", "yearly"];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* En-tête */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Facturation sans interruption • Zone UEMOA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Abonnement Yomb Facture
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl">
            Activez ou renouvelez votre formule pour créer vos factures, calculer la TVA 18% et recevoir vos paiements Wave &amp; Orange Money en toute sécurité.
          </p>
        </div>

        {/* État actuel de l'abonnement */}
        {!isLoadingStatus && subscription && (
          <div
            className={`p-5 rounded-2xl border ${
              hasActiveSub
                ? "bg-emerald-50/50 border-emerald-200 text-slate-900"
                : "bg-amber-50/60 border-amber-200 text-slate-900"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    hasActiveSub
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">
                      {hasActiveSub ? "Abonnement en cours" : "Abonnement expiré"}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        hasActiveSub
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {subscription.plan
                        ? SUBSCRIPTION_PLANS[subscription.plan as SubscriptionPlanId]?.name || subscription.plan
                        : "Plan standard"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    {hasActiveSub ? "Date de fin de validité :" : "Expiré le :"}{" "}
                    <strong className="text-slate-900 font-semibold">
                      {formatDate(subscription.expiresAt)}
                    </strong>
                  </p>
                </div>
              </div>

              {hasActiveSub && (
                <div className="text-xs text-emerald-700 bg-white/80 px-3 py-1.5 rounded-lg border border-emerald-200/80 font-medium">
                  Renouveler prolonge votre durée restante
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grille des 3 offres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planOrder.map((planId) => {
            const plan = SUBSCRIPTION_PLANS[planId];
            const isPopular = plan.id === "six_months";
            const isLoading = loadingPlan === planId;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-200 ${
                  isPopular
                    ? "border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                    : "border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Badge promotionnel / populaire */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold tracking-wide uppercase shadow-sm">
                      <Zap className="w-3 h-3 fill-white" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Titre et description */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Prix en FCFA */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                        {formatFCFA(plan.amount)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
                      Engagement de {plan.durationLabel}
                    </span>
                  </div>

                  {/* Liste des fonctionnalités incluses */}
                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Inclus dans cette offre :
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton de paiement sécurisé via PayDunya */}
                <button
                  type="button"
                  disabled={Boolean(loadingPlan)}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full min-h-[48px] rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPopular
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Redirection PayDunya...</span>
                    </>
                  ) : (
                    <>
                      <span>Payer {formatFCFA(plan.amount)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Réassurance & moyens de paiement certifiés */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Paiement 100% sécurisé via PayDunya
              </h4>
              <p className="text-xs text-slate-500">
                Réglez en toute simplicité par Wave, Orange Money, Free Money ou carte bancaire.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium shrink-0">
            <span>Redirection officielle PAR</span>
            <span>•</span>
            <span>Activation instantanée</span>
          </div>
        </div>
      </div>

      {/* Boîte de dialogue de retour */}
      <FeedbackModal
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        variant={dialogState.variant}
        title={dialogState.title}
        description={dialogState.description}
      />
    </AppShell>
  );
}

