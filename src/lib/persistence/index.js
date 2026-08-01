import { createLocalAdapter } from './localAdapter.js';
import { createSupabaseAdapter } from './supabaseAdapter.js';

export { serialize, deserialize, PERSIST_KEYS } from './serialize.js';

/**
 * Pick a persistence backend. Uses Supabase when both env vars are present,
 * otherwise falls back to zero-config localStorage. Same interface either way:
 *   { name, label, load(): Promise<snapshot|null>, save(snapshot), clear() }
 */
export function createPersistence() {
  const url = import.meta.env?.VITE_SUPABASE_URL;
  const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

  if (url && anonKey) {
    try {
      return createSupabaseAdapter(url, anonKey);
    } catch (err) {
      // Never let a misconfigured DB stop a kid from playing.
      console.error('[persistence] Supabase init failed, using local save', err);
    }
  }
  return createLocalAdapter();
}
