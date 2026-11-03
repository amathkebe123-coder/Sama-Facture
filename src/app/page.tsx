import React from "react";
import Link from "next/link";
import "./globals.css";
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  Calculator,
  Smartphone,
  Download,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] text-slate-900 flex flex-col justify-between overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* =====================================================================
          EN-TÊTE NAVIGATION
          ===================================================================== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Logo Sama Facture */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center shadow-[0_2px_8px_rgba(5,150,105,0.25)] transition-transform group-hover:scale-105 shrink-0">
              <FileText className="w-5 h-5" width={20} height={20} />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
              Sama Facture
            </span>
          </Link>

          {/* Boutons d'action : Se connecter & Créer un compte */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/connexion"
              className="inline-flex items-center justify-center min-h-[44px] px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center min-h-[44px] px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              Créer un compte
            </Link>
          </div>

        </div>
      </header>

      {/* =====================================================================
          SECTION PRINCIPALE (HERO)
          ===================================================================== */}
      <main className="flex-1">
        <section className="pt-10 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-8">
          <div className="max-w-[1080px] mx-auto text-center">
            
            {/* Badge Localisation & Conformité */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Facturation conforme • Sénégal & zone UEMOA</span>
            </div>

            {/* Titre Principal */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.18] max-w-4xl mx-auto mb-5">
              La facturation simple et professionnelle pour{" "}
              <span className="text-emerald-600">votre entreprise</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Créez des factures en FCFA en quelques clics, appliquez la TVA 18% sans risque d&apos;erreur et encaissez facilement par Wave, Orange Money ou virement.
            </p>

            {/* Boutons d'Action (CTAs) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-8">
              <Link
                href="/inscription"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-7 text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-[0_4px_14px_rgba(5,150,105,0.35)] transition-all active:scale-[0.98]"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-4 h-4 shrink-0" width={16} height={16} />
              </Link>
              <Link
                href="/connexion"
                className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-6 text-sm sm:text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
              >
                Se connecter
              </Link>
            </div>

            {/* Réassurance */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500 mb-12">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" width={16} height={16} />
                100% Gratuit pour démarrer
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" width={16} height={16} />
                Sans carte bancaire
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" width={16} height={16} />
                Conforme NINEA & RCCM
              </span>
            </div>

            {/* Mockup de Facture Réelle Stylisée */}
            <div className="max-w-[560px] mx-auto bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.08)] text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Facture FAC-2026-0001
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Client : Cabinet Synergie • Dakar
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Payée par Wave
                </span>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 pb-4 border-b border-dashed border-slate-200">
                <div className="flex justify-between items-center gap-2">
                  <span>Prestation de conseil & accompagnement</span>
                  <strong className="text-slate-900 tabular-nums">500 000 FCFA</strong>
                </div>
                <div className="flex justify-between items-center gap-2 text-slate-500">
                  <span>TVA légale sénégalaise (18%)</span>
                  <span className="tabular-nums">+ 90 000 FCFA</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 font-bold text-slate-900 text-sm sm:text-base">
                <span>Total TTC à régler</span>
                <span className="text-emerald-600 text-base sm:text-lg tabular-nums">
                  590 000 FCFA
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* =====================================================================
            SECTION 4 AVANTAGES COURTS
            ===================================================================== */}
        <section className="py-12 sm:py-16 bg-white border-y border-slate-100 px-4 sm:px-8">
          <div className="max-w-[1080px] mx-auto">
            
            <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                L&apos;essentiel pour bien facturer, sans complication
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Tout ce qu&apos;il vous faut au quotidien, adapté aux réalités fiscales et commerciales locales.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Avantage 1 : FCFA & TVA 18% */}
              <div className="bg-[#F8FAFB] border border-slate-200/70 rounded-2xl p-6 transition-all hover:border-slate-300">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shrink-0">
                  <Calculator className="w-5 h-5" width={20} height={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  Factures en FCFA & TVA 18%
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Montants en Francs CFA sans décimales inutiles. La TVA de 18% est calculée automatiquement selon le Code Général des Impôts.
                </p>
              </div>

              {/* Avantage 2 : Wave & Orange Money */}
              <div className="bg-[#F8FAFB] border border-slate-200/70 rounded-2xl p-6 transition-all hover:border-slate-300">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shrink-0">
                  <Smartphone className="w-5 h-5" width={20} height={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  Paiements Wave & Orange Money
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Affichez vos numéros marchands Wave et Orange Money sur vos factures pour recevoir vos règlements plus rapidement.
                </p>
              </div>

              {/* Avantage 3 : PDF en un clic */}
              <div className="bg-[#F8FAFB] border border-slate-200/70 rounded-2xl p-6 transition-all hover:border-slate-300">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shrink-0">
                  <Download className="w-5 h-5" width={20} height={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  PDF officiel en un clic
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Téléchargez un PDF A4 certifié avec votre logo, NINEA, RCCM et coordonnées d&apos;entreprise, prêt à être envoyé par WhatsApp.
                </p>
              </div>

              {/* Avantage 4 : Suivi des encaissements */}
              <div className="bg-[#F8FAFB] border border-slate-200/70 rounded-2xl p-6 transition-all hover:border-slate-300">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shrink-0">
                  <TrendingUp className="w-5 h-5" width={20} height={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  Suivi des encaissements
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Visualisez en temps réel les factures payées, en attente et en retard pour une trésorerie parfaitement maîtrisée.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* =====================================================================
            SECTION APPEL À L'ACTION (CTA FINAL)
            ===================================================================== */}
        <section className="py-12 sm:py-16 px-4 sm:px-8">
          <div className="max-w-[1080px] mx-auto">
            <div className="bg-[#08100C] text-white rounded-3xl p-8 sm:p-14 text-center shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                Prêt à simplifier votre facturation ?
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-6">
                Rejoignez les entrepreneurs et indépendants qui gagnent du temps chaque mois avec Sama Facture.
              </p>
              <Link
                href="/inscription"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Créer un compte gratuit</span>
                <ArrowRight className="w-4 h-4 shrink-0" width={16} height={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          PIED DE PAGE (FOOTER)
          ===================================================================== */}
      <footer className="bg-white border-t border-slate-100 py-7 px-4 sm:px-8 text-xs sm:text-sm text-slate-500">
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <strong className="text-slate-800">Sama Facture</strong> — Conçu pour les entrepreneurs du Sénégal et de la zone UEMOA.
          </div>
          <div className="flex items-center gap-5">
            <Link href="/connexion" className="hover:text-emerald-600 transition-colors py-1">
              Se connecter
            </Link>
            <Link href="/inscription" className="hover:text-emerald-600 transition-colors py-1">
              Créer un compte
            </Link>
            <Link href="/aide" className="hover:text-emerald-600 transition-colors py-1">
              Centre d&apos;aide
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
