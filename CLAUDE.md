# Conventions de développement — Sama Facture

## 1. Monnaie & Nombres
- Toutes les opérations monétaires se font en FCFA entiers (`bigint` en base, `number` arrondi sans décimale côté front).
- Affichage standardisé via `formatFCFA(amount)` dans `src/lib/money.ts` (ex: "1 250 000 FCFA").
- Toujours utiliser `tabular-nums` pour les montants chiffrés.

## 2. Statuts des factures & Badges
- **Payée** (`paid`): Badge vert (`bg-emerald-50 text-emerald-700 border-emerald-200/60`).
- **Envoyée** (`sent`): Badge orange/ambre (`bg-amber-50 text-amber-700 border-amber-200/60`).
- **En retard** (`overdue`): Badge rouge (`bg-rose-50 text-rose-700 border-rose-200/60`).
- **Brouillon** (`draft`): Badge gris (`bg-slate-50 text-slate-600 border-slate-200/70`).

## 3. Dates & Fuseau
- Format standard d'affichage : `JJ/MM/AAAA` (ex : 30/10/2026).
- Fuseau horaire de référence : `Africa/Dakar` (Sénégal).

## 4. Design System & Inspiration Visuelle
- Inspiré du shot Dribbble **Northline - Decision-Focused Analytics Dashboard**.
- Sidebar sombre (`#08100C`) avec halo émeraude `radial-gradient` et sélection luminescente `active-nav-glow`.
- Arrière-plan de l'application clair et doux (`#F8FAFB`), cartes blanches `rounded-2xl` avec bordure fine `border-slate-100`.
- Mobile-first avec tiroir (drawer) pour la sidebar et vue en cartes pour les listes de factures.

## 5. Architecture & Bonnes Pratiques
- Next.js 14 App Router avec TypeScript strict.
- Données centralisées dans `src/lib/data/` (DAL).
- Les écritures passeront par des Server Actions validées par Zod.

