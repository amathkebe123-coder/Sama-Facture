"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt, Mail, Lock, ArrowRight, RefreshCw } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { FeedbackModal, FeedbackModalVariant } from "@/components/ui/FeedbackModal";
import { validateAllowedEmail } from "@/lib/email-validator";
import { useRateLimit } from "@/lib/useRateLimit";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { isLocked, formattedCountdown, checkLimit, recordFailure, resetLimit } = useRateLimit();

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

  // Charger l'email mémorisé si existant
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("sama_facture_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        checkLimit(savedEmail);
      }
    }
  }, [checkLimit]);

  const handleEmailBlur = () => {
    if (email) {
      checkLimit(email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    // 1. Validation de l'adresse email côté client
    const emailCheck = validateAllowedEmail(email);
    if (!emailCheck.isValid) {
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Adresse email non autorisée",
        description: emailCheck.error || "Utilisez une adresse Gmail, iCloud ou votre adresse email professionnelle.",
      });
      return;
    }

    // 2. Vérification de la limite de tentatives côté serveur
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

    if (!isSupabaseConfigured()) {
      console.error("[Sama Facture Connexion] Variables d'environnement Supabase absentes !");
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Configuration Supabase manquante",
        description:
          "Les variables d'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY ne sont pas renseignées sur Vercel. Veuillez les ajouter dans les paramètres Vercel du projet.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      console.log("[Sama Facture Connexion] Tentative connexion pour:", trimmedEmail);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      console.log("[Sama Facture Connexion] Réponse signInWithPassword:", { data, error });

      if (error) {
        setIsLoading(false);
        const failStatus = await recordFailure(trimmedEmail);

        let errorTitle = "Échec de connexion";
        let errorDesc = "Une erreur est survenue lors de la connexion. Veuillez réessayer.";

        if (failStatus.isLocked) {
          errorTitle = "Trop de tentatives";
          errorDesc = "Vous avez dépassé la limite de 5 tentatives échouées. Veuillez patienter 1 minute avant de réessayer.";
        } else if (error.message.includes("Invalid login credentials")) {
          errorTitle = "Identifiants incorrects";
          errorDesc = "L'adresse email ou le mot de passe est incorrect. Veuillez vérifier vos informations.";
        } else if (error.message.includes("Email not confirmed")) {
          console.warn("[Sama Facture Connexion] Email non confirmé. Déclenchement de l'envoi du code OTP...");
          // Déclencher automatiquement l'envoi du code par Supabase
          try {
            await supabase.auth.resend({
              type: "signup",
              email: trimmedEmail,
            });
            console.log("[Sama Facture Connexion] Code OTP renvoyé avec succès.");
          } catch (resendErr) {
            console.error("[Sama Facture Connexion] Erreur renvoi OTP:", resendErr);
          }

          errorTitle = "Adresse email non confirmée";
          errorDesc = "Votre adresse email n'a pas encore été vérifiée. Un code à 6 chiffres vient de vous être envoyé par email.";
          // Enregistrer et rediriger vers la page OTP
          if (typeof window !== "undefined") {
            sessionStorage.setItem("pending_verification_email", trimmedEmail);
          }
          router.push(`/verification-email?email=${encodeURIComponent(trimmedEmail)}`);
          return;
        }

        setDialogState({
          isOpen: true,
          variant: "error",
          title: errorTitle,
          description: errorDesc,
        });
        return;
      }

      // Connexion réussie : réinitialiser les compteurs d'échec
      await resetLimit(trimmedEmail);

      // Gestion de "Se souvenir de moi"
      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem("sama_facture_remembered_email", trimmedEmail);
        } else {
          localStorage.removeItem("sama_facture_remembered_email");
        }
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setIsLoading(false);
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Erreur inattendue",
        description: err?.message || "Impossible de joindre le serveur d'authentification.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 mb-2">
            <Receipt className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sama Facture
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Facturation & Encaissements conformes au Sénégal
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Connexion à votre espace
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accédez à vos factures, clients et rapports
            </p>
          </div>

          {/* Bannière de verrouillage en cas de dépassement de limite */}
          {isLocked && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center font-medium">
              Trop de tentatives. Réessayez dans <span className="font-bold tabular-nums">{formattedCountdown}</span>.
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="awa.diop@entreprise.sn ou nom@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Mot de passe
                </label>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors py-1"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px] transition-colors"
                />
              </div>
            </div>

            {/* Case Se souvenir de moi */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-600 select-none cursor-pointer">
                Se souvenir de moi sur cet appareil
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 min-h-[44px] mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Pas encore de compte ?{" "}
              <Link
                href="/inscription"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors inline-block py-1"
              >
                Créer un compte entreprise
              </Link>
            </p>
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
