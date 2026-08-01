import { motion } from 'framer-motion';
import TactileButton from './TactileButton.jsx';

/**
 * Four big tap targets (2×2). We use multiple choice rather than a keypad so
 * pre-readers/early-typers can play with a single confident tap.
 *
 * After grading, buttons colour themselves: the correct answer always goes
 * green; a wrong pick goes red; the rest dim. `locked` stops further taps
 * until the engine advances.
 */
export default function ChoiceGrid({
  choices,
  answer,
  picked,
  graded,
  locked,
  onPick,
}) {
  return (
    <div className="choices" role="group" aria-label="Answer choices">
      {choices.map((value, i) => {
        let variant = '';
        if (graded) {
          if (value === answer) variant = 'choice--correct';
          else if (value === picked) variant = 'choice--wrong';
          else variant = 'choice--dim';
        }
        return (
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 22,
              delay: 0.05 * i,
            }}
          >
            <TactileButton
              className={`choice ${variant}`}
              disabled={locked}
              onClick={() => onPick(value)}
              aria-label={`Answer ${value}`}
              style={{ width: '100%' }}
            >
              {value}
            </TactileButton>
          </motion.div>
        );
      })}
    </div>
  );
}
