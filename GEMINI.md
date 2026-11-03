# GEMINI.md — Documentation de Référence & Guide Projet : Sama Facture

> **Document de référence pour les modèles d'IA et les développeurs**  
> Ce fichier résume l'architecture globale, la raison d'être, les fonctionnalités implémentées, la structure des fichiers, les choix techniques, les normes de design system et les règles impératives à respecter lors de toute évolution du projet **Sama Facture**.

---

## 1. Présentation Générale du Projet

**Sama Facture** est une application web SaaS moderne de facturation, de suivi des encaissements et de gestion commerciale spécialement conçue pour les PME, startups, cabinets, consultants et commerçants établis au **Sénégal** et dans la zone **UEMOA**.

### Caractéristiques Métier Clés
- **Monnaie officielle** : Franc CFA (**FCFA** / XOF).
  - Tous les montants sont des entiers (pas de centimes / décimales).
  - Formatage systématique avec espaces insécables : `3 250 000 FCFA`.
- **Fiscalité Sénégalaise** :
  - **TVA standard de 18%** régie par le Code Général des Impôts (CGI) du Sénégal.
  - Mentions légales d'identification : **NINEA** (Numéro d'Identification Nationale des Entreprises et Associations) et **RCCM** (Registre du Commerce et du Crédit Mobilier).
- **Canaux d'encaissement prioritaires** :
  - **Wave Business** (paiement instantané par QR / lien).
  - **Orange Money Marchand**.
  - **Virement bancaire** (CBAO, BOA, Ecobank, etc.).
  - **Espèces** et **Chèque**.

---

## 2. Stack Technique & Dépendances

| Technologie | Version / Rôle | Justification & Usage |
|---|---|---|
| **Next.js** | `14.2.18` (App Router) | Architecture moderne avec routes dans `src/app/`, rendu optimisé et navigation fluide. |
| **React** | `18.3.1` | Composants interactifs côté client (`"use client"`). |
| **TypeScript** | `5.6.3` | Typage strict de toutes les entités financières et composants sans aucun `any`. |
| **Tailwind CSS** | `3.4.15` | Moteur de styles utilitaires avec design system sur-mesure (palette émeraude, slate sombre, responsive). |
| **Lucide React** | `0.460.0` | Bibliothèque d'icônes vectorielles uniforme et légère. |
| **Recharts** | `2.13.3` | Graphiques d'évolution financière responsive (Facturé vs Encaissé). |
| **Supabase JS** | `^2.118.0` | Client officiel d'accès à la base de données PostgreSQL hébergée et API Auth. |
| **Supabase SSR** | `^0.12.7` | Gestion moderne des sessions d'authentification par cookies côté serveur et middleware Next.js. |
| **Node.js Test Runner** | Natif (`node --test`) | Suite de tests unitaires ultra-rapide sans dépendance Jest lourde. |
| **Stockage** | Supabase Postgres + RLS | Persistance multi-tenant sécurisée avec isolation par utilisateur (`auth.uid() = user_id`). |

---

## 3. Architecture des Dossiers & Fichiers

```text
Sama Facture/
├── .agent/
│   └── rules/
│       └── design-system.md        # Règle Always-On : Norme visuelle officielle stricte
├── public/                         # Assets statiques
├── supabase/
│   ├── schema.sql                  # Schéma initial complet des tables et contraintes
│   ├── migration_auth.sql          # Migration RLS multi-tenant, user_id et triggers auth
│   └── seed_demo.sql               # Données de démonstration isolées (optionnel, hors code app)
├── src/
│   ├── middleware.ts               # Protection des routes et synchronisation des cookies Supabase
│   ├── app/                        # Pages Next.js (App Router)
│   │   ├── page.tsx                # Landing Page publique officielle Sama Facture
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Tableau de bord principal connecté aux données réelles
│   │   ├── layout.tsx              # Layout racine (HTML, Body, Viewport, Providers)
│   │   ├── globals.css             # CSS global, variables de thème et polices système
│   │   ├── connexion/
│   │   │   └── page.tsx            # Page Connexion (email, mot de passe, design system)
│   │   ├── inscription/
│   │   │   └── page.tsx            # Page Inscription entreprise (nom, entreprise, email, mot de passe)
│   │   ├── verification-email/
│   │   │   └── page.tsx            # Vérification du code OTP à 6 chiffres avec compte à rebours 60s
│   │   ├── mot-de-passe-oublie/
│   │   │   └── page.tsx            # Demande de réinitialisation sécurisée par email
│   │   ├── reinitialisation-mot-de-passe/
│   │   │   └── page.tsx            # Formulaire de nouveau mot de passe
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── rate-limit/
│   │   │           └── route.ts    # Rate-limiting serveur (5 tentatives max / 60s) & validation domaine
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts        # Route d'échange de code pour confirmation d'email
│   │   ├── factures/
│   │   │   ├── page.tsx            # Liste complète des factures utilisateur (filtres, recherche, PDF)
│   │   │   ├── nouvelle/
│   │   │   │   └── page.tsx        # Formulaire de création & workflow anti-doublon dans Supabase
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Détail facture A4, modification, statut, PDF, WhatsApp
│   │   ├── clients/
│   │   │   └── page.tsx            # Gestion des clients en base (CRUD, stats, annuaire)
│   │   ├── produits/
│   │   │   └── page.tsx            # Catalogue de prestations & services personnalisé
│   │   ├── paiements/
│   │   │   └── page.tsx            # Historique certifié des règlements Mobile Money / Virements
│   │   ├── rapports/
│   │   │   └── page.tsx            # Synthèse financière & calculs de TVA 18% basés sur les factures réelles
│   │   ├── parametres/
│   │   │   └── page.tsx            # Réglages entreprise de l'utilisateur (Raison sociale, NINEA, RCCM, Tél)
│   │   └── aide/
│   │       └── page.tsx            # Centre d'aide et documentation utilisateur
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Structure principale responsive (Sidebar + Topbar + Content)
│   │   │   ├── Sidebar.tsx         # Navigation latérale sombre, profil connecté & déconnexion
│   │   │   └── Topbar.tsx          # Barre supérieure (recherche, raccourcis, notifications)
│   │   ├── dashboard/
│   │   │   ├── StatCards.tsx       # 4 cartes KPI financières dynamiques
│   │   │   ├── RevenueChart.tsx    # Graphique mensuel comparatif Facturé vs Encaissé réel
│   │   │   ├── RecentInvoicesTable.tsx # Tableau des dernières factures & états vides propres
│   │   │   ├── PaymentChannels.tsx # Répartition temps réel Wave, Orange Money, Virements
│   │   │   └── InsightCard.tsx     # Alerte relance WhatsApp sur la facture échue critique
│   │   └── ui/
│   │       ├── FeedbackModal.tsx   # Modale unique officielle de retour & confirmation
│   │       └── DatePicker.tsx      # Sélecteur de date calendrier Radian-OS adapté au vert émeraude
│   ├── context/
│   │   └── InvoiceContext.tsx      # Store réactif global avec session utilisateur et synchronisation Supabase
│   └── lib/
│       ├── supabase.ts             # Client Supabase navigateur SSR-safe
│       ├── supabase-db.ts          # Couche d'accès aux données typée (CRUD Supabase + RLS)
│       ├── email-validator.ts      # Validation stricte des emails (Gmail, iCloud, domaines pro)
│       ├── useRateLimit.ts         # Hook client pour le compte à rebours et la limite de tentatives
│       ├── company.ts              # Gestion des coordonnées d'entreprise & synchronisation PDF
│       ├── money.ts                # Utilitaires financiers FCFA (arrondis, TVA, BigInt)
│       ├── invoice-status.ts       # Typage et pastilles visuelles des statuts de facture
│       └── pdf-generator.ts        # Moteur autonome de génération de PDF vectoriel A4 (ISO 32000-1)
├── tests/
│   └── unit/
│       ├── email-validator.test.ts # Tests unitaires du filtrage strict des emails
│       ├── money.test.ts           # Tests unitaires des calculs financiers et TVA
│       ├── invoice-status.test.ts  # Tests des badges et états de statut
│       ├── save-confirmation.test.ts # Tests du cycle anti-doublon et confirmation
│       └── pdf-generator.test.ts   # Tests de la conformité du fichier PDF A4
├── package.json                    # Scripts npm et dépendances
├── tailwind.config.ts              # Configuration Tailwind CSS
├── tsconfig.json                   # Configuration TypeScript (paths `@/*`)
└── GEMINI.md                       # Ce document
```

---

## 4. Architecture Multi-Tenant & Sécurité Supabase

### 4.1 Isolation des Données (Row Level Security - RLS)
- Chaque table applicative (`company_settings`, `clients`, `products`, `invoices`, `invoice_lines`, `payments`) possède une colonne `user_id uuid references auth.users(id) on delete cascade not null default auth.uid()`.
- Les règles RLS n'autorisent l'accès (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) que si `auth.uid() = user_id`.
- Un utilisateur connecté ne peut physiquement ni lire ni altérer les enregistrements d'un autre utilisateur.
- Le numéro de facture est contraint par une clé d'unicité composite `unique(user_id, invoice_number)`. Deux utilisateurs distincts peuvent chacun avoir leur facture `FAC-2026-0001`.

### 4.2 Déclencheur Automatique à l'Inscription (`on_auth_user_created`)
Lorsqu'un utilisateur s'inscrit via `supabase.auth.signUp()`, la fonction trigger PostgreSQL `handle_new_user()` s'exécute automatiquement en mode `security definer` :
1. Crée la ligne `company_settings` de l'utilisateur avec la raison sociale saisie dans le formulaire d'inscription.
2. Initialise un catalogue standard de 4 prestations de démarrage pour l'utilisateur dans la table `products`.

### 4.3 Protection des Routes (`middleware.ts`)
- Le middleware Next.js utilise `@supabase/ssr` avec `createServerClient` et `supabase.auth.getUser()`.
- La landing page (`/`) est publique et accessible sans connexion.
- Toute tentative d'accès à une page protégée (`/dashboard`, `/factures`, `/clients`, `/produits`, etc.) sans session valide redirige immédiatement vers `/connexion`.
- Un utilisateur déjà authentifié accédant à `/`, `/connexion` ou `/inscription` est automatiquement redirigé vers le tableau de bord `/dashboard`.

### 4.4 Politique d'Email & Vérification Sécurisée par Code (OTP)
- **Domaines autorisés** : Uniquement Gmail (`@gmail.com`, `@googlemail.com`), iCloud (`@icloud.com`, `@me.com`, `@mac.com`) et les emails professionnels personnalisés avec le nom de domaine de l'entreprise.
- **Domaines interdits** : Yahoo, Outlook, Hotmail, Live, AOL, et tous les fournisseurs d'adresses jetables (Yopmail, etc.) avec le message strict : *"Utilisez une adresse Gmail, iCloud ou votre adresse email professionnelle."*
- **Vérification par code OTP** : L'inscription déclenche l'envoi d'un code à 6 chiffres via le SMTP configuré (modèle de confirmation `{{ .Token }}`). L'accès à l'application est verrouillé tant que le code n'est pas validé sur `/verification-email`.
- **Protection Anti-Bruteforce** : Limite stricte de 5 tentatives infructueuses (mauvais mot de passe ou mauvais code OTP). Au-delà, un blocage de 60 secondes avec compte à rebours est appliqué côté serveur et client.

---

## 5. Instructions Impératives pour les Développeurs et Modèles d'IA

Lorsque vous travaillez sur le projet Sama Facture, suivez scrupuleusement ces directives :

### Ce qu'il ne faut JAMAIS faire
1. ❌ **Ne JAMAIS réintroduire de bandeau de notification en haut de page** (alertes flash, toasts en bannière qui poussent le layout). Tout message de succès, d'information, d'erreur ou de confirmation doit utiliser `FeedbackModal`.
2. ❌ **Ne JAMAIS utiliser d'autres devises que le FCFA** (pas d'Euros €, pas de Dollars $, pas de décimales). Utiliser systématiquement l'utilitaire `formatFCFA()`.
3. ❌ **Ne JAMAIS exécuter `npm run build` pendant que le serveur de dev (`next dev`) tourne en tâche de fond**, car cela corrompt les chunks `.next/` et casse le CSS.
4. ❌ **Ne JAMAIS exposer la clé `service_role` ou des secrets côté client**. Seule la clé `anon public` doit être utilisée avec `@supabase/ssr`.
5. ❌ **Ne JAMAIS modifier `.env.local` sans instruction explicite de l'utilisateur**.

### Ce qu'il faut TOUJOURS faire
1. ✅ **Exécuter les commandes Windows via `cmd /c`** si exécuté depuis PowerShell pour éviter les restrictions d'AuthorizationManager (ex. `cmd /c "npm test"` et `cmd /c "npx tsc --noEmit"`).
2. ✅ **Toujours lancer `npm test` et `npx tsc --noEmit`** après toute modification de logique pour vérifier que les tests passent et qu'aucune erreur TypeScript n'est introduite.
3. ✅ **Toujours tester la responsivité mobile (360px et 414px)** pour s'assurer de l'absence totale de défilement horizontal.
4. ✅ **Respecter le cycle de sauvegarde anti-doublon** sur les formulaires :
   - 1er clic : création normale + modale de succès.
   - 2e clic sans changement : modale d'information "Aucune modification".
   - 2e clic avec changement : modale de confirmation avant mise à jour.
5. ✅ **Garder le fichier `GEMINI.md` synchronisé** lors de l'ajout d'une nouvelle norme globale.

---

*Dernière mise à jour : 2 novembre 2026 — Authentification Supabase Auth, Middleware SSR & Multi-tenant RLS.*
