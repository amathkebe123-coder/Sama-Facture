-- ==============================================================================
-- MIGRATION AUTH & MULTI-TENANT SAMA FACTURE (SÉNÉGAL / UEMOA)
-- Isolation stricte par utilisateur (auth.uid() = user_id)
-- Trigger de création automatique de l'entreprise lors de l'inscription
-- ==============================================================================

-- 1. Nettoyage des anciennes données de test pour éviter tout conflit de clé étrangère
delete from public.payments;
delete from public.invoice_lines;
delete from public.invoices;
delete from public.products;
delete from public.clients;
delete from public.company_settings;

-- 2. Ajout de la colonne user_id liée à auth.users sur toutes les tables
alter table public.company_settings
    add column if not exists user_id uuid references auth.users(id) on delete cascade not null default auth.uid();

alter table public.clients
    add column if not exists user_id uuid references auth.users(id) on delete cascade not null default auth.uid();

alter table public.products
    add column if not exists user_id uuid references auth.users(id) on delete cascade not null default auth.uid();

alter table public.invoices
    add column if not exists user_id uuid references auth.users(id) on delete cascade not null default auth.uid();

alter table public.invoice_lines
    add column if not exists user_id uuid references auth.users(id) on delete cascade not null default auth.uid();

alter table public.payments
    add column if not exists user_id uuid references auth.users(id) on delete cascade not null default auth.uid();

-- 3. Création des index sur user_id pour des performances optimales
create index if not exists idx_company_settings_user_id on public.company_settings(user_id);
create index if not exists idx_clients_user_id on public.clients(user_id);
create index if not exists idx_products_user_id on public.products(user_id);
create index if not exists idx_invoices_user_id on public.invoices(user_id);
create index if not exists idx_invoice_lines_user_id on public.invoice_lines(user_id);
create index if not exists idx_payments_user_id on public.payments(user_id);

-- 4. Règle d'unicité du numéro de facture PAR UTILISATEUR (et non plus global)
alter table public.invoices drop constraint if exists invoices_invoice_number_key;
alter table public.invoices drop constraint if exists invoices_user_invoice_number_key;
alter table public.invoices add constraint invoices_user_invoice_number_key unique (user_id, invoice_number);

-- 5. Suppression des anciennes règles RLS globales
drop policy if exists "Accès complet company_settings" on public.company_settings;
drop policy if exists "Accès complet clients" on public.clients;
drop policy if exists "Accès complet products" on public.products;
drop policy if exists "Accès complet invoices" on public.invoices;
drop policy if exists "Accès complet invoice_lines" on public.invoice_lines;
drop policy if exists "Accès complet payments" on public.payments;

drop policy if exists "Users can manage own company settings" on public.company_settings;
drop policy if exists "Users can manage own clients" on public.clients;
drop policy if exists "Users can manage own products" on public.products;
drop policy if exists "Users can manage own invoices" on public.invoices;
drop policy if exists "Users can manage own invoice lines" on public.invoice_lines;
drop policy if exists "Users can manage own payments" on public.payments;

-- 6. Activation stricte du Row Level Security (RLS) par utilisateur
alter table public.company_settings enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.payments enable row level security;

-- 7. Nouvelles politiques RLS : auth.uid() = user_id obligatoire
create policy "Users can manage own company settings"
    on public.company_settings for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can manage own clients"
    on public.clients for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can manage own products"
    on public.products for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can manage own invoices"
    on public.invoices for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can manage own invoice lines"
    on public.invoice_lines for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can manage own payments"
    on public.payments for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- 8. Trigger automatique à l'inscription d'un utilisateur (crée ses paramètres d'entreprise personnalisés)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    company_val text;
    phone_val text;
begin
    company_val := coalesce(new.raw_user_meta_data->>'company_name', 'Mon Entreprise');
    phone_val := coalesce(new.raw_user_meta_data->>'phone', '+221 ');

    insert into public.company_settings (
        user_id,
        company_name,
        ninea,
        rccm,
        phone,
        address,
        invoice_prefix,
        default_tax_rate,
        default_payment_terms
    ) values (
        new.id,
        company_val,
        '',
        '',
        phone_val,
        '',
        'FAC-2026-',
        18.00,
        30
    ) on conflict do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

