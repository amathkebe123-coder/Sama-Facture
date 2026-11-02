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

---

## 5. Composant Sélecteur de Date & Calendrier (DatePicker)

> **Composant officiel** : `src/components/ui/DatePicker.tsx`  
> Basé sur l'ergonomie du modèle Radian-OS adapté strictement au design system Sama Facture (vert émeraude `#059669` au lieu du bleu).

### 5.1 Anatomie du Déclencheur (Champ de Saisie)
- **Label** : au-dessus, `text-xs font-semibold text-slate-700 mb-1.5`.
- **Conteneur** : `bg-white border rounded-xl min-h-[44px] (ou min-h-[38px] en size="sm")`.
- **Icône gauche** : `Calendar` (Lucide), `w-4 h-4 text-slate-400` (passe en `text-emerald-600` quand le calendrier est ouvert).
- **Date affichée** : texte centré/aligné en français complet (ex. *"8 février 2026"*), `font-medium text-slate-900` (ou placeholder `text-slate-400`).
- **Icône droite** : `ChevronsUpDown` (Lucide), `w-4 h-4 text-slate-400`.
- **État actif/ouvert** : bordure `border-emerald-600` et anneau subtil `ring-2 ring-emerald-500/20 shadow-sm`.

### 5.2 Panneau Popover du Calendrier
- **Conteneur** : `bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.04)]`.
- **Navigation mois** : 
  - Boutons précédent / suivant dans de petits carrés arrondis : `w-8 h-8 rounded-lg border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50`.
  - Mois et année centrés en gras : `font-bold text-sm sm:text-base text-slate-900 capitalize` (ex. *"Février 2026"*).
- **Jours de la semaine** :
  - Ordre français débutant le **Lundi** : `Lu Ma Me Je Ve Sa Di`.
  - Style : `text-[11px] sm:text-xs font-semibold text-slate-400`.
- **Grille des jours (7 colonnes)** :
  - **Jours hors mois courant** (précédent/suivant) : estompés en `text-slate-300 hover:bg-slate-50 hover:text-slate-600 rounded-xl`.
  - **Aujourd'hui** : fond gris doux `bg-slate-100/90 font-bold text-slate-900 rounded-xl` avec un petit point centré en dessous (`w-1 h-1 rounded-full bg-slate-500`).
  - **Jour sélectionné** : vert émeraude vibrant `bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700`.
  - **Survol (Hover)** : transition fluide `hover:bg-emerald-600 hover:text-white transition-all duration-150 rounded-xl`.

### 5.3 Adaptation Mobile Tactile & Clavier
- **Backdrop semi-transparent** sur mobile (`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 sm:hidden`) pour focaliser l'attention et fermer au tap.
- **Positionnement intelligent** : centré en bas sur mobile (`fixed bottom-4 left-1/2 -translate-x-1/2 w-[92vw] max-w-[340px]`), popover sous le champ sur desktop (`sm:absolute sm:top-[calc(100%+6px)]`).
- **Touch targets** : chaque cellule jour dispose d'une taille confortable (`h-9 sm:h-8 min-w-[36px]`).
- **Interactions clavier & accessibilité** :
  - Fermeture immédiate avec la touche `Échap` ou par clic extérieur.
  - Flèches directionnelles (`←` `→` `↑` `↓`) pour naviguer jour par jour dans le mois.
  - Touche `Entrée` ou `Espace` pour valider la sélection.

---

## 6. Standard de Dialogue & Confirmation Unifié (FeedbackModal)

> **Composant officiel unique** : `src/components/ui/FeedbackModal.tsx`  
> Remplace définitivement tous les bandeaux de notification en haut de page. Toute information, succès, alerte ou confirmation s'affiche dans cette boîte de dialogue modale centrée.

### 6.1 Anatomie & Structure Visuelle de la Fenêtre
Basée sur le modèle officiel de Sama Facture (conforme à la capture de référence) :

1. **Disposition centrée & Arrière-plan assombri** :
   - Voile d'arrière-plan : `fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 safe-bottom`
   - Carte compacte : `bg-white rounded-3xl p-6 sm:p-7 max-w-[400px] w-full shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-100 relative animate-in zoom-in-95 duration-150`

2. **Bouton Fermer "X" en haut à droite** :
   - Position : `absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50`
   - Zone tactile : accessible et réactif au tap sur mobile.

3. **Pastille d'icône centrée en haut** :
   - Conteneur circulaire de `w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4`
   - **Variante Succès (`success`)** : Coche ✓ (`Check` Lucide), `bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60 border border-emerald-200/80`
   - **Variante Information (`info`)** : "i" (`Info` Lucide), `bg-slate-100 text-slate-600 ring-8 ring-slate-100/60 border border-slate-200`
   - **Variante Erreur (`error`)** : Avertissement (`AlertTriangle` Lucide), `bg-rose-50 text-rose-600 ring-8 ring-rose-50/60 border border-rose-200`
   - **Variante Confirmation (`confirm`)** : Flèche de synchronisation (`RefreshCw` Lucide), `bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60 border border-emerald-200/80`

4. **Titre centré en gras** :
   - `text-base sm:text-lg font-bold text-slate-900 text-center tracking-tight` (ex. *"Paramètres mis à jour"*, *"Cet élément est déjà enregistré"*, *"Aucune modification"*).

5. **Texte d'explication centré** :
   - `text-xs sm:text-sm text-slate-500 text-center leading-relaxed mt-1.5` sur 1 ou 2 lignes (ex. *"Les informations de votre entreprise ont bien été enregistrées. Elles apparaîtront sur vos prochaines factures."*).

6. **Bouton d'Action Inférieur** :
   - **Notifications standard (Succès, Info, Erreur)** : bouton unique **"Fermer"** sur toute la largeur de la fenêtre (`w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99]`). La teinte est le bleu nuit / ardoise foncé identique à l'onglet actif.
   - **Boîte de confirmation (`confirm`)** : deux boutons côte à côte (`grid grid-cols-2 gap-3 pt-2`) :
     - Secondaire : *"Annuler"* (`bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold min-h-[44px] rounded-xl`)
     - Principal : *"Mettre à jour"* (`bg-emerald-600 hover:bg-emerald-700 text-white font-semibold min-h-[44px] rounded-xl shadow-sm`)

### 6.2 Règles de Comportement & Accessibilité
- **Pas de fermeture automatique** : La fenêtre ne doit **jamais** disparaître d'elle-même (`aucun setTimeout`). L'utilisateur doit la fermer explicitement.
- **Modes de fermeture** :
  1. Clic sur le bouton "Fermer"
  2. Clic sur la croix "X"
  3. Clic sur le voile d'arrière-plan (`backdrop`)
  4. Pression de la touche `Échap` (Escape)
- **Bloque le défilement** : Dès l'ouverture, `document.body.style.overflow = "hidden"` empêche tout défilement en arrière-plan.
- **Zéro bandeau de page** : Aucun composant ne doit afficher de message sous forme de bandeau ou bandeau flash poussant le contenu de page. Tout retour passe obligatoirement par `FeedbackModal`.

### 6.3 Cycle de Sauvegarde Anti-Doublon avec FeedbackModal
1. **1er Enregistrement** : Création normale + ouverture de `FeedbackModal(variant="success")`.
2. **2e Clic SANS changement** : Aucune création + ouverture de `FeedbackModal(variant="info", title="Aucune modification")`.
3. **2e Clic AVEC changement** : Aucune création directe + ouverture de `FeedbackModal(variant="confirm", title="Cet élément est déjà enregistré")`.
   - Clic *"Mettre à jour"* -> modification en place + ouverture de `FeedbackModal(variant="success", title="Modifications enregistrées")`.
   - Clic *"Annuler"* -> fermeture sans modification.

---

## 7. Standard de Génération & Téléchargement de Factures PDF

> **Module officiel unique** : `src/lib/pdf-generator.ts`  
> Génération vectorielle native ultra-rapide au format standard A4 (595.28 × 841.89 pt), certifiée ISO PDF, compatible ordinateurs, Android et iOS Safari sans dépendance externe.

### 7.1 Règles de Présentation & Contenu du Document PDF
1. **En-tête de marque** :
   - Raison sociale, NINEA, RCCM, adresse du siège et téléphone Wave/Orange Money synchronisés en temps réel avec les réglages de la page [Paramètres](file:///c:/Users/LENOVO/Documents/Sama%20Facture/src/app/parametres/page.tsx).
   - Titre "FACTURE", numéro séquentiel (ex. `FAC-2026-0042`), dates d'émission et d'échéance, badge de statut (`PAYÉE`, `ENVOYÉE`, `EN RETARD`, `BROUILLON`).
2. **Bloc Client** ("FACTURÉ À") :
   - Nom complet du client, adresse email, adresse postale / ville, numéro de téléphone et canal d'encaissement favori.
3. **Tableau des prestations** :
   - En-tête sombre ardoise (`#0F172A`), lignes alternées avec désignation, quantité, prix unitaire HT et total HT en FCFA.
4. **Totaux financiers réglementaires** :
   - Sous-total HT, TVA sénégalaise 18% et Total TTC mis en avant dans un cartouche vert émeraude (`#059669`).
5. **Règlements & Mentions légales** :
   - Coordonnées de paiement Wave, Orange Money, RIB bancaire et espèces.
   - Mentions légales du Code Général des Impôts du Sénégal en pied de page.

### 7.2 Emplacements Stricts des Boutons de Téléchargement
- **Fenêtre de succès (`FeedbackModal`)** : Bouton vert émeraude *"Télécharger la facture"* disposé directement au-dessus du bouton *"Fermer"*.
- **Page de détail / modification de facture (`/factures/[id]`)** : Bouton *"Télécharger PDF"* dans la barre d'actions supérieure.
- **Formulaire de nouvelle facture (`/factures/nouvelle`)** : N'apparaît **qu'une fois la facture enregistrée** (jamais avant le premier enregistrement).
- **Liste des factures & Dashboard** : L'icône de téléchargement dans la colonne "Actions" déclenche directement le téléchargement du PDF de la facture concernée avec indicateur de chargement (`RefreshCw`) et désactivation anti-double clic.
- **Nom du fichier** : strictement `${invoice.invoiceNumber}.pdf` (ex. `FAC-2026-0042.pdf`).
- **Gestion des erreurs** : toute anomalie déclenche la modale d'erreur du design system (*"Échec du téléchargement"*).
