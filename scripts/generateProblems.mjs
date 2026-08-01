/**
 * Seed-data generator for Mathketeers multiplication problems.
 *
 * Run with:  npm run generate:seed
 *
 * Produces src/data/problems.json — a flat JSON array of problem objects
 * grouped by difficulty level. Keeping this as a script (rather than
 * hand-writing hundreds of rows) means the seed set is reproducible and
 * easy to tweak as the curriculum evolves.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// The "star" multiplier for each difficulty level. The other factor always
// ranges across the friendly 1–12 range that 2nd graders practice with.
const LEVELS = [
  { level: 1, label: 'Warm-Up Powers', multipliers: [1, 2, 5, 10] },
  { level: 2, label: 'Rising Heroes', multipliers: [3, 4] },
  { level: 3, label: 'Super Tables', multipliers: [6, 7, 8, 9] },
];

const OTHER_FACTOR_MIN = 1;
const OTHER_FACTOR_MAX = 12;

function makeProblems() {
  const problems = [];
  const seen = new Set();

  for (const { level, multipliers } of LEVELS) {
    for (const star of multipliers) {
      for (let other = OTHER_FACTOR_MIN; other <= OTHER_FACTOR_MAX; other += 1) {
        // Present the "star" multiplier on either side so kids see both
        // 5 × 3 and 3 × 5, but de-dupe true repeats within a level.
        for (const [a, b] of [[star, other], [other, star]]) {
          const key = `${level}:${a}x${b}`;
          if (seen.has(key)) continue;
          seen.add(key);

          problems.push({
            id: `l${level}-${a}x${b}`,
            level,
            star,
            factorA: a,
            factorB: b,
            answer: a * b,
            prompt: `${a} × ${b}`,
          });
        }
      }
    }
  }

  return problems;
}

const problems = makeProblems();
const outPath = resolve(__dirname, '../src/data/problems.json');
writeFileSync(outPath, `${JSON.stringify(problems, null, 2)}\n`);

const counts = LEVELS.map(({ level }) => {
  const n = problems.filter((p) => p.level === level).length;
  return `L${level}: ${n}`;
}).join('  ');

console.log(`Generated ${problems.length} problems  (${counts})`);
console.log(`Wrote ${outPath}`);
