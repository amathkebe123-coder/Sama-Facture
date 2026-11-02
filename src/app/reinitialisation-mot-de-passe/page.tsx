"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Lock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FeedbackModal, FeedbackModalVariant } from "@/components/ui/FeedbackModal";

export default function ReinitialisationMotDePassePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    variant: FeedbackModalVariant;
    title: string;
    description: string;
    onCloseAction?: () => void;
  }>({
    isOpen: false,
    variant: "info",
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Mot de passe trop court",
        description: "Votre nouveau mot de passe doit comporter au moins 8 caractères.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setDialogState({
        isOpen: true,
        variant: "error",
        title: "Mots de passe non identiques",
        description: "Les deux mots de passe saisis ne correspondent pas.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      setIsLoading(false);

      if (error) {
        setDialogState({
          isOpen: true,
          variant: "error",
          title: "Échec de réinitialisation",
          description: error.message || "Le lien a peut-être expiré. Veuillez refaire une demande de réinitialisation.",
        });
        return;
      }

      setDialogState({
        isOpen: true,
        variant: "success",
        title: "Mot de passe mis à jour !",
        description: "Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter à votre compte.",
        onCloseAction: () => router.push("/connexion"),
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
            Définissez votre nouveau mot de passe
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="mb-5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Nouveau mot de passe
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choisissez un mot de passe sécurisé d&apos;au moins 8 caractères
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[44px] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50 min-h-[44px] mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? "Enregistrement..." : "Enregistrer le mot de passe"}</span>
            </button>
          </form>
        </div>
      </div>

      <FeedbackModal
        isOpen={dialogState.isOpen}
        onClose={() => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          if (dialogState.onCloseAction) dialogState.onCloseAction();
        }}
        variant={dialogState.variant}
        title={dialogState.title}
        description={dialogState.description}
      />
    </div>
  );
}

