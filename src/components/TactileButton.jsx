import { motion } from 'framer-motion';

/**
 * The one button to rule them all. Composes the `.tactile` CSS primitive
 * (chunky sticker with a solid bottom edge that compresses on press) with a
 * Framer Motion spring for a playful hover-lift and tap-squish.
 *
 * Any extra className (e.g. "choice", "next-btn") tunes colour/size via CSS.
 */
export default function TactileButton({
  children,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <motion.button
      type="button"
      className={`tactile ${className}`}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -3, scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 600, damping: 18 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
