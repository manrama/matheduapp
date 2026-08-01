import { deserialize } from './serialize.js';

const SAVE_KEY = 'mathketeers:save:v1';

/**
 * Zero-config persistence backend. Works out of the box so a child's heroes,
 * level, and score survive a page refresh with no database to set up.
 */
export function createLocalAdapter() {
  return {
    name: 'local',
    label: 'this device',

    async load() {
      try {
        return deserialize(JSON.parse(localStorage.getItem(SAVE_KEY)));
      } catch {
        return null;
      }
    },

    async save(snapshot) {
      try {
        localStorage.setItem(
          SAVE_KEY,
          JSON.stringify({ ...snapshot, updatedAt: Date.now() }),
        );
      } catch {
        /* storage full or blocked — nothing else we can do client-side */
      }
    },

    async clear() {
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch {
        /* ignore */
      }
    },
  };
}
