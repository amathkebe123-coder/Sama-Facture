"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Receipt, Mail, CheckCircle2, RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FeedbackModal, FeedbackModalVariant } from "@/components/ui/FeedbackModal";
import { useRateLimit } from "@/lib/useRateLimit";

function VerificationEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { isLocked, formattedCountdown, recordFailure, resetLimit, checkLimit } = useRateLimit();

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

  // Récupérer l'email depuis l'URL ou le sessionStorage
  useEffect(() => {
    if (!email && typeof window !== "undefined") {
      const savedEmail = sessionStorage.getItem("pending_verification_email");
      if (savedEmail) setEmail(savedEmail);
    }
  }, [email]);

  // Vérifier la limite de tentatives au chargement
  useEffect(() => {
    if (email) {
      checkLimit(email);
    }
  }, [email, checkLimit]);

  // Compte à rebours de 60 secondes pour renvoyer le code
  useEffect(() => {
    setResendCooldown(60);
    setCanResend(false);

    resendTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (resendTimerRef.current) clearInterval(resendTimerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 6 || !email) return;

    // 1. Vérification du blocage par limite de tentatives côté serveur
    const limitStatus = await checkLimit(email);
    if (limitStatus.isLocked) {
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Trop de tentatives",
        description: `Trop de tentatives échouées. Réessayez dans ${formattedCountdown}.`,
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "signup",
      });

      if (error) {
        setIsVerifying(false);
        const failStatus = await recordFailure(email);

        if (failStatus.isLocked) {
          setDialogState({
            isOpen: true,
            variant: "error",
            title: "Trop de tentatives",
            description: "Vous avez dépassé la limite de 5 tentatives échouées. Veuillez patienter 1 minute avant de réessayer.",
          });
        } else {
          setDialogState({
            isOpen: true,
            variant: "error",
            title: "Code de vérification invalide",
            description: "Le code saisi est incorrect ou a expiré. Veuillez vérifier l'email reçu ou demander un nouveau code.",
          });
        }
        return;
      }

      // Succès : réinitialiser le compteur de tentatives et rediriger
      await resetLimit(email);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pending_verification_email");
      }

      setIsVerifying(false);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setIsVerifying(false);
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Erreur inattendue",
        description: err?.message || "Impossible de vérifier le code.",
      });
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !email || isResending) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      setIsResending(false);

      if (error) {
        setDialogState({
          isOpen: true,
          variant: "error",
          title: "Échec de renvoi",
          description: error.message || "Impossible de renvoyer le code pour le moment.",
        });
        return;
      }

      // Redémarrer le compte à rebours de 60s
      setCanResend(false);
      setResendCooldown(60);

      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
      resendTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            if (resendTimerRef.current) clearInterval(resendTimerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setDialogState({
        isOpen: true,
        variant: "success",
        title: "Nouveau code envoyé",
        description: `Un nouveau code de vérification à 6 chiffres a été envoyé à ${email}.`,
      });
    } catch (err: any) {
      setIsResending(false);
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Erreur de renvoi",
        description: err?.message || "Une erreur est survenue.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-[440px] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 mb-2">
            <Receipt className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sama Facture
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Vérification de sécurité du compte
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Vérifiez votre adresse email
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Nous avons envoyé un code de vérification à 6 chiffres à l&apos;adresse :
            </p>
            <p className="text-xs font-bold text-emerald-700 bg-emerald-50/80 py-1 px-3 rounded-lg mt-2 inline-block break-all border border-emerald-100/60">
              {email || "votre adresse email"}
            </p>
          </div>

          {/* Bannière de verrouillage en cas de dépassement de limite */}
          {isLocked && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center font-medium">
              Trop de tentatives. Réessayez dans <span className="font-bold tabular-nums">{formattedCountdown}</span>.
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 text-center mb-2">
                Saisissez le code à 6 chiffres
              </label>
              <input
                type="text"
                required
                autoFocus
                disabled={isLocked || isVerifying}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                className="w-full text-center text-2xl sm:text-3xl font-mono tracking-[0.35em] font-bold py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[52px] text-slate-900 transition-colors disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || isLocked || code.length < 6}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 min-h-[44px]"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Vérification en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmer et accéder à Sama Facture</span>
                </>
              )}
            </button>
          </form>

          {/* Section Renvoyer le code avec compte à rebours de 1 minute */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-3 text-center">
            <p className="text-xs text-slate-500">
              Vous n&apos;avez pas reçu le code ?
            </p>
            <button
              type="button"
              disabled={!canResend || isResending}
              onClick={handleResendCode}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 transition-colors min-h-[44px] flex items-center justify-center gap-1.5"
            >
              {isResending ? (
                <span>Envoi en cours...</span>
              ) : canResend ? (
                <span>Renvoyer le code</span>
              ) : (
                <span>
                  Renvoyer le code dans{" "}
                  <span className="font-mono font-bold tabular-nums">
                    0:{String(resendCooldown).padStart(2, "0")}
                  </span>
                </span>
              )}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 text-center">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors py-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modifier l&apos;adresse email</span>
            </Link>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        variant={dialogState.variant}
        title={dialogState.title}
        description={dialogState.description}
      />
    </div>
  );
}

export default function VerificationEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
          <div className="text-xs text-slate-500">Chargement...</div>
        </div>
      }
    >
      <VerificationEmailContent />
    </Suspense>
  );
}

