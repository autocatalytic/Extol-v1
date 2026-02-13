import { useState, useCallback, useRef, useEffect } from "react";

export type GameState =
  | "idle"
  | "countdown"
  | "playing"
  | "wiping_out"
  | "recovering"
  | "finished";

const COUNTDOWN_MS = 1500;
const RUN_DURATION_MS = 30000;
const WIPEOUT_MS = 1200;
const RECOVERY_MS = 1000;

export function useGameLoop() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [timeLeft, setTimeLeft] = useState(RUN_DURATION_MS);
  const [wasWipeout, setWasWipeout] = useState(false);
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
    setWasWipeout(false);
    setGameState("countdown");
    setTimeLeft(RUN_DURATION_MS);
    remainingRef.current = RUN_DURATION_MS;

    countdownRef.current = setTimeout(() => {
      setGameState("playing");
      startPlaying(RUN_DURATION_MS);
    }, COUNTDOWN_MS);
  }, [clearTimers, startPlaying]);

  const triggerWipeout = useCallback(() => {
    // Stop the run timer — wipeout ends the run
    clearTimers();
    setWasWipeout(true);
    setGameState("wiping_out");

    // Show wipeout animation, then transition to finished (buttons)
    wipeoutRef.current = setTimeout(() => {
      setGameState("finished");
    }, WIPEOUT_MS);
  }, [clearTimers]);

  const resetGame = useCallback(() => {
    clearTimers();
    setWasWipeout(false);
    setGameState("idle");
    setTimeLeft(RUN_DURATION_MS);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  return { gameState, timeLeft, startGame, resetGame, triggerWipeout, wasWipeout };
}
