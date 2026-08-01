import { useEffect, useMemo, useRef, useState } from 'react';

import { createPersistence, serialize } from '../lib/persistence/index.js';

const SAVE_DEBOUNCE_MS = 600;

/**
 * usePersistence
 * --------------
 * Bolts save/load onto an existing game engine without the engine (or the UI)
 * knowing how storage works. It:
 *
 *   1. loads any saved snapshot once on mount and `hydrate()`s the engine with
 *      it — but only if the child hasn't started this session, so a slow async
 *      backend can never clobber live play;
 *   2. writes a debounced save whenever the *durable* progress changes.
 *
 * Returns a small status the UI can surface ('loading' | 'ready' | 'saving' |
 * 'saved' | 'error') plus the backend's friendly label and a `startOver()`.
 */
export function usePersistence(engine) {
  const { state, hydrate, reset } = engine;
  const backend = useMemo(() => createPersistence(), []);

  const [status, setStatus] = useState('loading');
  const readyRef = useRef(false);
  const lastSavedRef = useRef(null);

  // ---- Load once, then hydrate -------------------------------------------
  useEffect(() => {
    let cancelled = false;
    backend
      .load()
      .then((snap) => {
        if (cancelled) return;
        // Guard against clobbering a session the child already began.
        const untouched = !state.totalAnswered && !state.correctCount;
        if (snap && untouched) {
          lastSavedRef.current = JSON.stringify(snap);
          hydrate(snap);
        }
        readyRef.current = true;
        setStatus('ready');
      })
      .catch((err) => {
        console.error('[persistence] load failed', err);
        readyRef.current = true;
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // Run exactly once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Save on durable change (debounced) --------------------------------
  const snapshot = serialize(state);
  const snapStr = JSON.stringify(snapshot);

  useEffect(() => {
    if (!readyRef.current) return undefined;
    if (snapStr === lastSavedRef.current) return undefined;
    // Don't persist a blank game (fresh start or just-reset) — keeps storage
    // tidy so "Start over" truly leaves nothing behind.
    const hasProgress =
      snapshot.correctCount > 0 || snapshot.unlockedHeroIds?.length > 0;
    if (!hasProgress) {
      lastSavedRef.current = snapStr;
      return undefined;
    }

    setStatus('saving');
    const t = setTimeout(() => {
      backend
        .save(snapshot)
        .then(() => {
          lastSavedRef.current = snapStr;
          setStatus('saved');
        })
        .catch((err) => {
          console.error('[persistence] save failed', err);
          setStatus('error');
        });
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapStr]);

  async function startOver() {
    try {
      await backend.clear();
    } catch (err) {
      console.error('[persistence] clear failed', err);
    }
    lastSavedRef.current = null;
    reset();
  }

  return { status, backendLabel: backend.label, backendName: backend.name, startOver };
}
