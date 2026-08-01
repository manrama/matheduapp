import { useMathGameEngine } from './hooks/useMathGameEngine.js';

/**
 * Phase 1 placeholder.
 *
 * There is intentionally no game UI yet — that arrives in Phase 2. This tiny
 * dev panel just wires up the engine so we can sanity-check that the seed data
 * and useMathGameEngine hook load and respond correctly.
 */
export default function App() {
  const engine = useMathGameEngine();

  return (
    <main
      style={{
        maxWidth: 520,
        margin: '0 auto',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '2rem' }}>🦸 Mathketeers</h1>
      <p style={{ opacity: 0.7 }}>
        Phase&nbsp;1 wiring check — game UI coming in Phase&nbsp;2.
      </p>

      <section
        style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          borderRadius: 20,
          background: '#f4f6ff',
          fontSize: '1.5rem',
        }}
      >
        <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
          {engine.problem.prompt} = ?
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '1rem', opacity: 0.7 }}>
          Level {engine.level} · {engine.levelMeta.label}
        </div>
      </section>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
        <button onClick={() => engine.submitAnswer(engine.problem.answer)}>
          Answer correctly
        </button>
        <button onClick={() => engine.submitAnswer(-1)}>Answer wrong</button>
        <button onClick={engine.nextProblem}>Next</button>
        {engine.pendingUnlock && (
          <button onClick={engine.acknowledgeUnlock}>
            Claim {engine.pendingUnlock.name} {engine.pendingUnlock.emoji}
          </button>
        )}
      </div>

      <pre
        style={{
          marginTop: 20,
          textAlign: 'left',
          background: '#111',
          color: '#7CFC9B',
          padding: 16,
          borderRadius: 12,
          fontSize: 13,
          overflowX: 'auto',
        }}
      >
        {JSON.stringify(
          {
            score: engine.score,
            level: engine.level,
            streak: engine.streak,
            correctCount: engine.correctCount,
            status: engine.status,
            heroProgress: engine.heroProgress,
            unlocked: engine.unlockedHeroes.map((h) => h.name),
            selectedHero: engine.selectedHero?.name ?? null,
          },
          null,
          2,
        )}
      </pre>
    </main>
  );
}
