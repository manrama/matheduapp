import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { useMathGameEngine } from '../hooks/useMathGameEngine.js';
import { popCorrect, celebrateHero } from '../lib/celebrate.js';
import StatHud from './StatHud.jsx';
import HeroMeter from './HeroMeter.jsx';
import ProblemCard from './ProblemCard.jsx';
import ChoiceGrid from './ChoiceGrid.jsx';
import UnlockToast from './UnlockToast.jsx';

const ADVANCE_DELAY_MS = 950;

/**
 * The Phase 2 core loop: read the problem → tap an answer → celebrate → next.
 * All game logic lives in useMathGameEngine; this component only orchestrates
 * presentation, timing, and the confetti.
 */
export default function GameScreen() {
  const engine = useMathGameEngine();
  const {
    problem,
    choices,
    status,
    level,
    levelMeta,
    score,
    streak,
    heroProgress,
    pendingUnlock,
  } = engine;

  // The value the child just tapped (for red/green button colouring).
  const [picked, setPicked] = useState(null);
  const graded = status === 'correct' || status === 'incorrect';

  function handlePick(value) {
    if (status !== 'idle') return;
    setPicked(value);
    engine.submitAnswer(value);
  }

  function advance() {
    engine.nextProblem();
    setPicked(null);
  }

  function claimHero() {
    engine.acknowledgeUnlock();
    advance();
  }

  // Celebrate on a correct answer. If it unlocked a hero, hold on the toast;
  // otherwise auto-advance to the next problem after a beat.
  useEffect(() => {
    if (status !== 'correct') return undefined;
    if (pendingUnlock) {
      celebrateHero();
      return undefined;
    }
    popCorrect();
    const t = setTimeout(advance, ADVANCE_DELAY_MS);
    return () => clearTimeout(t);
    // advance/pendingUnlock are read fresh for this correct transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const stageTheme = {
    '--theme-primary': levelMeta.colorTheme.primary,
    '--theme-secondary': levelMeta.colorTheme.secondary,
  };

  return (
    <div className="stage" style={stageTheme}>
      <div className="stage__blob stage__blob--1" aria-hidden="true" />
      <div className="stage__blob stage__blob--2" aria-hidden="true" />
      <div className="stage__blob stage__blob--3" aria-hidden="true" />

      <div className="game">
        <header className="brand">
          <h1>
            <span className="brand__emoji">🦸</span> Mathketeers
          </h1>
        </header>

        <StatHud
          score={score}
          level={level}
          levelLabel={levelMeta.label}
          streak={streak}
        />

        <HeroMeter heroProgress={heroProgress} />

        <ProblemCard
          problem={problem}
          levelLabel={levelMeta.label}
          shake={status === 'incorrect'}
        />

        <ChoiceGrid
          choices={choices}
          answer={problem.answer}
          picked={picked}
          graded={graded}
          locked={graded}
          onPick={handlePick}
        />

        <div className="feedback" aria-live="polite">
          {status === 'correct' && !pendingUnlock && (
            <span className="feedback--correct">Awesome! 🎉</span>
          )}
          {status === 'incorrect' && (
            <span className="feedback--wrong">
              Oops! {problem.factorA} × {problem.factorB} = {problem.answer}
            </span>
          )}
        </div>

        <div className="actions">
          {status === 'incorrect' && (
            <button className="tactile next-btn" onClick={advance} autoFocus>
              Next one →
            </button>
          )}
        </div>
      </div>

      <p className="stage__foot">Phase 2 · The Core Loop</p>

      <AnimatePresence>
        {pendingUnlock && (
          <UnlockToast hero={pendingUnlock} onClaim={claimHero} />
        )}
      </AnimatePresence>
    </div>
  );
}
