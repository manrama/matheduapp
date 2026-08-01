const PLAYER_KEY = 'mathketeers:player-id';

/**
 * A stable, device-scoped id for this player. We don't ask a 2nd grader to log
 * in — a generated UUID kept in localStorage is enough to key their save row
 * (in Supabase) or namespace their local save. For multi-device sync you'd
 * swap this for real Supabase auth (see supabase/schema.sql notes).
 */
export function getPlayerId() {
  try {
    let id = localStorage.getItem(PLAYER_KEY);
    if (!id) {
      id =
        globalThis.crypto?.randomUUID?.() ??
        `player-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(PLAYER_KEY, id);
    }
    return id;
  } catch {
    // Storage blocked (private mode) — fall back to an in-memory id.
    return `ephemeral-${Math.random().toString(36).slice(2)}`;
  }
}
