/**
 * Which engine-state fields make up a saved game. Deliberately *durable*
 * progress only — the transient loop bits (current problem, grading status,
 * pendingUnlock, streak) are recreated fresh on load so the child always
 * resumes on a clean, un-graded question.
 */
export const PERSIST_KEYS = [
  'score',
  'correctCount',
  'totalAnswered',
  'bestStreak',
  'level',
  'unlockedHeroIds',
  'selectedHeroId',
];

/** Extract the durable snapshot from full engine state. */
export function serialize(state) {
  const snap = {};
  for (const key of PERSIST_KEYS) snap[key] = state[key];
  return snap;
}

/** Normalise a loaded snapshot back into engine-hydratable shape. */
export function deserialize(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const snap = {};
  for (const key of PERSIST_KEYS) {
    if (raw[key] !== undefined && raw[key] !== null) snap[key] = raw[key];
  }
  // A save with no progress is the same as no save at all.
  if (!snap.unlockedHeroIds?.length && !snap.correctCount) return null;
  return snap;
}
