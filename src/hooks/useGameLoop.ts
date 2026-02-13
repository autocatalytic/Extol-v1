import { useState, useCallback, useRef, useEffect } from "react";

export type GameState =
  | "idle"
  | "countdown"
  | "playing"
  | "wiping_out"
  | "recovering"
  | "finished";

const COUNTDOWN_MS = 1500;
const RUN_DURATION_MS = 15000;
const WIPEOUT_MS = 1200;
const RECOVERY_MS = 1000;

export function useGameLoop() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [timeLeft, setTimeLeft] = useState(RUN_DURATION_MS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wipeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(RUN_DURATION_MS);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearTimeout(countdownRef.current);
    if (wipeoutRef.current) clearTimeout(wipeoutRef.current);
    timerRef.current = null;
    countdownRef.current = null;
    wipeoutRef.current = null;
  }, []);

  const startPlaying = useCallback(
    (duration: number) => {
      const startTime = Date.now();
      remainingRef.current = duration;

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        setTimeLeft(remaining);
        remainingRef.current = remaining;

        if (remaining <= 0) {
          clearTimers();
          setGameState("finished");
        }
      }, 100);
    },
    [clearTimers],
  );

  const startGame = useCallback(() => {
    clearTimers();
    setGameState("countdown");
    setTimeLeft(RUN_DURATION_MS);
    remainingRef.current = RUN_DURATION_MS;

    countdownRef.current = setTimeout(() => {
      setGameState("playing");
      startPlaying(RUN_DURATION_MS);
    }, COUNTDOWN_MS);
  }, [clearTimers, startPlaying]);

  const triggerWipeout = useCallback(() => {
    // Pause the run timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    setGameState("wiping_out");

    wipeoutRef.current = setTimeout(() => {
      setGameState("recovering");

      wipeoutRef.current = setTimeout(() => {
        // Resume playing with remaining time
        setGameState("playing");
        startPlaying(remainingRef.current);
      }, RECOVERY_MS);
    }, WIPEOUT_MS);
  }, [startPlaying]);

  const resetGame = useCallback(() => {
    clearTimers();
    setGameState("idle");
    setTimeLeft(RUN_DURATION_MS);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  return { gameState, timeLeft, startGame, resetGame, triggerWipeout };
}
