import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { useMathGameEngine } from '../hooks/useMathGameEngine.js';
import { usePersistence } from '../hooks/usePersistence.js';
import { popCorrect, celebrateHero } from '../lib/celebrate.js';
import StatHud from './StatHud.jsx';
import HeroMeter from './HeroMeter.jsx';
import ProblemCard from './ProblemCard.jsx';
import ChoiceGrid from './ChoiceGrid.jsx';
import AvatarBadge from './AvatarBadge.jsx';
import HeroRevealModal from './HeroRevealModal.jsx';
import HeroGallery from './HeroGallery.jsx';
import SaveIndicator from './SaveIndicator.jsx';

const ADVANCE_DELAY_MS = 950;

/**
 * The game loop plus Phase 3 gamification: read the problem → tap an answer →
 * celebrate → next, with a full superhero reveal every 5 correct and a Hero
 * Squad gallery for picking an avatar. All game logic lives in
 * useMathGameEngine; this component only orchestrates presentation and timing.
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
    correctCount,
    heroProgress,
    pendingUnlock,
    roster,
    selectedHero,
    unlockedHeroes,
  } = engine;

  // Save/load the child's heroes, level, and score (Phase 4).
  const persistence = usePersistence(engine);

  // The value the child just tapped (for red/green button colouring).
  const [picked, setPicked] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const graded = status === 'correct' || status === 'incorrect';

  function handleStartOver() {
    if (
      correctCount > 0 &&
      !window.confirm('Start over? This clears your heroes and score.')
    ) {
      return;
    }
    persistence.startOver();
    setPicked(null);
    setGalleryOpen(false);
  }

  function handlePick(value) {
    if (status !== 'idle') return;
    setPicked(value);
    engine.submitAnswer(value);
  }

  function advance() {
    engine.nextProblem();
    setPicked(null);
  }

  // Reveal-modal actions.
  function chooseHero() {
    engine.selectAvatar(pendingUnlock.id);
    engine.acknowledgeUnlock();
    advance();
  }
  function keepCurrent() {
    engine.acknowledgeUnlock();
    advance();
  }

  // Celebrate on a correct answer. If it unlocked a hero, hold on the reveal
  // modal; otherwise auto-advance to the next problem after a beat.
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
          <AvatarBadge
            hero={selectedHero}
            collectedCount={unlockedHeroes.length}
            totalCount={roster.length}
            onOpen={() => setGalleryOpen(true)}
          />
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

      <footer className="stage__foot">
        <SaveIndicator
          status={persistence.status}
          backendLabel={persistence.backendLabel}
        />
        <button
          className="startover"
          onClick={handleStartOver}
          disabled={correctCount === 0}
        >
          ↺ Start over
        </button>
      </footer>

      {/* Superhero reveal — fires every 5 correct answers */}
      <AnimatePresence>
        {pendingUnlock && (
          <HeroRevealModal
            hero={pendingUnlock}
            currentAvatar={selectedHero}
            collectedCount={unlockedHeroes.length}
            totalCount={roster.length}
            onChoose={chooseHero}
            onKeep={keepCurrent}
          />
        )}
      </AnimatePresence>

      {/* Hero Squad gallery — pick your avatar */}
      <AnimatePresence>
        {galleryOpen && (
          <HeroGallery
            roster={roster}
            correctCount={correctCount}
            collectedCount={unlockedHeroes.length}
            onSelect={(id) => engine.selectAvatar(id)}
            onClose={() => setGalleryOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
