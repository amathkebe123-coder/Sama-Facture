"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";

export interface DatePickerProps {
  value?: string; // Format AAAA-MM-JJ ou vide
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  id?: string;
  align?: "left" | "right";
  size?: "default" | "sm";
}

// Jours de la semaine en français (commençant le Lundi)
const WEEK_DAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

// Mois en français
const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// Parser une chaîne AAAA-MM-JJ en objet Date locale (sans décalage UTC)
function parseLocalDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0]!, 10);
    const m = parseInt(parts[1]!, 10) - 1;
    const d = parseInt(parts[2]!, 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  return new Date();
}

// Formater un objet Date en AAAA-MM-JJ
function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Formater en français complet (ex. "8 février 2026")
function formatFrenchDisplay(dateStr?: string): string {
  if (!dateStr) return "";
  const date = parseLocalDate(dateStr);
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()]?.toLowerCase();
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Choisir une date",
  disabled = false,
  className = "",
  id,
  align = "left",
  size = "default",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Date actuellement visualisée dans le calendrier (mois/année)
  const initialDate = value ? parseLocalDate(value) : new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  // Jour ciblé pour la navigation clavier
  const [focusedDate, setFocusedDate] = useState<Date>(initialDate);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Synchroniser la vue quand la valeur externe change
  useEffect(() => {
    if (value) {
      const parsed = parseLocalDate(value);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
      setFocusedDate(parsed);
    }
  }, [value]);

  // Fermeture au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Navigation clavier : Échap pour fermer
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const next = new Date(focusedDate);
        next.setDate(next.getDate() - 1);
        setFocusedDate(next);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = new Date(focusedDate);
        next.setDate(next.getDate() + 1);
        setFocusedDate(next);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = new Date(focusedDate);
        next.setDate(next.getDate() - 7);
        setFocusedDate(next);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = new Date(focusedDate);
        next.setDate(next.getDate() + 7);
        setFocusedDate(next);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
      } else if (e.key === "Enter") {
        e.preventDefault();
        onChange(formatISODate(focusedDate));
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    },
    [isOpen, focusedDate, onChange]
  );

  // Navigation mois précédent / suivant
  const goToPrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Sélection d'une date
  const handleSelectDay = (day: number, monthOffset: number = 0) => {
    const targetDate = new Date(viewYear, viewMonth + monthOffset, day);
    onChange(formatISODate(targetDate));
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Calcul de la grille du calendrier (semaine commençant le Lundi)
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Premier jour du mois : 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  // Décalage pour Lundi = 0, ..., Dimanche = 6
  const leadingDaysCount = (firstDayOfWeek + 6) % 7;

  // Jours du mois précédent à afficher
  const prevMonthDays: number[] = [];
  for (let i = leadingDaysCount - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  // Jours du mois en cours
  const currentMonthDays: number[] = [];
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    currentMonthDays.push(d);
  }

  // Jours du mois suivant pour compléter la grille (grille complète de 35 ou 42 cases)
  const totalSlotsUsed = leadingDaysCount + daysInCurrentMonth;
  const totalGridSlots = totalSlotsUsed > 35 ? 42 : 35;
  const nextMonthDaysCount = totalGridSlots - totalSlotsUsed;
  const nextMonthDays: number[] = [];
  for (let d = 1; d <= nextMonthDaysCount; d++) {
    nextMonthDays.push(d);
  }

  // Aujourd'hui
  const today = new Date();
  const isTodayCurrentMonth =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayDateNumber = today.getDate();

  // Date sélectionnée
  const selectedParsed = value ? parseLocalDate(value) : null;
  const isSelectedCurrentMonth =
    selectedParsed &&
    selectedParsed.getFullYear() === viewYear &&
    selectedParsed.getMonth() === viewMonth;
  const selectedDateNumber = selectedParsed?.getDate();

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Label au-dessus */}
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}

      {/* 1. Champ de saisie déclencheur */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between text-left border rounded-xl transition-all cursor-pointer ${
          size === "sm"
            ? "px-3 py-1.5 text-xs min-h-[38px]"
            : "px-3.5 py-2.5 text-base sm:text-sm min-h-[44px]"
        } bg-white ${
          isOpen
            ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm"
            : "border-slate-200/90 hover:border-slate-300"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : ""}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon
            className={`w-4 h-4 shrink-0 transition-colors ${
              isOpen ? "text-emerald-600" : "text-slate-400"
            }`}
          />
          <span
            className={`truncate font-medium ${
              value ? "text-slate-900" : "text-slate-400"
            }`}
          >
            {value ? formatFrenchDisplay(value) : placeholder}
          </span>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
      </button>

      {/* 2. Panneau du calendrier (s'ouvre sous le champ / adapté mobile) */}
      {isOpen && (
        <>
          {/* Mobile backdrop for touch safety */}
          <div
            className="fixed inset-0 z-40 sm:hidden bg-black/40 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-label="Calendrier"
            className={`fixed sm:absolute z-50 left-1/2 -translate-x-1/2 ${
              align === "right"
                ? "sm:left-auto sm:right-0 sm:translate-x-0"
                : "sm:left-0 sm:translate-x-0"
            } bottom-2 sm:bottom-auto sm:top-[calc(100%+6px)] w-[94vw] max-w-[360px] sm:w-[320px] bg-white border border-slate-100 rounded-3xl sm:rounded-2xl p-4 sm:p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.06)] animate-in fade-in zoom-in-95 duration-150`}
          >
            {/* Poignée tactile mobile (iOS style bottom sheet) */}
            <div className="sm:hidden w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3" />

            {/* Header du calendrier : Boutons Précédent/Suivant carrés et Mois Année en gras */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={goToPrevMonth}
                aria-label="Mois précédent"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg border border-slate-200/90 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-colors min-w-[36px] min-h-[36px]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-bold text-sm sm:text-base text-slate-900 capitalize select-none">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={goToNextMonth}
                aria-label="Mois suivant"
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg border border-slate-200/90 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-colors min-w-[36px] min-h-[36px]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Ligne des jours de la semaine : Lu Ma Me Je Ve Sa Di */}
            <div className="grid grid-cols-7 text-center mb-1.5">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="text-xs sm:text-[11px] font-semibold text-slate-400 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grille des jours (cases >= 44x44px sur mobile pour confort tactile) */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Jours du mois précédent */}
              {prevMonthDays.map((day) => (
                <button
                  key={`prev-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day, -1)}
                  className="h-11 sm:h-9 flex items-center justify-center rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all min-h-[44px] sm:min-h-[36px]"
                >
                  {day}
                </button>
              ))}

              {/* Jours du mois en cours */}
              {currentMonthDays.map((day) => {
                const isSelected =
                  isSelectedCurrentMonth && selectedDateNumber === day;
                const isToday = isTodayCurrentMonth && todayDateNumber === day;

                return (
                  <button
                    key={`curr-${day}`}
                    type="button"
                    onClick={() => handleSelectDay(day, 0)}
                    className={`h-11 sm:h-9 flex flex-col items-center justify-center rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 relative min-h-[44px] sm:min-h-[36px] ${
                      isSelected
                        ? "bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/30 hover:bg-emerald-700"
                        : isToday
                        ? "bg-slate-100 text-slate-900 font-bold hover:bg-emerald-600 hover:text-white"
                        : "text-slate-700 hover:bg-emerald-600 hover:text-white"
                    }`}
                  >
                    <span>{day}</span>
                    {/* Petit point discret sous le chiffre pour aujourd'hui (comme sur la capture) */}
                    {isToday && !isSelected && (
                      <span className="w-1.5 h-1.5 sm:w-1 sm:h-1 rounded-full bg-slate-400 absolute bottom-1.5 sm:bottom-1" />
                    )}
                  </button>
                );
              })}

              {/* Jours du mois suivant */}
              {nextMonthDays.map((day) => (
                <button
                  key={`next-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day, 1)}
                  className="h-11 sm:h-9 flex items-center justify-center rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all min-h-[44px] sm:min-h-[36px]"
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Pied de calendrier discret : Aujourd'hui */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  onChange(formatISODate(now));
                  setIsOpen(false);
                }}
                className="text-emerald-700 hover:text-emerald-800 font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-emerald-50"
              >
                Aujourd&apos;hui
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setIsOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 py-1 px-2 rounded-lg hover:bg-slate-50"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
