import { motion } from 'framer-motion';

const VIEW = {
  loading: { icon: '⏳', text: 'Loading…' },
  saving: { icon: '💾', text: 'Saving…' },
  saved: { icon: '✅', text: 'Progress saved' },
  ready: { icon: '💾', text: 'Progress saved' },
  error: { icon: '⚠️', text: "Couldn't save" },
};

/**
 * Tiny reassurance chip so kids (and parents) can see progress is being kept.
 * Reflects the persistence status and where the save lives (this device vs the
 * cloud).
 */
export default function SaveIndicator({ status, backendLabel }) {
  const view = VIEW[status] ?? VIEW.ready;
  const isSaved = status === 'saved' || status === 'ready';

  return (
    <motion.div
      className={`savechip${status === 'error' ? ' savechip--error' : ''}`}
      initial={false}
      animate={{ scale: status === 'saving' ? [1, 1.06, 1] : 1 }}
      transition={{ duration: 0.4 }}
      aria-live="polite"
    >
      <span aria-hidden="true">{view.icon}</span>
      <span>
        {view.text}
        {isSaved && backendLabel ? ` · ${backendLabel}` : ''}
      </span>
    </motion.div>
  );
}
