import { motion } from 'framer-motion';

/**
 * The big, friendly "6 × 7 = ?" card. Keying the equation on `problem.id`
 * makes React swap it in lockstep with the answer choices (both derive from
 * the same problem), while Framer springs each new question in. `shake`
 * triggers a wobble on a wrong answer.
 */
export default function ProblemCard({ problem, levelLabel, shake }) {
  return (
    <div className="problem">
      <span className="problem__level">{levelLabel}</span>

      <motion.div
        key={problem.id}
        className="problem__equation"
        initial={{ scale: 0.6, opacity: 0, y: 12 }}
        animate={
          shake
            ? { scale: 1, opacity: 1, y: 0, x: [0, -12, 12, -8, 8, 0] }
            : { scale: 1, opacity: 1, y: 0 }
        }
        transition={{ type: 'spring', stiffness: 420, damping: 20 }}
        aria-live="polite"
        aria-label={`What is ${problem.factorA} times ${problem.factorB}?`}
      >
        <span>{problem.factorA}</span>
        <span>×</span>
        <span>{problem.factorB}</span>
        <span>=</span>
        <span className="problem__q">?</span>
      </motion.div>
    </div>
  );
}
