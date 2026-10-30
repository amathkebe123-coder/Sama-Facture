# Plan d'implémentation — Sama Facture

## Contexte
SaaS de facturation pour les entrepreneurs d'Afrique francophone : montants en FCFA, TVA 18 %, Sénégal en priorité.
De vraies personnes vont y gérer leur argent : l'exactitude des montants, l'intégrité des numéros de facture et l'isolation des données entre entreprises ne se négocient pas.

## Workflow par phases
- **Phase 0 — Fondations** : Architecture Next.js, TypeScript, Tailwind, utilitaires financiers (`money.ts`, `invoice-status.ts`).
- **Phase 1 — UI de toutes les pages** : Dashboard & Sidebar (Northline Dribbble style), liste des factures, création/édition, clients, produits, rapports.
- **Phase 2 — Interactivité sur données locales** : Store serveur en mémoire, Server Actions, totaux en direct, export CSV & PDF, partages WhatsApp.
- **Phase 3 — Supabase (base + tests)** : Multi-tenant RLS, migrations SQL, RPC transactionnelles, tests d'isolation.
- **Phase 4 — Authentification (+ emails)** : Next.js proxy, Supabase Auth SSR, onboarding, Resend.
- **Phase 5 — Landing page** : Marketing, CGU, conformité loi sénégalaise 2008-12, SEO.
- **Phase 6 — Audit, E2E, Déploiement** : Vercel cdg1, tests complets Playwright.

