-- ==============================================================================
-- SCHEMA OFFICIEL SUPABASE — SAMA FACTURE (SÉNÉGAL / UEMOA)
-- Monnaie : FCFA (XOF) - Tous les montants sont stockés en entiers BIGINT
-- Fiscalité : Code Général des Impôts (CGI) du Sénégal - TVA standard 18%
-- ==============================================================================

-- 0. EXTENSIONS NÉCESSAIRES
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. TABLE : company_settings (Paramètres de l'entreprise émettrice)
-- ==============================================================================
create table if not exists public.company_settings (
    id uuid primary key default gen_random_uuid(),
    company_name text not null default 'Sama Facture SN SARL',
    ninea text not null default '008472912 2G3',
    rccm text not null default 'SN-DKR-2024-B-1420',
    phone text not null default '+221 77 821 45 67',
    address text not null default '12 Avenue Léopold Sédar Senghor, Dakar Plateau',
    invoice_prefix text not null default 'FAC-2026-',
    default_tax_rate numeric(5, 2) not null default 18.00,
    default_payment_terms integer not null default 30,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 2. TABLE : clients (Annuaire des clients & prospects d'affaires)
-- ==============================================================================
create table if not exists public.clients (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text,
    phone text default '+221 ',
    address text,
    city text not null default 'Dakar',
    total_invoiced bigint not null default 0,
    total_paid bigint not null default 0,
    invoice_count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Index de recherche rapide sur les clients
create index if not exists idx_clients_name on public.clients using gin(to_tsvector('french', name));
create index if not exists idx_clients_email on public.clients(email);

-- ==============================================================================
-- 3. TABLE : products (Catalogue de prestations & services en FCFA)
-- ==============================================================================
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    category text not null default 'Services',
    unit_price bigint not null default 0, -- en FCFA HT
    tax_rate numeric(5, 2) not null default 18.00,
    unit text not null default 'Prestation', -- Prestation, Heure, Mois, Forfait, Module
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 4. TABLE : invoices (Factures d'émissions officielles)
-- ==============================================================================
create table if not exists public.invoices (
    id uuid primary key default gen_random_uuid(),
    invoice_number text not null unique, -- Contrainte stricte anti-doublon (ex: FAC-2026-0042)
    client_id uuid not null references public.clients(id) on delete restrict,
    issue_date date not null default current_date,
    due_date date not null,
    channel text not null default 'Wave Business', -- Wave Business, Orange Money, Virement, Espèces
    status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'partial')),
    subtotal bigint not null default 0,   -- Sous-total HT en FCFA
    tax_rate numeric(5, 2) not null default 18.00,
    tax_total bigint not null default 0,  -- TVA 18% en FCFA
    total bigint not null default 0,      -- Total TTC en FCFA
    notes text default 'Paiement attendu à échéance. Merci pour votre collaboration.',
    payment_terms text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Index de performance pour les filtres et le dashboard
create index if not exists idx_invoices_number on public.invoices(invoice_number);
create index if not exists idx_invoices_client on public.invoices(client_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_issue_date on public.invoices(issue_date);

-- ==============================================================================
-- 5. TABLE : invoice_lines (Lignes de prestations d'une facture)
-- ==============================================================================
create table if not exists public.invoice_lines (
    id uuid primary key default gen_random_uuid(),
    invoice_id uuid not null references public.invoices(id) on delete cascade,
    description text not null,
    quantity numeric(10, 2) not null default 1.00 check (quantity > 0),
    unit_price bigint not null default 0, -- PU HT en FCFA
    tax_rate numeric(5, 2) not null default 18.00,
    line_total bigint not null default 0, -- Total ligne HT arrondi à l'entier
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_invoice_lines_invoice on public.invoice_lines(invoice_id);

-- ==============================================================================
-- 6. TABLE : payments (Journal des encaissements certifiés)
-- ==============================================================================
create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    invoice_id uuid references public.invoices(id) on delete set null,
    invoice_number text not null,
    client_name text not null,
    amount bigint not null check (amount > 0), -- Montant encaissé en FCFA
    method text not null check (method in ('Wave Business', 'Orange Money Marchand', 'Virement Bancaire', 'Espèces', 'Chèque')),
    payment_date date not null default current_date,
    reference text not null, -- Réf transaction (ex: WAV-SN-98234-A)
    status text not null default 'Confirmé',
    created_at timestamptz not null default now()
);

create index if not exists idx_payments_invoice on public.payments(invoice_id);
create index if not exists idx_payments_date on public.payments(payment_date);

-- ==============================================================================
-- 7. FONCTION & TRIGGER : Mise à jour automatique de updated_at
-- ==============================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create or replace trigger trg_company_settings_updated
    before update on public.company_settings
    for each row execute function public.handle_updated_at();

create or replace trigger trg_clients_updated
    before update on public.clients
    for each row execute function public.handle_updated_at();

create or replace trigger trg_products_updated
    before update on public.products
    for each row execute function public.handle_updated_at();

create or replace trigger trg_invoices_updated
    before update on public.invoices
    for each row execute function public.handle_updated_at();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) — SÉCURITÉ DES DONNÉES
-- ==============================================================================
alter table public.company_settings enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.payments enable row level security;

-- Politiques RLS permissives pour la clé publique anon de l'application
-- (Permet les opérations complètes de lecture, insertion, mise à jour et suppression)
create policy "Accès complet company_settings" on public.company_settings for all using (true) with check (true);
create policy "Accès complet clients" on public.clients for all using (true) with check (true);
create policy "Accès complet products" on public.products for all using (true) with check (true);
create policy "Accès complet invoices" on public.invoices for all using (true) with check (true);
create policy "Accès complet invoice_lines" on public.invoice_lines for all using (true) with check (true);
create policy "Accès complet payments" on public.payments for all using (true) with check (true);

-- ==============================================================================
-- 9. DONNÉES INITIALES PAR DÉFAUT (SEEDS SÉNÉGAL)
-- ==============================================================================
insert into public.company_settings (company_name, ninea, rccm, phone, address, invoice_prefix, default_tax_rate, default_payment_terms)
values (
    'Sama Facture SN SARL',
    '008472912 2G3',
    'SN-DKR-2024-B-1420',
    '+221 77 821 45 67',
    '12 Avenue Léopold Sédar Senghor, Dakar Plateau',
    'FAC-2026-',
    18.00,
    30
) on conflict do nothing;

