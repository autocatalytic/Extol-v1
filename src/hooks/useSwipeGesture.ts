import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { GameState } from "./useGameLoop";

const VELOCITY_THRESHOLD = 800;
const DASH_DISTANCE = 120;
const DASH_DURATION = 300;

// Hop with hang time: up → hold at peak → down
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HOP_HEIGHT = SCREEN_HEIGHT * 0.28;
const HOP_UP_MS = 250;
const HOP_HOLD_MS = 200;
const HOP_DOWN_MS = 300;
const HOP_TOTAL_MS = HOP_UP_MS + HOP_HOLD_MS + HOP_DOWN_MS; // 750ms

// Haptics must be called on the JS thread, not the Reanimated UI thread
function triggerMediumHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function useSwipeGesture(gameState: GameState) {
  const dashX = useSharedValue(0);
  const dashY = useSharedValue(0);
  const flipRotation = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(gameState === "playing")
    .onEnd((event) => {
      "worklet";
      const vx = event.velocityX;
      const vy = event.velocityY;

      // Upward swipe — hop with flip
      if (vy < -VELOCITY_THRESHOLD) {
        runOnJS(triggerMediumHaptic)();

        // Vertical arc: up → hold at peak → down
        dashY.value = withSequence(
          withTiming(-HOP_HEIGHT, { duration: HOP_UP_MS, easing: Easing.out(Easing.quad) }),
          withTiming(-HOP_HEIGHT, { duration: HOP_HOLD_MS }), // hang at peak
          withTiming(0, { duration: HOP_DOWN_MS, easing: Easing.in(Easing.quad) }),
        );

        // 360° flip over the full hop duration, then instant reset
        flipRotation.value = withSequence(
          withTiming(360, { duration: HOP_TOTAL_MS, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1 }), // 360° = 0° visually — invisible reset
        );
        return;
      }

      // Horizontal swipe — dash
      if (Math.abs(vx) < VELOCITY_THRESHOLD) return;

      const direction = vx > 0 ? 1 : -1;

      runOnJS(triggerMediumHaptic)();

      dashX.value = withSequence(
        withTiming(direction * DASH_DISTANCE, { duration: DASH_DURATION / 2 }),
        withTiming(0, { duration: DASH_DURATION / 2 }),
      );
    });

  const dashStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dashX.value }, { translateY: dashY.value }],
  }));

  return { gestureHandler: gesture, dashStyle, flipRotation };
}
