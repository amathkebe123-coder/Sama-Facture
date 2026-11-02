"use client";

import React, { useEffect, useCallback } from "react";
import { AlertCircle, RefreshCw, X, Check } from "lucide-react";

export interface ConfirmUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export function ConfirmUpdateModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Cet élément est déjà enregistré",
  message,
  itemLabel = "cet élément",
  confirmLabel = "Mettre à jour",
  cancelLabel = "Annuler",
  isLoading = false,
}: ConfirmUpdateModalProps) {
  // Gestion de la touche Échap pour fermer
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
      // Empêcher le défilement de l'arrière-plan quand la boîte est ouverte
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const defaultMessage = `Voulez-vous mettre à jour ${itemLabel} avec les nouvelles informations ?`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        // Fermeture au clic en dehors de la boîte
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture en haut à droite */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* En-tête avec icône émeraude */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </div>
          <div>
            <h3
              id="confirm-modal-title"
              className="text-base font-bold text-slate-900 leading-snug"
            >
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              {message || defaultMessage}
            </p>
          </div>
        </div>

        {/* Note informative discrète */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] sm:text-xs text-slate-500 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Aucun doublon ne sera créé. L&apos;élément existant sera directement actualisé.</span>
        </div>

        {/* Boutons d'action (tactiles >= 44px sur mobile) */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors min-h-[44px] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-sm hover:shadow min-h-[44px] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mise à jour en cours...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

