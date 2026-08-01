import confetti from 'canvas-confetti';

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** A quick, cheerful pop for a single correct answer. */
export function popCorrect() {
  if (reduced()) return;
  confetti({
    particleCount: 55,
    spread: 70,
    startVelocity: 38,
    origin: { y: 0.7 },
    scalar: 0.9,
    colors: ['#3fa7ff', '#ffd23f', '#f15bb5', '#57cc99', '#9b5de5'],
  });
}

/** A big, sustained burst for unlocking a brand-new superhero. */
export function celebrateHero() {
  if (reduced()) return;
  const end = Date.now() + 900;
  const colors = ['#ffd23f', '#ff9f1c', '#f15bb5', '#3fa7ff', '#57cc99'];
  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 62,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 62,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
