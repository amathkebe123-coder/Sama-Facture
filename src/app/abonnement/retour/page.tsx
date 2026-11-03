"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ArrowRight, RefreshCw, FileText, LayoutDashboard } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SUBSCRIPTION_PLANS, SubscriptionPlanId } from "@/lib/subscription-plans";

export default function SubscriptionReturnPage() {
  const [status, setStatus] = useState<"checking" | "active" | "pending">("checking");
  const [subscription, setSubscription] = useState<{
    plan: string;
    expiresAt: string | null;
  } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/abonnement/status");
      if (res.ok) {
        const data = await res.json();
        if (data.hasActiveSubscription) {
          setSubscription(data.subscription);
          setStatus("active");
          return true;
        }
      }
    } catch (e) {
      console.error("Erreur vérification abonnement:", e);
    }
    return false;
  };

  useEffect(() => {
    let intervalId: any;
    let attempts = 0;
    const maxAttempts = 12; // 12 * 2.5s = 30 secondes d'attente maximum

    async function poll() {
      const isConfirmed = await checkStatus();
      attempts++;
      setRetryCount(attempts);

      if (isConfirmed || attempts >= maxAttempts) {
        clearInterval(intervalId);
        if (!isConfirmed) {
          setStatus("pending");
        }
      }
    }

    // Première vérification immédiate
    poll();
    intervalId = setInterval(poll, 2500);

    return () => clearInterval(intervalId);
  }, []);

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleDateString("fr-FR", {
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

  const planName = subscription?.plan
    ? SUBSCRIPTION_PLANS[subscription.plan as SubscriptionPlanId]?.name || subscription.plan
    : "Abonnement";

  return (
    <AppShell>
      <div className="max-w-xl mx-auto py-8 sm:py-16">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm text-center">
          
          {/* État 1 : En cours de vérification */}
          {status === "checking" && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Vérification de votre paiement...
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Nous vérifions la confirmation de la transaction avec PayDunya. Cette étape ne prend que quelques secondes.
              </p>
              <div className="pt-2 text-xs text-slate-400">
                Tentative {retryCount} / 12
              </div>
            </div>
          )}

          {/* État 2 : Confirmation confirmée par Supabase */}
          {status === "active" && (
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Abonnement activé avec succès !
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Votre formule <strong className="text-slate-900">{planName}</strong> est désormais active.
                </p>
              </div>

              {subscription?.expiresAt && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl text-xs sm:text-sm text-emerald-900">
                  <span>Valable jusqu&apos;au : </span>
                  <strong className="font-bold">{formatDate(subscription.expiresAt)}</strong>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/factures/nouvelle"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-6 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                >
                  <FileText className="w-4 h-4" />
                  <span>Créer une facture</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Tableau de bord</span>
                </Link>
              </div>
            </div>
          )}

          {/* État 3 : Traitement en attente / Délai réseau */}
          {status === "pending" && (
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Paiement en cours de traitement
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mt-1">
                  Votre règlement a été transmis à l&apos;opérateur. La confirmation par le serveur PayDunya peut prendre de quelques secondes à une minute.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 text-left space-y-1">
                <p className="font-semibold text-slate-800">Que se passe-t-il ensuite ?</p>
                <p>Dès réception de la notification de paiement certifiée, votre compte sera immédiatement activé sans aucune intervention de votre part.</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStatus("checking");
                    checkStatus().then((isDone) => {
                      if (!isDone) setStatus("pending");
                    });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Vérifier à nouveau</span>
                </button>
                <Link
                  href="/parametres"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                >
                  <span>Voir mes paramètres</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}

