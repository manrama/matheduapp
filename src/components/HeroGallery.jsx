import { motion } from 'framer-motion';
import TactileButton from './TactileButton.jsx';

/**
 * The Hero Squad — the visual progression system. Shows every hero in the
 * roster: unlocked ones are tappable to pick as the avatar (with a "chosen"
 * star), locked ones are greyed with a countdown to their unlock. Reads the
 * engine's derived `roster`, so it always mirrors true game state.
 */
export default function HeroGallery({
  roster,
  correctCount,
  collectedCount,
  onSelect,
  onClose,
}) {
  return (
    <motion.div
      className="gallery-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="gallery"
        role="dialog"
        aria-modal="true"
        aria-label="Hero Squad"
        initial={{ y: 40, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="gallery__head">
          <h2>🦸 Hero Squad</h2>
          <span className="gallery__count">
            {collectedCount}/{roster.length} collected
          </span>
          <button
            className="gallery__x"
            onClick={onClose}
            aria-label="Close hero squad"
          >
            ✕
          </button>
        </header>

        <div className="gallery__grid">
          {roster.map((hero, i) => {
            const needed = Math.max(hero.unlockAt - correctCount, 0);
            const themeVars = { '--hero-primary': hero.colorTheme.primary };
            return (
              <motion.button
                key={hero.id}
                type="button"
                className={`herocard${hero.unlocked ? '' : ' herocard--locked'}${
                  hero.selected ? ' herocard--selected' : ''
                }`}
                style={themeVars}
                disabled={!hero.unlocked}
                onClick={() => hero.unlocked && onSelect(hero.id)}
                initial={{ opacity: 0, y: 14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.03 * i, type: 'spring', stiffness: 360, damping: 22 }}
                whileHover={hero.unlocked ? { y: -3, scale: 1.03 } : undefined}
                whileTap={hero.unlocked ? { scale: 0.96 } : undefined}
                aria-label={
                  hero.unlocked
                    ? `${hero.name}${hero.selected ? ', your chosen hero' : ', tap to choose'}`
                    : `${hero.name}, locked, ${needed} more correct answers to unlock`
                }
              >
                {hero.selected && <span className="herocard__star">★</span>}
                <span className="herocard__emoji" aria-hidden="true">
                  {hero.unlocked ? hero.emoji : '🔒'}
                </span>
                <span className="herocard__name">
                  {hero.unlocked ? hero.name : '???'}
                </span>
                <span className="herocard__foot">
                  {hero.unlocked
                    ? hero.selected
                      ? 'Your hero'
                      : 'Tap to pick'
                    : `${needed} more`}
                </span>
              </motion.button>
            );
          })}
        </div>

        <TactileButton className="gallery__done" onClick={onClose}>
          Done
        </TactileButton>
      </motion.div>
    </motion.div>
  );
}
