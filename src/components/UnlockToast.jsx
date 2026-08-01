import { motion } from 'framer-motion';
import TactileButton from './TactileButton.jsx';

/**
 * Lightweight "new hero!" celebration shown when a correct answer crosses a
 * 5-answer threshold. Phase 3 replaces this with the full reveal + avatar
 * picker; for now it keeps the core loop rewarding and unblocked.
 */
export default function UnlockToast({ hero, onClaim }) {
  const themeVars = {
    '--theme-primary': hero.colorTheme.primary,
    '--theme-secondary': hero.colorTheme.secondary,
  };

  return (
    <motion.div
      className="toast-wrap"
      style={themeVars}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="toast"
        role="dialog"
        aria-label={`New hero unlocked: ${hero.name}`}
        initial={{ scale: 0.6, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 18 }}
      >
        <div className="toast__eyebrow">New hero unlocked!</div>
        <motion.div
          className="toast__emoji"
          animate={{ rotate: [0, -10, 10, -6, 6, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          {hero.emoji}
        </motion.div>
        <h2 className="toast__name">{hero.name}</h2>
        <p className="toast__title">{hero.title}</p>
        <TactileButton className="toast__btn" onClick={onClaim} autoFocus>
          Awesome! Keep going →
        </TactileButton>
        <p className="toast__hint">
          Pick your avatar &amp; see their powers in Phase&nbsp;3
        </p>
      </motion.div>
    </motion.div>
  );
}
