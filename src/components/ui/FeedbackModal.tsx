"use client";

import React, { useEffect, useCallback } from "react";
import { Check, Info, AlertTriangle, X, RefreshCw, Download } from "lucide-react";

export type FeedbackModalVariant = "success" | "info" | "error" | "confirm";

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: FeedbackModalVariant;
  title: string;
  description: string;
  closeLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
  onDownload?: () => void | Promise<void>;
  downloadLabel?: string;
  isDownloading?: boolean;
}

export function FeedbackModal({
  isOpen,
  onClose,
  variant = "success",
  title,
  description,
  closeLabel = "Fermer",
  confirmLabel = "Mettre à jour",
  cancelLabel = "Annuler",
  onConfirm,
  isLoading = false,
  onDownload,
  downloadLabel = "Télécharger la facture",
  isDownloading = false,
}: FeedbackModalProps) {
  // Fermeture à la touche Échap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    },
    [onClose, isLoading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Configuration des icônes et styles selon la variante
  const variantConfig = {
    success: {
      badgeBg: "bg-emerald-50 border border-emerald-200/80 text-emerald-600 ring-8 ring-emerald-50/60",
      icon: <Check className="w-6 h-6 stroke-[2.5]" />,
    },
    info: {
      badgeBg: "bg-slate-100 border border-slate-200 text-slate-600 ring-8 ring-slate-100/60",
      icon: <Info className="w-6 h-6 stroke-[2.5]" />,
    },
    error: {
      badgeBg: "bg-rose-50 border border-rose-200 text-rose-600 ring-8 ring-rose-50/60",
      icon: <AlertTriangle className="w-6 h-6 stroke-[2.5]" />,
    },
    confirm: {
      badgeBg: "bg-emerald-50 border border-emerald-200/80 text-emerald-600 ring-8 ring-emerald-50/60",
      icon: <RefreshCw className={`w-6 h-6 stroke-[2.5] ${isLoading ? "animate-spin" : ""}`} />,
    },
  }[variant];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 max-w-[400px] w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-100 animate-in zoom-in-95 duration-150 relative space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton croix "X" en haut à droite */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Icône centrée en haut dans un cercle doux */}
        <div className="flex justify-center pt-1 pb-1">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform ${variantConfig.badgeBg}`}
          >
            {variantConfig.icon}
          </div>
        </div>

        {/* 2. Titre centré en gras */}
        <div className="space-y-1.5 px-2">
          <h3
            id="feedback-modal-title"
            className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
          >
            {title}
          </h3>

          {/* 3. Phrase d'explication centrée en gris */}
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed text-center">
            {description}
          </p>
        </div>

        {/* 4. Boutons d'action */}
        <div className="pt-2">
          {variant === "confirm" ? (
            /* Deux boutons côte à côte pour la confirmation */
            <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 w-full">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:flex-1 py-3 px-4 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors min-h-[44px] disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm min-h-[44px] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>En cours...</span>
                  </>
                ) : (
                  <span>{confirmLabel}</span>
                )}
              </button>
            </div>
          ) : (
            /* Notifications standard (Succès, Info, Erreur) */
            <div className="w-full space-y-2">
              {onDownload && (
                <button
                  type="button"
                  onClick={onDownload}
                  disabled={isDownloading || isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm hover:shadow min-h-[44px] disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Génération du PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{downloadLabel}</span>
                    </>
                  )}
                </button>
              )}

              {/* Bouton "Fermer" sur toute la largeur (bleu nuit foncé comme l'onglet actif) */}
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full py-3 px-4 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-black rounded-xl transition-all shadow-sm hover:shadow min-h-[44px] disabled:opacity-50"
              >
                {closeLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

