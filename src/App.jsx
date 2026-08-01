import GameScreen from './components/GameScreen.jsx';

/**
 * Phase 2 — The Core Loop.
 *
 * App is intentionally thin: it just mounts the game. All state lives in
 * useMathGameEngine, and GameScreen wires that state to the kid-friendly UI.
 */
export default function App() {
  return <GameScreen />;
}
