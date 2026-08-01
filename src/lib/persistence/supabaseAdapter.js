import { deserialize } from './serialize.js';
import { getPlayerId } from './playerId.js';

const TABLE = 'mathketeers_progress';

// Map between the camelCase engine snapshot and the snake_case DB row.
const toRow = (snap, playerId) => ({
  player_id: playerId,
  score: snap.score,
  correct_count: snap.correctCount,
  total_answered: snap.totalAnswered,
  best_streak: snap.bestStreak,
  level: snap.level,
  unlocked_hero_ids: snap.unlockedHeroIds,
  selected_hero_id: snap.selectedHeroId,
  updated_at: new Date().toISOString(),
});

const fromRow = (row) =>
  row
    ? {
        score: row.score,
        correctCount: row.correct_count,
        totalAnswered: row.total_answered,
        bestStreak: row.best_streak,
        level: row.level,
        unlockedHeroIds: row.unlocked_hero_ids,
        selectedHeroId: row.selected_hero_id,
      }
    : null;

/**
 * Supabase-backed persistence. Activated automatically when VITE_SUPABASE_URL
 * and VITE_SUPABASE_ANON_KEY are set (see .env.example + supabase/schema.sql).
 * The client is dynamically imported so it only ships to browsers that are
 * actually configured for the database.
 */
export function createSupabaseAdapter(url, anonKey) {
  const playerId = getPlayerId();
  let clientPromise = null;

  const getClient = async () => {
    if (!clientPromise) {
      clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
        createClient(url, anonKey, { auth: { persistSession: false } }),
      );
    }
    return clientPromise;
  };

  return {
    name: 'supabase',
    label: 'the cloud',

    async load() {
      const supabase = await getClient();
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('player_id', playerId)
        .maybeSingle();
      if (error) throw error;
      return deserialize(fromRow(data));
    },

    async save(snapshot) {
      const supabase = await getClient();
      const { error } = await supabase
        .from(TABLE)
        .upsert(toRow(snapshot, playerId), { onConflict: 'player_id' });
      if (error) throw error;
    },

    async clear() {
      const supabase = await getClient();
      await supabase.from(TABLE).delete().eq('player_id', playerId);
    },
  };
}
