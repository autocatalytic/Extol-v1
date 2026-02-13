import { useCallback } from "react";
import { Gesture } from "react-native-gesture-handler";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { GameState } from "./useGameLoop";

const VELOCITY_THRESHOLD = 800;
const DASH_DISTANCE = 120;
const DASH_DURATION = 300;

export function useSwipeGesture(gameState: GameState) {
  const dashX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(gameState === "playing")
    .onEnd((event) => {
      const vx = event.velocityX;
      if (Math.abs(vx) < VELOCITY_THRESHOLD) return;

      const direction = vx > 0 ? 1 : -1;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      dashX.value = withSequence(
        withTiming(direction * DASH_DISTANCE, { duration: DASH_DURATION / 2 }),
        withTiming(0, { duration: DASH_DURATION / 2 }),
      );
    });

  const dashStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dashX.value }],
  }));

  return { gestureHandler: gesture, dashStyle };
}
