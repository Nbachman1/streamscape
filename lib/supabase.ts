import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Anon, read-only Supabase client (lazy singleton).
 * RLS on `artists` and `tracks` only permits SELECT, so this is safe anywhere.
 * Created lazily so `next build` doesn't fail when env vars are only set at runtime.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local.",
    );
  }

  client = createClient(url, anonKey, { auth: { persistSession: false } });
  return client;
}
