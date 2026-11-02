"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Receipt, Mail, ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FeedbackModal, FeedbackModalVariant } from "@/components/ui/FeedbackModal";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
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
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/reinitialisation-mot-de-passe`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      setIsLoading(false);

      if (error) {
        setDialogState({
          isOpen: true,
          variant: "error",
          title: "Échec de l'envoi",
          description: error.message || "Une erreur est survenue lors de l'envoi de l'email.",
        });
        return;
      }

      setDialogState({
        isOpen: true,
        variant: "success",
        title: "Lien envoyé avec succès",
        description: `Si un compte correspond à ${email.trim()}, vous recevrez un email contenant les instructions pour réinitialiser votre mot de passe.`,
      });
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
            Récupération d&apos;accès à votre compte
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Mot de passe oublié ?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Saisissez votre email pour recevoir un lien de réinitialisation sécurisé
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Adresse email de votre compte
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="awa.diop@entreprise.sn"
                  className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 min-h-[44px] mt-2"
            >
              <span>{isLoading ? "Envoi en cours..." : "Envoyer le lien"}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              href="/connexion"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à la page de connexion</span>
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

