import { useCallback, useMemo, useReducer } from 'react';

import problemsSeed from '../data/problems.json';
import heroesSeed from '../data/heroes.json';
import levelsSeed from '../data/levels.json';

/**
 * useMathGameEngine
 * -----------------
 * The single source of truth for the Mathketeers game loop. All scoring,
 * difficulty, superhero-unlock, and problem-serving logic lives here so the
 * presentation components (built in later phases) stay dumb and declarative.
 *
 * A new superhero is revealed after every HERO_UNLOCK_INTERVAL correct
 * answers — the roster in heroes.json defines exactly which hero appears at
 * each threshold via its `unlockAt` field.
 *
 * The hook is UI-agnostic: it returns plain state plus a set of stable action
 * callbacks. Phase 4 persistence can hydrate it through the `initialState`
 * argument and read `state` back out to save.
 */

// ---------------------------------------------------------------------------
// Tunable game rules
// ---------------------------------------------------------------------------

export const HERO_UNLOCK_INTERVAL = 5;
const BASE_POINTS_PER_CORRECT = 10;
const STREAK_BONUS_CAP = 5; // streak stops adding bonus past this many
const STREAK_BONUS_PER_STEP = 2;

// Sort heroes by the threshold at which they appear so "next hero" math is
// simple and order-independent of how the JSON happens to be written.
const HEROES = [...heroesSeed].sort((a, b) => a.unlockAt - b.unlockAt);
const LEVELS = [...levelsSeed].sort((a, b) => a.level - b.level);

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

const getLevelMeta = (level) =>
  LEVELS.find((l) => l.level === level) ?? LEVELS[0];

const getPool = (level) => problemsSeed.filter((p) => p.level === level);

/** Pick a random problem for a level, avoiding an immediate repeat. */
function pickProblem(level, excludeId = null) {
  const pool = getPool(level);
  const candidates =
    pool.length > 1 ? pool.filter((p) => p.id !== excludeId) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** Points earned for a correct answer at a given level and streak length. */
function pointsFor(level, streakAfterAnswer) {
  const streakBonus =
    Math.min(streakAfterAnswer, STREAK_BONUS_CAP) * STREAK_BONUS_PER_STEP;
  return BASE_POINTS_PER_CORRECT * level + streakBonus;
}

const heroesUnlockedBy = (correctCount) =>
  HEROES.filter((h) => correctCount >= h.unlockAt).map((h) => h.id);

/** The next hero the player is working toward, or null once all are unlocked. */
const nextLockedHero = (correctCount) =>
  HEROES.find((h) => correctCount < h.unlockAt) ?? null;

/** Level the player should be on given how many they've gotten right. */
function levelForCorrectCount(correctCount) {
  let level = LEVELS[0].level;
  for (const meta of LEVELS) {
    if (meta.advanceAtCorrect != null && correctCount >= meta.advanceAtCorrect) {
      const next = LEVELS.find((l) => l.level === meta.level + 1);
      if (next) level = next.level;
    }
  }
  return level;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

function createInitialState(overrides = {}) {
  const { problem: overrideProblem, ...rest } = overrides;
  const level = rest.level ?? 1;
  return {
    score: 0,
    correctCount: 0,
    totalAnswered: 0,
    streak: 0,
    bestStreak: 0,
    level,
    // 'idle' before an answer, then 'correct' | 'incorrect' after grading.
    status: 'idle',
    lastAnswerCorrect: null,
    unlockedHeroIds: [], // start with none unlocked
    selectedHeroId: null,
    // Hero object awaiting its celebration modal, or null. The UI clears it
    // via acknowledgeUnlock() once the reveal has been shown.
    pendingUnlock: null,
    ...rest,
    // Always end with a live problem for the (possibly overridden) level.
    problem: overrideProblem ?? pickProblem(level),
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state, action) {
  switch (action.type) {
    case 'SUBMIT_ANSWER': {
      // Ignore extra submissions until the UI advances to the next problem.
      if (state.status !== 'idle') return state;

      const isCorrect = Number(action.value) === state.problem.answer;
      const totalAnswered = state.totalAnswered + 1;

      if (!isCorrect) {
        return {
          ...state,
          status: 'incorrect',
          lastAnswerCorrect: false,
          totalAnswered,
          streak: 0,
        };
      }

      const streak = state.streak + 1;
      const correctCount = state.correctCount + 1;
      const score = state.score + pointsFor(state.level, streak);

      // Did we cross a hero threshold? (every 5 correct → a new hero)
      const unlockedHeroIds = heroesUnlockedBy(correctCount);
      const newHeroId = unlockedHeroIds.find(
        (id) => !state.unlockedHeroIds.includes(id),
      );
      const pendingUnlock = newHeroId
        ? HEROES.find((h) => h.id === newHeroId)
        : state.pendingUnlock;

      return {
        ...state,
        status: 'correct',
        lastAnswerCorrect: true,
        totalAnswered,
        correctCount,
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
        score,
        level: levelForCorrectCount(correctCount),
        unlockedHeroIds,
        pendingUnlock,
      };
    }

    case 'NEXT_PROBLEM': {
      return {
        ...state,
        problem: pickProblem(state.level, state.problem?.id),
        status: 'idle',
        lastAnswerCorrect: null,
      };
    }

    case 'ACKNOWLEDGE_UNLOCK': {
      if (!state.pendingUnlock) return state;
      // Auto-select the very first hero as the avatar if none chosen yet.
      const selectedHeroId = state.selectedHeroId ?? state.pendingUnlock.id;
      return { ...state, pendingUnlock: null, selectedHeroId };
    }

    case 'SELECT_AVATAR': {
      if (!state.unlockedHeroIds.includes(action.heroId)) return state;
      return { ...state, selectedHeroId: action.heroId };
    }

    case 'HYDRATE': {
      // Merge a persisted snapshot (Phase 4) onto a fresh baseline.
      return createInitialState(action.snapshot);
    }

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useMathGameEngine(initialState) {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    createInitialState,
  );

  const submitAnswer = useCallback(
    (value) => dispatch({ type: 'SUBMIT_ANSWER', value }),
    [],
  );
  const nextProblem = useCallback(() => dispatch({ type: 'NEXT_PROBLEM' }), []);
  const acknowledgeUnlock = useCallback(
    () => dispatch({ type: 'ACKNOWLEDGE_UNLOCK' }),
    [],
  );
  const selectAvatar = useCallback(
    (heroId) => dispatch({ type: 'SELECT_AVATAR', heroId }),
    [],
  );
  const hydrate = useCallback(
    (snapshot) => dispatch({ type: 'HYDRATE', snapshot }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  // ----- Derived, memoized view data for the UI ---------------------------

  const levelMeta = useMemo(() => getLevelMeta(state.level), [state.level]);

  const unlockedHeroes = useMemo(
    () => HEROES.filter((h) => state.unlockedHeroIds.includes(h.id)),
    [state.unlockedHeroIds],
  );

  const selectedHero = useMemo(
    () => HEROES.find((h) => h.id === state.selectedHeroId) ?? null,
    [state.selectedHeroId],
  );

  // Full roster with unlock status — handy for a "hero gallery" screen.
  const roster = useMemo(
    () =>
      HEROES.map((h) => ({
        ...h,
        unlocked: state.unlockedHeroIds.includes(h.id),
        selected: h.id === state.selectedHeroId,
      })),
    [state.unlockedHeroIds, state.selectedHeroId],
  );

  // Progress toward the next hero reveal (0–1) plus the raw counts.
  const heroProgress = useMemo(() => {
    const upcoming = nextLockedHero(state.correctCount);
    const prevThreshold =
      Math.floor(state.correctCount / HERO_UNLOCK_INTERVAL) *
      HERO_UNLOCK_INTERVAL;
    const target = upcoming ? upcoming.unlockAt : prevThreshold;
    const span = target - prevThreshold || HERO_UNLOCK_INTERVAL;
    const done = state.correctCount - prevThreshold;
    return {
      nextHero: upcoming,
      answeredTowardNext: done,
      needed: target - state.correctCount,
      ratio: upcoming ? Math.min(done / span, 1) : 1,
      allUnlocked: upcoming == null,
    };
  }, [state.correctCount]);

  return {
    // raw state (used by Phase 4 to persist a snapshot)
    state,

    // primitives the UI reads directly
    score: state.score,
    streak: state.streak,
    bestStreak: state.bestStreak,
    correctCount: state.correctCount,
    totalAnswered: state.totalAnswered,
    level: state.level,
    problem: state.problem,
    status: state.status,
    lastAnswerCorrect: state.lastAnswerCorrect,
    pendingUnlock: state.pendingUnlock,

    // derived view data
    levelMeta,
    roster,
    unlockedHeroes,
    selectedHero,
    heroProgress,

    // actions
    submitAnswer,
    nextProblem,
    acknowledgeUnlock,
    selectAvatar,
    hydrate,
    reset,
  };
}

export default useMathGameEngine;
