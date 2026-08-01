# 🦸 Mathketeers

A gamified multiplication app for 2nd graders. Answer correctly to earn points
and **unlock a new superhero every 5 correct answers** — climbing from the
friendly 1s, 2s, 5s, and 10s all the way up to the mighty 9s.

Built incrementally in phases — all four are now in:

- **Phase 1 — Seed Data & State Hook** ✅
  JSON seed data + the `useMathGameEngine` hook that owns all game logic.
- **Phase 2 — The Core Loop** ✅
  The tactile, kid-friendly multiplication UI (Framer Motion + confetti).
- **Phase 3 — Gamification & Avatar Selection** ✅
  Superhero reveal celebration and the Hero Squad avatar picker.
- **Phase 4 — Database Persistence** ✅
  Progress survives refresh — localStorage out of the box, Supabase when
  configured.

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
  data/                    # problems.json, heroes.json, levels.json (seed)
  hooks/
    useMathGameEngine.js   # all scoring / difficulty / unlock logic
    usePersistence.js      # load+hydrate on mount, debounced save on change
  components/              # GameScreen + dumb presentational pieces
  lib/
    celebrate.js           # confetti helpers
    persistence/           # backend adapters (local + Supabase) behind one API
  styles/                  # global.css (tokens) + game.css (components)
scripts/
  generateProblems.mjs     # reproducible generator for problems.json
supabase/
  schema.sql               # table + RLS for cloud saves
```

## Saving progress (Phase 4)

Persistence is a thin layer over the engine's `state` / `hydrate()` seams, with
two interchangeable backends behind one interface
(`{ load, save, clear }`, see `src/lib/persistence/`):

- **localStorage (default).** Zero config — a child's heroes, level, and score
  survive a refresh immediately.
- **Supabase (optional).** Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
  (see `.env.example`) and run `supabase/schema.sql`. The client is loaded
  dynamically, so it only ships when configured.

Only durable progress is saved (score, correct count, best streak, level,
unlocked heroes, chosen avatar); the current question and grading state are
always recreated fresh on load. Players are keyed by a device-scoped UUID —
no login for kids. The footer shows a live save-status chip and a **Start
over** button.

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
