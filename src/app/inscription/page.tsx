"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt, Mail, Lock, User, Building2, ArrowRight } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { FeedbackModal, FeedbackModalVariant } from "@/components/ui/FeedbackModal";
import { validateAllowedEmail } from "@/lib/email-validator";

export default function InscriptionPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !companyName.trim() || !email.trim() || !password) return;

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

    // 2. Validation de l'adresse email côté serveur
    try {
      const serverCheckRes = await fetch("/api/auth/rate-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validateEmailOnly: true, email: email.trim() }),
      });
      const serverCheck = await serverCheckRes.json();
      if (!serverCheck.isValid) {
        setDialogState({
          isOpen: true,
          variant: "error",
          title: "Adresse email non autorisée",
          description: serverCheck.error || "Utilisez une adresse Gmail, iCloud ou votre adresse email professionnelle.",
        });
        return;
      }
    } catch {
      // Si la validation serveur échoue pour une raison réseau, on s'appuie sur la validation locale
    }

    if (password.length < 8) {
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Mot de passe trop court",
        description: "Votre mot de passe doit comporter au moins 8 caractères pour des raisons de sécurité.",
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      console.error("[Sama Facture Inscription] Variables d'environnement Supabase absentes !");
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
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      console.log("[Sama Facture Inscription] Envoi signUp:", {
        email: trimmedEmail,
        redirectUrl,
      });

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            company_name: companyName.trim(),
          },
          emailRedirectTo: redirectUrl,
        },
      });

      console.log("[Sama Facture Inscription] Réponse signUp:", { data, error });

      setIsLoading(false);

      if (error) {
        console.error("[Sama Facture Inscription] Erreur Supabase:", error);
        let errorTitle = "Échec de l'inscription";
        let errorDesc = error.message;

        if (
          error.message.includes("User already registered") ||
          error.message.includes("already registered")
        ) {
          errorTitle = "Email déjà utilisé";
          errorDesc = "Un compte est déjà associé à cette adresse email. Veuillez vous connecter ou réinitialiser votre mot de passe.";
        } else if (error.message.includes("Password should be at least")) {
          errorTitle = "Mot de passe invalide";
          errorDesc = "Le mot de passe doit comporter au moins 8 caractères.";
        } else if (
          error.message.includes("rate limit") ||
          error.message.includes("over_email_send_rate_limit")
        ) {
          errorTitle = "Limite d'envoi atteinte";
          errorDesc =
            "La limite d'envoi d'emails de Supabase a été atteinte. Veuillez patienter quelques minutes ou vérifier la configuration SMTP.";
        }

        setDialogState({
          isOpen: true,
          variant: "error",
          title: errorTitle,
          description: errorDesc,
        });
        return;
      }

      // Si Supabase a déjà créé la session (confirmation email désactivée)
      if (data.session) {
        console.log("[Sama Facture Inscription] Session active immédiate.");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Si le compte existait déjà sans confirmation, forcer l'envoi du code OTP
      if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
        console.warn("[Sama Facture Inscription] Compte non confirmé existant, renvoi OTP...");
        await supabase.auth.resend({
          type: "signup",
          email: trimmedEmail,
        });
      }

      // Enregistrer l'email pour la page de vérification OTP
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pending_verification_email", trimmedEmail);
      }

      // Rediriger immédiatement vers la page de vérification par code OTP
      router.push(`/verification-email?email=${encodeURIComponent(trimmedEmail)}`);
    } catch (err: any) {
      setIsLoading(false);
      console.error("[Sama Facture Inscription] Exception:", err);
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
            Créez votre compte entreprise en quelques secondes
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Inscription entreprise
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Vos coordonnées professionnelles pour vos factures
            </p>
          </div>

          <form onSubmit={handleSubmit} autoComplete="on" className="space-y-3.5">
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1">
                Nom et prénom *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="fullName"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Awa Diop"
                  className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px] transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="companyName" className="block text-xs font-semibold text-slate-700 mb-1">
                Raison sociale ou Nom d&apos;entreprise *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="companyName"
                  name="organization"
                  type="text"
                  required
                  autoComplete="organization"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Teranga Solutions SARL"
                  className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px] transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse email *
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
                  placeholder="contact@monentreprise.sn ou nom@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px] transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Gmail, iCloud ou adresse professionnelle d&apos;entreprise acceptées.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
                Mot de passe (8 caractères minimum) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 min-h-[44px] mt-2"
            >
              <span>{isLoading ? "Envoi du code..." : "Créer mon compte"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Vous possédez déjà un compte ?{" "}
              <Link
                href="/connexion"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors inline-block"
              >
                Se connecter
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
