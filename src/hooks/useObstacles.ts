import { useState, useCallback, useRef, useEffect, MutableRefObject } from "react";
import * as Haptics from "expo-haptics";
import {
  OBSTACLE_SPEED,
  OBSTACLE_SPAWN_MIN,
  OBSTACLE_SPAWN_MAX,
  checkCollision,
} from "../constants/tubeGeometry";
import { GameState } from "./useGameLoop";

export interface Obstacle {
  id: number;
  lane: number; // -1 to 1 position around the tube
  depth: number; // 0 (vanishing point) to 1+ (past sprite)
  type: number; // visual variant index
}

let nextId = 0;

// Available lane positions — spread around the tube
const LANES = [-0.8, -0.5, -0.2, 0, 0.2, 0.5, 0.8];

export function useObstacles(
  gameState: GameState,
  tiltRef: MutableRefObject<number>,
  onCrash?: () => void,
) {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  // Imperative ref for physics — React 18 defers functional updaters,
  // so collision checks must read from a ref, not inside setState.
  const obstaclesRef = useRef<Obstacle[]>([]);
  const frameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimeRef = useRef(0);
  const onCrashRef = useRef(onCrash);
  const crashedThisCycleRef = useRef(false);

  onCrashRef.current = onCrash;

  const cleanup = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    frameRef.current = null;
    spawnTimerRef.current = null;
  }, []);

  const spawnObstacle = useCallback(() => {
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const type = Math.floor(Math.random() * 4);
    const newObs: Obstacle = { id: nextId++, lane, depth: 0, type };
    obstaclesRef.current = [...obstaclesRef.current, newObs];
    setObstacles([...obstaclesRef.current]);
  }, []);

  const scheduleSpawn = useCallback(() => {
    const delay = OBSTACLE_SPAWN_MIN + Math.random() * (OBSTACLE_SPAWN_MAX - OBSTACLE_SPAWN_MIN);
    spawnTimerRef.current = setTimeout(() => {
      spawnObstacle();
      scheduleSpawn();
    }, delay);
  }, [spawnObstacle]);

  useEffect(() => {
    if (gameState !== "playing") {
      cleanup();
      if (gameState === "idle" || gameState === "countdown") {
        obstaclesRef.current = [];
        setObstacles([]);
      }
      crashedThisCycleRef.current = false;
      return;
    }

    lastTimeRef.current = Date.now();
    crashedThisCycleRef.current = false;

    // Start spawning
    spawnObstacle();
    scheduleSpawn();

    // Animation loop — advance depths and check collisions on the ref
    const tick = () => {
      if (crashedThisCycleRef.current) return;

      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      let hit = false;
      const updated: Obstacle[] = [];

      for (const obs of obstaclesRef.current) {
        const newDepth = obs.depth + OBSTACLE_SPEED * dt;

        // Check collision at sprite depth
        if (!hit && obs.depth < 1.0 && newDepth >= 0.95) {
          if (checkCollision(tiltRef.current, obs.lane)) {
            hit = true;
          }
        }

        if (newDepth < 1.3) {
          updated.push({ ...obs, depth: newDepth });
        }
      }

      // Write to ref (synchronous, for next tick) and state (for render)
      obstaclesRef.current = updated;
      setObstacles(updated);

      if (hit) {
        crashedThisCycleRef.current = true;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onCrashRef.current?.();
        return; // Stop animation loop — game state will change
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return cleanup;
  }, [gameState, cleanup, spawnObstacle, scheduleSpawn]);

  return { obstacles };
}
