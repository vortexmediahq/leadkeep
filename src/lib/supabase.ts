import { createClient } from "@supabase/supabase-js";

/*
 * Supabase setup
 * The browser connects with two public values, read from the project's .env file:
 *   VITE_SUPABASE_URL       your project URL, e.g. https://<project-ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY  the project's "anon" public key
 * Both are in the Supabase dashboard under Project Settings > API.
 * The anon key is safe to ship to the browser; table access is governed by row level security.
 */
const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.");
}

export const supabase = createClient(url, anonKey);
