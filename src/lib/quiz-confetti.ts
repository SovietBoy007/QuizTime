/** Lightweight confetti burst for quiz completion (client-only). */
export async function fireQuizConfetti(): Promise<void> {
  const confetti = (await import("canvas-confetti")).default;
  confetti({
    particleCount: 70,
    spread: 55,
    startVelocity: 28,
    origin: { y: 0.55 },
    disableForReducedMotion: true,
  });
}
