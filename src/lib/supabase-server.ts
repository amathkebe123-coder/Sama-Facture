import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Crée un client Supabase lié à la session utilisateur courante (cookies SSR)
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variables Supabase URL / Anon Key absentes.");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Dans une route API ou un Server Component en lecture seule, ignorer les erreurs d'écriture de cookies
        }
      },
    },
  });
}

/**
 * Crée un client Supabase avec la clé administrative Service Role.
 * À utiliser UNIQUEMENT côté serveur pour :
 * - Inscrire un paiement d'abonnement en attente
 * - Exécuter la fonction `activate_subscription(p_token)`
 * - Vérifier les paiements lors des callbacks IPN PayDunya
 */
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Variables Supabase URL / Service Role Key absentes côté serveur.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

