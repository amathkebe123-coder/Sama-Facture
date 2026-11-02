-- =============================================================================
-- SAMA FACTURE — Données de Démonstration (seed_demo.sql)
-- Ce script est purement optionnel et destiné aux tests de développement.
-- Ne pas exécuter en production ou sur un compte client réel.
-- =============================================================================

-- Exemple d'insertion pour un compte utilisateur de démonstration :
-- Remplacez 'VOTRE_USER_ID' par l'UUID de votre compte auth.users si vous souhaitez charger ces données.

/*
DO $$
DECLARE
    target_user_id uuid := 'VOTRE_USER_ID';
    cli_1 uuid := gen_random_uuid();
    cli_2 uuid := gen_random_uuid();
    cli_3 uuid := gen_random_uuid();
    inv_1 uuid := gen_random_uuid();
    inv_2 uuid := gen_random_uuid();
BEGIN
    -- Clients de démonstration
    INSERT INTO public.clients (id, user_id, name, email, phone, address, city, total_invoiced, total_paid, invoice_count) VALUES
        (cli_1, target_user_id, 'Teranga Tech Solutions', 'facturation@terangatech.sn', '+221 33 821 45 67', '12 Avenue Léopold Sédar Senghor', 'Dakar Plateau', 6500000, 6500000, 4),
        (cli_2, target_user_id, 'Baobab Digital Agency', 'contact@baobabdigital.sn', '+221 77 654 32 10', 'Route des Almadies, Immeuble Kébé', 'Dakar Almadies', 2700000, 1850000, 3),
        (cli_3, target_user_id, 'Cabinet Sène & Associés', 'compta@sene-avocats.sn', '+221 33 864 12 00', 'Boulevard Martin Luther King', 'Fann Résidence', 3200000, 1750000, 2);

    -- Produits & Services de démonstration
    INSERT INTO public.products (user_id, name, category, unit_price, tax_rate, unit) VALUES
        (target_user_id, 'Développement Plateforme Web & API', 'Ingénierie Logicielle', 2200000, 18.00, 'Projet / Forfait'),
        (target_user_id, 'Intégration Passerelle Mobile Wave & OM', 'Paiement & Fintech', 550000, 18.00, 'Module'),
        (target_user_id, 'Infogérance Cloud & Sécurité Serveurs', 'Maintenance', 400000, 18.00, 'Mois'),
        (target_user_id, 'Audit de Conformité & Sécurité Système', 'Cybersécurité', 1650000, 18.00, 'Audit');

    -- Factures de démonstration
    INSERT INTO public.invoices (id, user_id, invoice_number, client_id, issue_date, due_date, channel, status, subtotal, tax_rate, tax_total, total, notes, payment_terms) VALUES
        (inv_1, target_user_id, 'FAC-2026-0001', cli_1, '2026-10-28', '2026-11-27', 'Wave', 'paid', 2754237, 18.00, 495763, 3250000, 'Paiement reçu intégralement par virement Wave.', 'Paiement à 30 jours.'),
        (inv_2, target_user_id, 'FAC-2026-0002', cli_2, '2026-10-24', '2026-11-08', 'Orange Money', 'sent', 720339, 18.00, 129661, 850000, 'Règlement attendu sur notre compte Orange Money marchand.', 'Paiement à 15 jours.');

    -- Lignes de facture
    INSERT INTO public.invoice_lines (user_id, invoice_id, description, quantity, unit_price, tax_rate, line_total) VALUES
        (target_user_id, inv_1, 'Développement Application Web & API Node.js', 1, 2200000, 18.00, 2200000),
        (target_user_id, inv_1, 'Intégration Paiement Mobile Wave & Orange Money', 1, 554237, 18.00, 554237),
        (target_user_id, inv_2, 'Stratégie de Contenu & SEO Sénégal', 1, 720339, 18.00, 720339);

    -- Paiements de démonstration
    INSERT INTO public.payments (user_id, invoice_number, client_name, amount, method, payment_date, reference, status) VALUES
        (target_user_id, 'FAC-2026-0001', 'Teranga Tech Solutions', 3250000, 'Wave Business', '2026-10-29', 'WAV-SN-94821-M', 'Confirmé');
END $$;
*/

