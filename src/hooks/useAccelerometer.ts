import { useEffect, useRef, useCallback } from "react";
import { Dimensions } from "react-native";
import { Accelerometer } from "expo-sensors";
import {
  useSharedValue,
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";
import { GameState } from "./useGameLoop";

const SENSITIVITY = 3.5;
const SPRITE_SIZE = 180;
const SMOOTH_FACTOR = 0.3; // EMA alpha — lower = smoother, higher = more responsive
const DEAD_ZONE = 0.03; // Ignore tilt deltas smaller than this

// Pre-compute tube geometry constants (these never change)
const { width: SW, height: SH } = Dimensions.get("window");
const VP_X = SW * 0.5;
const VP_Y = SH * 0.38;
const ARC_BASE_Y = SH * 0.78;
const ARC_HALF_W = SW * 0.42;
const ARC_CURVE_H = SH * 0.45;

export function useAccelerometer(gameState: GameState, flipRotation?: SharedValue<number>) {
  const offsetRef = useRef(0);
  const smoothedRef = useRef(0);
  const tiltValue = useSharedValue(0);
  const tiltRef = useRef(0);

  const calibrate = useCallback(() => {
    offsetRef.current = NaN;
  }, []);

  useEffect(() => {
    // During wipeout/recovery, freeze at current position (don't reset or update)
    if (gameState === "wiping_out" || gameState === "recovering") {
      return;
    }

    if (gameState !== "playing" && gameState !== "countdown") {
      tiltValue.value = 0;
      tiltRef.current = 0;
      return;
    }

    Accelerometer.setUpdateInterval(16);

    const subscription = Accelerometer.addListener(({ x }) => {
      if (isNaN(offsetRef.current)) {
        offsetRef.current = x;
        smoothedRef.current = 0;
        return;
      }

      const delta = x - offsetRef.current;
      const raw = Math.max(-1, Math.min(1, delta * SENSITIVITY));

      // Dead zone — ignore micro-jitter near current value
      const diff = raw - smoothedRef.current;
      if (Math.abs(diff) < DEAD_ZONE) return;

      // EMA smoothing — blend toward raw value
      const smoothed = smoothedRef.current + SMOOTH_FACTOR * diff;
      smoothedRef.current = smoothed;

      tiltValue.value = smoothed;
      tiltRef.current = smoothed;
    });

    return () => subscription.remove();
  }, [gameState, tiltValue]);

  // Tube-following animated style — all math is inline for worklet compat
  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    const t = Math.max(-1, Math.min(1, tiltValue.value));

    const posX = VP_X + t * ARC_HALF_W;
    // Bottom-half ellipse — flat at center, curves up smoothly toward walls
    const absT = Math.abs(t);
    const rise = ARC_CURVE_H * (1 - Math.sqrt(1 - absT * absT));
    const posY = ARC_BASE_Y - rise;
    const tiltDeg = t * 35;
    const flipDeg = flipRotation ? flipRotation.value : 0;

    return {
      left: posX - SPRITE_SIZE / 2,
      top: posY - SPRITE_SIZE / 2,
      transform: [{ rotate: `${tiltDeg + flipDeg}deg` }],
    };
  });

  return { animatedStyle, calibrate, tiltRef };
}
