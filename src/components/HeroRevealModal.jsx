import { motion } from 'framer-motion';
import TactileButton from './TactileButton.jsx';

/**
 * Phase 3 — the big superhero reveal. Fires when the engine sets
 * `pendingUnlock` (every 5 correct answers). The child meets the new hero in
 * full — emoji, name, title, catchphrase, powers — and can crown them as their
 * avatar right here, or keep their current one and play on.
 */
export default function HeroRevealModal({
  hero,
  currentAvatar,
  collectedCount,
  totalCount,
  onChoose,
  onKeep,
}) {
  const theme = {
    '--hero-primary': hero.colorTheme.primary,
    '--hero-secondary': hero.colorTheme.secondary,
    '--hero-text': hero.colorTheme.text,
  };

  const isCurrent = currentAvatar?.id === hero.id;

  return (
    <motion.div
      className="reveal-wrap"
      style={theme}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="reveal"
        role="dialog"
        aria-modal="true"
        aria-label={`New hero unlocked: ${hero.name}`}
        initial={{ scale: 0.55, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 18 }}
      >
        <div className="reveal__eyebrow">✨ New Hero Unlocked! ✨</div>

        <motion.div
          className="reveal__badge"
          initial={{ rotate: -12, scale: 0.7 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}
        >
          <motion.span
            className="reveal__emoji"
            animate={{ y: [0, -10, 0], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {hero.emoji}
          </motion.span>
        </motion.div>

        <h2 className="reveal__name">{hero.name}</h2>
        <p className="reveal__title">{hero.title}</p>

        <div className="reveal__bubble">“{hero.catchphrase}”</div>
        <p className="reveal__desc">{hero.description}</p>

        <div className="reveal__actions">
          <TactileButton
            className="reveal__choose"
            onClick={onChoose}
            disabled={isCurrent}
            autoFocus
          >
            {isCurrent ? '★ Your hero!' : `⭐ Make ${firstName(hero.name)} my hero`}
          </TactileButton>
          <button className="reveal__keep" onClick={onKeep}>
            {currentAvatar && !isCurrent
              ? `Keep ${firstName(currentAvatar.name)} for now →`
              : 'Keep playing →'}
          </button>
        </div>

        <div className="reveal__count" aria-live="polite">
          🏅 {collectedCount} of {totalCount} heroes collected
        </div>
      </motion.div>
    </motion.div>
  );
}

const firstName = (name) => name.split(' ')[0];
