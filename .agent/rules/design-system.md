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
| **Backdrop Modal** | `rgba(0, 0, 0, 0.6)` | `bg-black/60 backdrop-blur-sm` | Voile de fond du tiroir mobile et modales |

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

### 1.5 Canaux d'Encaissement (Afrique de l'Ouest)
- **Wave** : `#1DC8F3` (Bleu cyan Wave)
- **Orange Money** : `#FF7900` (Orange officiel OM)
- **Virement bancaire** : `#10B981` (Vert émeraude)
- **Espèces** : `#64748B` (Gris ardoise)

---

## 2. Typographie

### 2.1 Famille de Police
Stack moderne système haute performance :
```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### 2.2 Échelle Typographique & Rôles
| Rôle | Classes Tailwind | Taille / Line-height | Graisse | Lettrage (Tracking) |
|---|---|---|---|---|
| **Titre Page H1** | `text-xl md:text-2xl font-bold tracking-tight text-slate-900` | 20px / 28px (md: 24px / 32px) | Bold (700) | `-0.025em` (`tracking-tight`) |
| **Titre Section H3** | `text-sm md:text-base font-bold text-slate-900` | 14px / 20px (md: 16px / 24px) | Bold (700) | Normal |
| **Chiffres KPI** | `text-xl md:text-2xl font-bold tracking-tight tabular-nums` | 20px (md: 24px) | Bold (700) | `tabular-nums` obligatoire |
| **Labels Catégories** | `text-[11px] font-semibold tracking-wider uppercase` | 11px / 16px | Semibold (600) | `+0.05em` (`tracking-wider`) |
| **Corps Courant** | `text-xs md:text-sm text-slate-600` | 12px / 16px (md: 14px / 20px) | Normal (400) | Normal |
| **Sous-titres / Descriptions** | `text-xs text-slate-500` | 12px / 16px | Normal (400) | Normal |
| **Badges & Pastilles** | `text-[10px] md:text-[11px] font-semibold` | 10px ou 11px | Semibold (600) | Normal |
| **Touches Clavier (Kbd)** | `text-[10px] font-medium text-slate-400` | 10px | Medium (500) | Normal |

> [!IMPORTANT]
> **Règle des montants financiers** : Tous les montants en FCFA doivent impérativement comporter la classe Tailwind `tabular-nums` afin d'assurer un alignement vertical parfait des chiffres dans les tableaux et les cartes de statistiques.

---

## 3. Espacements, Grilles et Alignements

### 3.1 Espacements Internes (Paddings)
- **Conteneur Principal Page** : `p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full`
- **Cartes KPI** : `p-5` (20px)
- **Carte Graphique (Revenue Chart)** : `p-6` (24px)
- **Carte Widget (Insight / Canaux)** : `p-5` (20px)
- **Tableau (En-tête & Contrôles)** : `p-5` (20px)
- **Cellules de Tableau (Desktop)** : `py-3.5 px-4` (14px vertical, 16px horizontal)
- **Lignes d'en-tête Tableau (`<th>`)** : `py-3 px-4` (12px vertical, 16px horizontal)
- **Carte Facture Mobile** : `p-4 space-y-2` (16px)

### 3.2 Dimensions & Grilles
- **Largeur Sidebar Desktop** : `w-[260px]` fixe.
- **Décalage Contenu Principal** : `lg:pl-[260px]`.
- **Hauteur Topbar** : `h-16` (64px) fixe sticky.
- **Grille 4 KPI** : `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5`.
- **Grille Médiane** : `grid grid-cols-1 lg:grid-cols-3 gap-6` (Graphique sur `lg:col-span-2`, Widgets sur 1 col).
- **Largeur Max Dashboard** : `max-w-7xl` (1280px) centré avec `mx-auto`.

---

## 4. Bordures et Rayons d'Arrondi (Border-Radius)

### 4.1 Épaisseur et Couleurs de Bordure
- **Épaisseur standard** : `border` (1px).
- **Bordures Claires (Cartes/Tableaux)** : `border-slate-100` (état repos), `hover:border-slate-200/80`.
- **Bordures Sombres (Sidebar/Insight)** : `border-[#15241C]` ou `border-[#173022]`.
- **Bordures Champs de saisie** : `border-slate-200/80` (focus: `focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20`).

### 4.2 Échelle des Arrondis (`border-radius`)
| Type d'élément | Classe Tailwind | Valeur en px |
|---|---|---|
| **Grandes Cartes & Tableaux** | `rounded-2xl` | 16px |
| **Boutons Principaux, Inputs, Items Nav** | `rounded-xl` | 12px |
| **Logo Marque, Avatars, Conteneurs d'icônes** | `rounded-lg` | 8px |
| **Badges de compteur sidebar** | `rounded-md` | 6px |
| **Badges de statut, Pastilles, Boutons ronds** | `rounded-full` | 9999px |

---

## 5. Ombres, Flous et Effets Visuels

### 5.1 Ombres (Box Shadows)
- **Cartes Blanches** : `shadow-[0_1px_3px_rgba(0,0,0,0.02)]` (ombre imperceptible, effet d'élévation ultra-propre).
- **Bouton CTA Primaire** : `shadow-sm hover:shadow`.
- **Bouton Vert Lumineux (WhatsApp / Insight)** : `shadow-[0_0_12px_rgba(52,211,153,0.3)]`.
- **Badge Logo Marque** : `shadow-[0_0_15px_rgba(16,185,129,0.4)]`.
- **Barre Active Graphique** : `shadow-[0_0_16px_rgba(16,185,129,0.35)]`.
- **Tiroir Mobile Ouvert** : `shadow-2xl`.

### 5.2 Dégradés & Effets Lumineux Signature
- **Halo Vert Sidebar Sombre (`.sidebar-glow`)** :
  ```css
  background: radial-gradient(
    circle at 50% 18%,
    rgba(16, 185, 129, 0.18) 0%,
    rgba(6, 78, 59, 0.08) 45%,
    rgba(8, 16, 12, 0) 75%
  );
  ```
- **Onglet Actif Sidebar (`.active-nav-glow`)** :
  ```css
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.28) 0%,
    rgba(5, 150, 105, 0.16) 100%
  );
  box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.12),
              0 2px 8px -2px rgba(16, 185, 129, 0.3);
  ```
- **Flou d'Arrière-plan Topbar** : `bg-white/80 backdrop-blur-md`.

---

## 6. Animations et Transitions

| Élément | Propriété | Durée / Easing | Classes Tailwind |
|---|---|---|---|
| **Hover interactif standard** | Couleur / Fond / Bordure | 150ms | `transition-all duration-150` ou `transition-colors` |
| **Ouverture Drawer Mobile** | Translation X | 200ms ease-in-out | `transition-transform duration-200 ease-in-out` |
| **Barres du graphique & jauges**| Hauteur / Largeur | 300ms | `transition-all duration-300` |
| **Hover Lignes de Tableau** | Fond | 150ms | `hover:bg-slate-50/80 transition-colors` |
| **Hover Liens Sidebar Inactifs**| Couleur & Fond | 150ms | `hover:text-slate-200 hover:bg-emerald-950/20` |

---

## 7. Composants de Base : Structures et Classes Précises

### 7.1 Bouton Primaire CTA (ex: `+ Nouvelle facture`)
```tsx
<button
  type="button"
  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm hover:shadow transition-all"
>
  <Plus className="w-4 h-4" />
  <span>Nouvelle facture</span>
</button>
```

### 7.2 Bouton Secondaire / Sélecteur Outline
```tsx
<button
  type="button"
  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
>
  <Calendar className="w-3.5 h-3.5 text-slate-400" />
  <span>30 derniers jours</span>
</button>
```

### 7.3 Bouton d'Action Vert Lumineux (ex: Relance WhatsApp)
```tsx
<button
  type="button"
  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-xl transition-colors shadow-[0_0_12px_rgba(52,211,153,0.3)]"
>
  <MessageSquare className="w-3.5 h-3.5" />
  <span>Relancer via WhatsApp</span>
  <ArrowRight className="w-3.5 h-3.5" />
</button>
```

### 7.4 Bouton Icône (Actions rapides / Options)
```tsx
<button
  type="button"
  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
  title="Action"
>
  <Eye className="w-3.5 h-3.5" />
</button>
```

### 7.5 Champ de Saisie (Input avec icône et raccourci)
```tsx
<div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
  <input
    type="text"
    placeholder="Rechercher..."
    className="w-full pl-9 pr-12 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400 transition-all"
  />
  <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded">
    ⌘K
  </kbd>
</div>
```

### 7.6 Badge de Statut Facture
```tsx
<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusConfig.badgeClass}`}>
  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
  {statusConfig.label}
</span>
```

### 7.7 Carte Blanche Standard (Surface)
```tsx
<div className="bg-white border border-slate-100 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5">
  {/* Contenu */}
</div>
```

---

## 8. Responsivité & Comportement Multi-écrans

| Écran / Breakpoint | Sidebar | Tableaux | Disposition Grilles |
|---|---|---|---|
| **Mobile (`< 768px`)** | Masquée (`-translate-x-full`), tiroir latéral `w-[260px]` via bouton hamburger topbar. | Remplacé par une liste de cartes tactiles (`divide-y divide-slate-100`). | 1 colonne pour les KPI et les sections. |
| **Tablette (`768px - 1023px`)** | Masquée sous 1024px (`lg:`), même tiroir mobile. | Tableau complet visible avec défilement horizontal (`overflow-x-auto`). | KPI en 2 colonnes (`sm:grid-cols-2`). |
| **Desktop (`>= 1024px`)** | Fixe à gauche `w-[260px]`, offset contenu `lg:pl-[260px]`. | Tableau complet étendu. | KPI en 4 colonnes, grille médiane 3 colonnes (`2 col` chart + `1 col` widgets). |

---

## 9. Identité Visuelle Générale

- **Ambiance** : B2B SaaS financier haut de gamme (inspiration directe Dribbble / Odama Northline).
- **Dualité visuelle maîtrisée** : Sidebar sombre profond et halo émeraude néon (structure, élégance, sérieux financier) face à un espace de travail ultra-lumineux et épuré (`#F8FAFB` / blanc) garantissant une lisibilité maximale pour les chiffres.
- **Micro-détails soignés** : Bordures légères 1px plutôt que de lourdes ombres, chiffres alignés en police tabulaire, badges discrets aux teintes pastel et puces colorées.

---

## 10. Consignes Impératives pour les Développements Futurs

1. **Priorité absolue à la réutilisation** : Réutiliser impérativement les composants, classes Tailwind et variables CSS documentés dans cette règle plutôt que d'en recréer.
2. **Interdiction de divergence** : Ne jamais introduire de couleur arbitraire (ex: un nouveau vert ou un autre gris), de nouvelle police, de nouveau rayon d'arrondi (`rounded-*`) ou d'animation sans accord explicite préalable.
3. **Extension du Design System** : Si un nouveau besoin d'interface n'est pas couvert par ce document (ex: modale de confirmation, combobox client, stepper de facture), **proposer l'ajout au Design System avant toute implémentation**.

---

## 11. Incohérences Détectées dans le Code Actuel & Recommandations de Standardisation

Lors de l'analyse du code actuel, les légères variations suivantes ont été relevées. Le code actuel n'a pas été modifié, mais voici les valeurs à retenir pour harmoniser les futures pages :

1. **Bordures des cartes claires** :
   - *Observation* : `border-slate-100/90` dans `StatCards.tsx` vs `border-slate-100` dans `RevenueChart.tsx` et `RecentInvoicesTable.tsx`.
   - *Règle retenue* : Standardiser sur **`border-slate-100`** sans opacité fractionnée.
2. **Arrondi des boutons d'actions secondaires** :
   - *Observation* : `rounded-xl` sur la topbar et la table header vs `rounded-lg` sur les boutons PDF/WhatsApp de la vue mobile dans `RecentInvoicesTable.tsx`.
   - *Règle retenue* : Standardiser tous les boutons d'action sur **`rounded-xl`** pour une cohérence géométrique parfaite.
3. **Bordures et fonds des surfaces sombres** :
   - *Observation* : Bordure `#15241C` (sidebar header/footer), `#16291F` (profil) et `#173022` (InsightCard).
   - *Règle retenue* : Retenir **`#15241C`** comme bordure sombre standard, et **`#0D1812`** pour les surfaces de cartes sombres internes.
4. **Padding des boutons icônes** :
   - *Observation* : `p-1` (sélecteur organisation sidebar), `p-1.5` (actions tableau), `p-2` (icônes topbar).
   - *Règle retenue* : Conserver `p-2` pour la Topbar (zone tactile 40x40px), et `p-1.5` pour les actions compactes dans les tableaux.

