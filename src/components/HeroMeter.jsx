import { motion } from 'framer-motion';
import { HERO_UNLOCK_INTERVAL } from '../hooks/useMathGameEngine.js';

/**
 * Progress bar toward the next superhero reveal. Reads the engine's derived
 * `heroProgress` — the child sees exactly how many correct answers stand
 * between them and the next hero, with a row of pips for the current set of 5.
 */
export default function HeroMeter({ heroProgress }) {
  const { nextHero, needed, ratio, allUnlocked, answeredTowardNext } =
    heroProgress;

  const pips = Array.from({ length: HERO_UNLOCK_INTERVAL }, (_, i) =>
    i < answeredTowardNext ? '⭐' : '•',
  ).join(' ');

  return (
    <div className="herometer">
      <div
        className={`herometer__avatar${
          allUnlocked ? '' : ' herometer__avatar--locked'
        }`}
        aria-hidden="true"
      >
        {allUnlocked ? '🏆' : nextHero?.emoji ?? '❓'}
      </div>

      <div className="herometer__body">
        <div className="herometer__label">
          {allUnlocked ? (
            <>All heroes unlocked — you're a legend!</>
          ) : (
            <>
              {needed} more to unlock <strong>{nextHero?.name}</strong>
            </>
          )}
        </div>
        <div
          className="herometer__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(ratio * 100)}
        >
          <motion.div
            className="herometer__fill"
            initial={false}
            animate={{ width: `${Math.round(ratio * 100)}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          />
        </div>
        {!allUnlocked && (
          <div className="herometer__pips" aria-hidden="true">
            {pips}
          </div>
        )}
      </div>
    </div>
  );
}
