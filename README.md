# 🦸 Mathketeers

A gamified multiplication app for 2nd graders. Answer correctly to earn points
and **unlock a new superhero every 5 correct answers** — climbing from the
friendly 1s, 2s, 5s, and 10s all the way up to the mighty 9s.

Built incrementally in phases:

- **Phase 1 — Seed Data & State Hook** ✅ _(current)_
  JSON seed data + the `useMathGameEngine` hook that owns all game logic.
- **Phase 2 — The Core Loop.** The tactile, kid-friendly multiplication UI.
- **Phase 3 — Gamification & Avatar Selection.** Superhero reveal celebration
  and avatar picker.
- **Phase 4 — Database Persistence.** Save progress (e.g. Supabase).

## Getting started

```bash
npm install
npm run dev            # start the dev server
npm run build          # production build
npm run generate:seed  # regenerate src/data/problems.json
```

## Project structure

```
src/
  data/
    problems.json   # multiplication problems, grouped by difficulty level
    heroes.json     # superhero roster + unlock thresholds + color themes
    levels.json     # difficulty tiers and score thresholds
  hooks/
    useMathGameEngine.js   # all scoring / difficulty / unlock logic
scripts/
  generateProblems.mjs     # reproducible generator for problems.json
```

## The game engine

`useMathGameEngine` is the single source of truth for the game loop. It keeps
the presentation layer dumb — components read plain state and call stable
actions:

```js
const {
  problem, score, level, streak, status,   // state the UI renders
  levelMeta, roster, selectedHero, heroProgress, pendingUnlock, // derived
  submitAnswer, nextProblem, acknowledgeUnlock, selectAvatar, reset, hydrate,
} = useMathGameEngine();
```

- A **new superhero unlocks every 5 correct answers** (`HERO_UNLOCK_INTERVAL`),
  driven by each hero's `unlockAt` threshold in `heroes.json`.
- Difficulty **auto-advances** through Levels 1 → 3 as `correctCount` passes
  the `advanceAtCorrect` thresholds in `levels.json`.
- `pendingUnlock` holds the hero awaiting its celebration reveal (Phase 3);
  the UI clears it via `acknowledgeUnlock()`.
- `hydrate(snapshot)` / `state` are the seams for Phase 4 persistence.
