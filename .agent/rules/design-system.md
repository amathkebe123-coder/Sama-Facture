---
description: Design System officiel de Sama Facture — Norme visuelle stricte pour toutes les pages et composants
alwaysApply: true
---

# Design System Officiel — Sama Facture

> **Règle Workspace Always-On** : Ce document constitue la source de vérité absolue pour l'interface de **Sama Facture**. Tout nouveau composant, page ou refactorisation doit s'y conformer strictement.

---

## 1. Palette de Couleurs Complète

### 1.1 Arrière-plans & Surfaces
| Token / Rôle | Valeur Hex / CSS | Classe Tailwind | Utilisation |
|---|---|---|---|
| **Fond App / Body** | `#F8FAFB` (`var(--background)`) | `bg-background` ou `bg-[#F8FAFB]` | Arrière-plan global de l'application |
| **Surface Blanche** | `#FFFFFF` (`var(--surface)`) | `bg-white` | Cartes KPI, tableaux, conteneur de graphiques, popovers |
| **Surface Douce** | `#F8FAFC` (Slate 50) | `bg-slate-50` | Champs de recherche, en-têtes de tableau (`bg-slate-50/60`), états hover légers |
| **Sidebar Fond** | `#08100C` | `bg-[#08100C]` | Fond principal de la navigation latérale |
| **Surface Sombre Élevée** | `#0D1812` / `#09150F` | `bg-[#0D1812]` | Cartes internes sombres (profil utilisateur sidebar, carte alerte Insight) |
| **Surface Tooltip** | `#0F172A` (95% opacité) | `bg-slate-900/95 backdrop-blur-sm` | Infobulles graphiques flottantes |
| **Backdrop Modal** | `rgba(0, 0, 0, 0.7)` | `bg-black/70 backdrop-blur-sm` | Voile de fond du tiroir mobile et modales |

### 1.2 Primaire Vert Émeraude (Identité de Marque)
| Nuance | Hex | Classe Tailwind | Utilisation |
|---|---|---|---|
| **Émeraude 50** | `#ECFDF5` | `bg-emerald-50`, `text-emerald-600` | Fonds de badges de statut payée, conteneurs d'icônes d'en-tête, badge date |
| **Émeraude 100** | `#D1FAE5` | `border-emerald-100/80` | Bordures fines de badges positifs |
| **Émeraude 200** | `#A7F3D0` | `border-emerald-200/60` | Bordure du badge de statut "Payée" |
| **Émeraude 400** | `#34D399` | `bg-emerald-400`, `text-emerald-400` | Bouton d'action lumineux (Insight/WhatsApp), accents néon, puce active de la jauge |
| **Émeraude 500** | `#10B981` | `bg-emerald-500`, `text-emerald-500` | Puce d'état statut Payée, pastille de notification topbar, glow vert |
| **Émeraude 600** | `#059669` | `bg-emerald-600` | **Bouton d'action principal CTA** (`+ Nouvelle facture`), dégradé du logo |
| **Émeraude 700** | `#047857` | `text-emerald-700`, `hover:bg-emerald-700` | Texte de badge statut "Payée", état hover du bouton primaire |
| **Émeraude 800** | `#065F46` | `active:bg-emerald-800` | État active/pressé du bouton primaire |

### 1.3 Textes & Typographie
| Niveau | Valeur Hex / Token | Classe Tailwind | Utilisation |
|---|---|---|---|
| **Texte Principal / Titres** | `#0F172A` (`var(--foreground)`) | `text-slate-900` | Titres de pages, titres de sections, montants en gras, noms de clients |
| **Texte Corps Fort** | `#1E293B` | `text-slate-800` | En-têtes de sous-blocs, texte de carte d'alerte |
| **Texte Corps Standard** | `#475569` | `text-slate-600` | Descriptions de prestations, boutons secondaires |
| **Texte Secondaire / Muted** | `#64748B` | `text-slate-500` | Sous-titres, libellés d'en-tête de colonnes (`uppercase`), descriptions |
| **Texte Tertiaire / Placeholder** | `#94A3B8` | `text-slate-400` | Placeholders d'input, dates secondaires, icônes inactives |
| **Texte Sidebar Inactif** | `#94A3B8` | `text-slate-400 hover:text-slate-200` | Liens inactifs du menu latéral sombre |
| **Texte Sidebar Actif** | `#FFFFFF` | `text-white` | Lien de navigation courant dans la sidebar |

### 1.4 Statuts Financiers des Factures (Norme Métier Stricte)
| Statut | Fond (`bg`) | Texte (`text`) | Bordure (`border`) | Puce (`dot`) |
|---|---|---|---|---|
| **Payée** (`paid`) | `bg-emerald-50` (`#ECFDF5`) | `text-emerald-700` (`#047857`) | `border-emerald-200/60` | `bg-emerald-500` (`#10B981`) |
| **Envoyée** (`sent`) | `bg-amber-50` (`#FFFBEB`) | `text-amber-700` (`#B45309`) | `border-amber-200/60` | `bg-amber-500` (`#F59E0B`) |
| **En retard** (`overdue`) | `bg-rose-50` (`#FEF2F2`) | `text-rose-700` (`#B91C1C`) | `border-rose-200/60` | `bg-rose-500` (`#F43F5E`) |
| **Brouillon** (`draft`) | `bg-slate-50` (`#F1F5F9`) | `text-slate-600` (`#475569`) | `border-slate-200/70` | `bg-slate-400` (`#94A3B8`) |
| **Partielle** (`partial`) | `bg-blue-50` (`#EFF6FF`) | `text-blue-700` (`#1D4ED8`) | `border-blue-200/60` | `bg-blue-500` (`#3B82F6`) |

---

## 2. Typographie & Règle des Écrans Mobiles

### 2.1 Famille de Police
```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### 2.2 Règle Anti-Zoom Safari iOS sur Formulaires
> [!IMPORTANT]
> **Règle iOS stricte** : Tout champ `<input>`, `<select>` ou `<textarea>` doit avoir une taille de police d'au moins **16px** (`text-base`) sur mobile pour éviter qu'iOS Safari ne zoome automatiquement la page au focus.
> Utiliser systématiquement : `text-base sm:text-sm`.

---

## 3. Normes Mobiles & Responsivité Stricte (Mobile-First)

### 3.1 Interdiction Absolue de Débordement Horizontal
- Tous les conteneurs racines doivent posséder `max-w-full w-full overflow-x-hidden`.
- Aucune largeur fixe en pixels (`w-[Xpx]`) ne doit être appliquée sans alternative responsive (`max-w-[85vw]`, `w-full sm:w-[Xpx]`).
- Les montants chiffrés doivent comporter `tabular-nums` et être protégés contre les retours à la ligne incohérents.

### 3.2 Confort Tactile (Touch Targets)
- **Zone tactile minimale** : **44 × 44 px** pour tous les boutons d'action au doigt (`min-h-[44px]`).
- **Suppression du délai tactile** : `touch-action: manipulation;` activé globalement sur `body`.
- **Safe Areas iOS** : Prise en compte de `env(safe-area-inset-top)` et `env(safe-area-inset-bottom)`.

### 3.3 Conversion Systématique des Tableaux en Cartes Mobiles
> [!IMPORTANT]
> **Règle des tableaux de données** :
> Les balises `<table>` sont strictement réservées aux écrans larges (`hidden md:block`).
> Sur mobile (`< md`), chaque ligne de tableau **doit impérativement** être rendue sous forme de carte empilée (`md:hidden`) avec :
> 1. En-tête : Référence en gras + Badge statut à droite.
> 2. Corps : Client et description de la prestation.
> 3. Bas : Montant en FCFA + Date d'échéance.
> 4. Actions : Boutons tactiles d'au moins 44px de hauteur (`min-h-[44px]`).

### 3.4 Comportement par Breakpoint
| Écran / Largeur | Sidebar | Navigation / Header | KPI | Tableaux |
|---|---|---|---|---|
| **Android (360px)** | Tiroir masqué (`-translate-x-full`), max 85vw. | Recherche repliée en icône, bouton "Créer" compact. | 1 colonne pleine largeur. | Cartes tactiles empilées. |
| **iPhone SE / Mini (375px)** | Idem, fond flouté `backdrop-blur-sm`. | Idem. | 1 colonne. | Cartes tactiles empilées. |
| **iPhone Standard (390-414px)** | Idem. | Recherche repliée, CTA `+ Créer`. | 1 à 2 colonnes selon contenu. | Cartes tactiles empilées. |
| **Tablette (768px)** | Masquée sous 1024px (`lg:`). | Recherche étendue, filtres affichés. | 2 colonnes (`sm:grid-cols-2`). | Tableau complet défilable. |
| **Desktop (≥ 1024px)** | Fixe à gauche `260px` (`lg:translate-x-0`). | Header complet avec raccourci `⌘K`. | 4 colonnes (`lg:grid-cols-4`). | Tableau complet étendu. |

---

## 4. Consignes Impératives

1. **Test systématique sur 360px et 414px** : Avant de valider une nouvelle vue, vérifier qu'aucun défilement horizontal n'apparaît.
2. **Priorité aux composants AppShell et Topbar existants** : Réutiliser la structure mise en place.
3. **Respect de l'esthétique Dribbble / Payz / Northline** : Garder les arrondis `rounded-2xl`, les bordures `border-slate-100`, les micro-ombres et le vert émeraude comme fil conducteur sur mobile comme sur desktop.
