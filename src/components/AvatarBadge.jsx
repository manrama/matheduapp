import { motion } from 'framer-motion';

/**
 * The child's current hero avatar, tucked in the top corner. Tapping it opens
 * the Hero Squad gallery. Shows a friendly mascot before the first unlock, and
 * a live "collected / total" count so the collection goal is always visible.
 */
export default function AvatarBadge({ hero, collectedCount, totalCount, onOpen }) {
  const theme = hero
    ? { '--badge': hero.colorTheme.primary }
    : { '--badge': 'var(--theme-primary)' };

  return (
    <motion.button
      type="button"
      className="avatarbadge"
      style={theme}
      onClick={onOpen}
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 16 }}
      aria-label={
        hero
          ? `Your hero: ${hero.name}. Open the hero squad.`
          : 'Open the hero squad'
      }
    >
      <motion.span
        key={hero?.id ?? 'none'}
        className="avatarbadge__emoji"
        initial={{ scale: 0.4, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      >
        {hero?.emoji ?? '🦸'}
      </motion.span>
      <span className="avatarbadge__count">
        {collectedCount}/{totalCount}
      </span>
    </motion.button>
  );
}
