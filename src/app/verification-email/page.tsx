"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Receipt, CheckCircle2, RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { FeedbackModal, FeedbackModalVariant } from "@/components/ui/FeedbackModal";
import { useRateLimit } from "@/lib/useRateLimit";

function VerificationEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
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

  // Focus initial sur la première case
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  // Exécution de la vérification du code à 6 chiffres
  const executeVerify = async (codeToVerify: string) => {
    if (!codeToVerify || codeToVerify.length !== 6 || !email || isVerifying) return;

    if (!isSupabaseConfigured()) {
      console.error("[Sama Facture] Variables d'environnement Supabase absentes sur Vercel !");
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Configuration Supabase manquante",
        description:
          "Les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY ne sont pas renseignées sur Vercel.",
      });
      return;
    }

    // 1. Vérification du rate limiting
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
    setHasError(false);

    console.log("[Sama Facture] Tentative verifyOtp pour:", email, "Code:", codeToVerify);

    try {
      // 1. Essai avec type 'signup' (standard confirmation d'inscription)
      let { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: codeToVerify.trim(),
        type: "signup",
      });

      // 2. Si échec, tentative de repli avec type 'email' (au cas où Supabase l'ait envoyé comme OTP de connexion/magique)
      if (error) {
        console.warn(
          "[Sama Facture] verifyOtp type 'signup' a échoué:",
          error.message,
          "— repli sur type 'email'..."
        );
        const fallback = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: codeToVerify.trim(),
          type: "email",
        });

        if (!fallback.error) {
          data = fallback.data;
          error = null;
        } else {
          console.error("[Sama Facture] verifyOtp fallback 'email' a également échoué:", fallback.error);
        }
      }

      if (error) {
        setIsVerifying(false);
        setHasError(true);
        console.error("[Sama Facture] Erreur finale verifyOtp:", error);

        const failStatus = await recordFailure(email);

        // Animation d'erreur : vider les cases après la secousse et refocus sur la case 1
        setTimeout(() => {
          setDigits(["", "", "", "", "", ""]);
          setHasError(false);
          inputRefs.current[0]?.focus();
        }, 600);

        if (failStatus.isLocked) {
          setDialogState({
            isOpen: true,
            variant: "error",
            title: "Trop de tentatives",
            description:
              "Vous avez dépassé la limite de 5 tentatives échouées. Veuillez patienter 1 minute avant de réessayer.",
          });
        } else {
          setDialogState({
            isOpen: true,
            variant: "error",
            title: "Code de vérification invalide",
            description:
              "Le code à 6 chiffres est incorrect ou a expiré. Veuillez vérifier votre boîte email ou demander un nouveau code.",
          });
        }
        return;
      }

      // Succès
      console.log("[Sama Facture] Code validé avec succès !", data);
      await resetLimit(email);

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pending_verification_email");
      }

      setIsVerifying(false);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setIsVerifying(false);
      setHasError(true);
      console.error("[Sama Facture] Exception lors de verifyOtp:", err);

      setTimeout(() => {
        setDigits(["", "", "", "", "", ""]);
        setHasError(false);
        inputRefs.current[0]?.focus();
      }, 600);

      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Erreur inattendue",
        description: err?.message || "Impossible de vérifier le code.",
      });
    }
  };

  // Gestion de la saisie d'un chiffre
  const handleDigitChange = (index: number, value: string) => {
    // Si l'utilisateur colle ou tape plusieurs caractères d'un coup (autofill mobile)
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length > 1) {
      const newDigits = [...digits];
      for (let i = 0; i < cleaned.length; i++) {
        if (index + i < 6) {
          newDigits[index + i] = cleaned[i]!;
        }
      }
      setDigits(newDigits);
      const nextFocus = Math.min(index + cleaned.length, 5);
      inputRefs.current[nextFocus]?.focus();

      const fullCode = newDigits.join("");
      if (fullCode.length === 6) {
        executeVerify(fullCode);
      }
      return;
    }

    // Caractère unique ou vide
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    if (cleaned) {
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      const fullCode = newDigits.join("");
      if (fullCode.length === 6) {
        executeVerify(fullCode);
      }
    }
  };

  // Touches Effacer et navigation flèches
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Collage global (Ctrl+V ou appui long mobile)
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]!;
    }
    setDigits(newDigits);

    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();

    if (pasted.length === 6) {
      executeVerify(pasted);
    }
  };

  // Renvoi d'un nouveau code
  const handleResendCode = async () => {
    if (!canResend || !email || isResending) return;

    if (!isSupabaseConfigured()) {
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Configuration Supabase manquante",
        description:
          "Les variables d'environnement Supabase ne sont pas configurées sur Vercel.",
      });
      return;
    }

    setIsResending(true);
    console.log("[Sama Facture] Demande de renvoi code OTP pour:", email);

    try {
      const { data, error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      console.log("[Sama Facture] Résultat resend:", { data, error });
      setIsResending(false);

      if (error) {
        console.error("[Sama Facture] Erreur resend:", error);
        let errorDesc = error.message;

        if (
          error.message.includes("rate limit") ||
          error.message.includes("over_email_send_rate_limit")
        ) {
          errorDesc =
            "La limite d'envoi d'emails a été atteinte. Veuillez patienter quelques minutes avant de demander un nouveau code.";
        }

        setDialogState({
          isOpen: true,
          variant: "error",
          title: "Échec de renvoi",
          description: errorDesc,
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
      console.error("[Sama Facture] Exception resend:", err);
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Erreur de renvoi",
        description: err?.message || "Une erreur est survenue lors de l'envoi du code.",
      });
    }
  };

  const fullCodeValue = digits.join("");

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-[440px] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 mb-2">
            <Receipt className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Yomb Facture
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Vérification de sécurité du compte
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeVerify(fullCodeValue);
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 text-center mb-3">
                Saisissez le code à 6 chiffres
              </label>

              {/* 6 Cases carrées professionnelles avec auto-tab, paste, clavier numérique mobile */}
              <div
                className={`flex items-center justify-center gap-2 sm:gap-3 py-1 ${
                  hasError ? "animate-shake" : ""
                }`}
                onPaste={handlePaste}
              >
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={idx === 0 ? 6 : 1}
                    autoComplete={idx === 0 ? "one-time-code" : "off"}
                    disabled={isLocked || isVerifying}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl sm:rounded-2xl border transition-all duration-150 tabular-nums select-all min-h-[44px] ${
                      hasError
                        ? "border-rose-500 bg-rose-50/80 text-rose-700 ring-4 ring-rose-500/15"
                        : digit
                        ? "border-emerald-600 bg-white text-slate-900 ring-2 ring-emerald-500/20 shadow-sm"
                        : "border-slate-200 bg-slate-50/70 text-slate-900 hover:border-slate-300 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 focus:shadow-[0_0_12px_rgba(5,150,105,0.2)] focus:scale-[1.03]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={`Chiffre ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || isLocked || fullCodeValue.length < 6}
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
                  <span>Confirmer et accéder à Yomb Facture</span>
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
