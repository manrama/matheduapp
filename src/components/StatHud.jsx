import { motion } from 'framer-motion';

/** Top scoreboard: points, current level, and the live answer streak. */
export default function StatHud({ score, level, levelLabel, streak }) {
  return (
    <div className="hud">
      <div className="stat">
        <span className="stat__label">Points</span>
        <motion.span
          key={score}
          className="stat__value"
          initial={{ scale: 1.35 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          <span className="emoji">⭐</span> {score}
        </motion.span>
      </div>

      <div className="stat">
        <span className="stat__label">Level {level}</span>
        <span className="stat__value" style={{ fontSize: '1.05rem' }}>
          {levelLabel}
        </span>
      </div>

      <div className="stat stat--streak">
        <span className="stat__label">Streak</span>
        <motion.span
          key={streak}
          className="stat__value"
          initial={{ scale: streak > 0 ? 1.4 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 14 }}
        >
          <span className="emoji">{streak > 0 ? '🔥' : '➖'}</span> {streak}
        </motion.span>
      </div>
    </div>
  );
}
