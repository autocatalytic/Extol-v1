import React, { useCallback, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors, FontSize, NeonGlow, Spacing } from "../constants/theme";
import TerrainBackground from "../components/TerrainBackground";
import PointsTracker from "../components/PointsTracker";
import Sprite from "../components/Sprite";
import ObstacleLayer from "../components/ObstacleLayer";
import { useGameLoop } from "../hooks/useGameLoop";
import { useScore } from "../hooks/useScore";
import { useSpriteAnimation } from "../hooks/useSpriteAnimation";
import { useAccelerometer } from "../hooks/useAccelerometer";
import { useSwipeGesture } from "../hooks/useSwipeGesture";
import { useObstacles } from "../hooks/useObstacles";
import { useMobileWallet } from "../hooks/useMobileWallet";

type FinishPhase = "none" | "solid" | "buttons";

interface LootPopup {
  id: number;
  value: number;
}

let popupId = 0;

// Screen flash on loot collection
function LootFlash({ popup, onDone }: { popup: LootPopup; onDone: (id: number) => void }) {
  const flashOpacity = useSharedValue(0);

  // Intensity scales with loot value — 500 gets a massive flash
  const intensity = 0.15 + (popup.value / 500) * 0.25;

  useEffect(() => {
    flashOpacity.value = withSequence(
      withTiming(intensity, { duration: 60 }),
      withTiming(0, { duration: 400 }, (finished) => {
        if (finished) runOnJS(onDone)(popup.id);
      }),
    );
  }, []);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const flashColor = popup.value >= 400 ? Colors.neonGold : Colors.neonGreen;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: flashColor, zIndex: 29 },
        flashStyle,
      ]}
      pointerEvents="none"
    />
  );
}

// Main floating number — explodes in, wiggles, floats up
function FloatingLoot({ popup, onDone }: { popup: LootPopup; onDone: (id: number) => void }) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);
  const glowRadius = useSharedValue(15);

  // Scale everything with value — big numbers = big drama
  const valueFactor = popup.value / 500; // 0.2 to 1.0
  const baseFontSize = 42 + valueFactor * 36; // 42 to 78

  useEffect(() => {
    // BOOM — spring scale from 0 to overshoot then settle
    scale.value = withSpring(1, {
      damping: 6,
      stiffness: 300,
      mass: 0.8,
      overshootClamping: false,
    });

    // Wiggle rotation — quick excited shake
    rotate.value = withSequence(
      withTiming(-12, { duration: 50 }),
      withTiming(12, { duration: 60 }),
      withTiming(-8, { duration: 55 }),
      withTiming(8, { duration: 50 }),
      withTiming(-4, { duration: 45 }),
      withTiming(0, { duration: 40 }),
    );

    // Glow pulse — throb outward
    glowRadius.value = withSequence(
      withTiming(40 + valueFactor * 30, { duration: 150 }),
      withTiming(20, { duration: 300 }),
    );

    // Float up and away
    translateY.value = withDelay(
      200,
      withTiming(-160 - valueFactor * 60, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      }),
    );

    // Hold bright, then fade
    opacity.value = withSequence(
      withTiming(1, { duration: 600 }),
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished) runOnJS(onDone)(popup.id);
      }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
    textShadowRadius: glowRadius.value,
  }));

  // High-value loot gets gold treatment
  const color = popup.value >= 400 ? Colors.neonGold : Colors.neonGreen;

  return (
    <Animated.Text
      style={[
        {
          position: "absolute",
          alignSelf: "center",
          top: "40%",
          fontSize: baseFontSize,
          fontWeight: "bold",
          color,
          textShadowColor: color,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 20,
          zIndex: 30,
        },
        style,
      ]}
    >
      +{popup.value}
    </Animated.Text>
  );
}

export default function GameScreen() {
  const navigation = useNavigation<any>();
  const { gameState, startGame, resetGame, triggerWipeout, wasWipeout, timeLeft } = useGameLoop();
  const { runScore, totalScore, addPoints, commitRun, loadScore } = useScore();
  const { address } = useMobileWallet();

  // Sync score system with wallet connection state
  useEffect(() => {
    loadScore(address);
  }, [address, loadScore]);
  const { sheet, frame } = useSpriteAnimation(gameState);
  const { gestureHandler, dashStyle, flipRotation } = useSwipeGesture(gameState);
  const { animatedStyle: tiltStyle, calibrate, tiltRef } = useAccelerometer(gameState, flipRotation);
  const [lootPopups, setLootPopups] = useState<LootPopup[]>([]);

  const [lootFlashes, setLootFlashes] = useState<LootPopup[]>([]);

  const removeLootFlash = useCallback((id: number) => {
    setLootFlashes((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleCollectLoot = useCallback((value: number) => {
    addPoints(value);
    const id = popupId++;
    setLootPopups((prev) => [...prev, { id, value }]);
    setLootFlashes((prev) => [...prev, { id, value }]);
    // Escalating haptics — bigger loot = heavier hit
    if (value >= 400) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (value >= 250) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [addPoints]);

  const removeLootPopup = useCallback((id: number) => {
    setLootPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const { obstacles } = useObstacles(gameState, tiltRef, triggerWipeout, handleCollectLoot);
  const [finishPhase, setFinishPhase] = useState<FinishPhase>("none");

  // Sequence: finished → show "Solid!" (or skip after wipeout) → show buttons
  useEffect(() => {
    if (gameState === "finished") {
      if (wasWipeout) {
        // Wipeout already showed its text — go straight to buttons
        setFinishPhase("buttons");
      } else {
        setFinishPhase("solid");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const timer = setTimeout(() => {
          setFinishPhase("buttons");
        }, 2000);

        return () => clearTimeout(timer);
      }
    } else {
      setFinishPhase("none");
    }
  }, [gameState, wasWipeout]);

  const handleStart = useCallback(() => {
    calibrate();
    startGame();
  }, [calibrate, startGame]);

  const handleDropAgain = useCallback(() => {
    commitRun();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    calibrate();
    startGame();
  }, [commitRun, calibrate, startGame]);

  const handleExit = useCallback(() => {
    commitRun();
    resetGame();
  }, [commitRun, resetGame]);

  // Clear loot effects when game resets
  useEffect(() => {
    if (gameState === "idle" || gameState === "countdown") {
      setLootPopups([]);
      setLootFlashes([]);
    }
  }, [gameState]);

  return (
    <View style={styles.container}>
      <TerrainBackground />

      {/* Hamburger menu — visible when not in active gameplay */}
      {(gameState === "idle" || finishPhase === "buttons") && (
        <Pressable
          style={styles.hamburger}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          hitSlop={16}
        >
          <Text style={styles.hamburgerText}>☰</Text>
        </Pressable>
      )}

      {/* Obstacle layer — behind sprite, on top of background */}
      <ObstacleLayer obstacles={obstacles} />

      {/* Screen flash on loot collection */}
      {lootFlashes.map((flash) => (
        <LootFlash key={`flash-${flash.id}`} popup={flash} onDone={removeLootFlash} />
      ))}

      {/* Floating loot collection popups */}
      {lootPopups.map((popup) => (
        <FloatingLoot key={popup.id} popup={popup} onDone={removeLootPopup} />
      ))}

      {/* Sprite layer */}
      {gameState !== "idle" && (
        <Sprite
          sheet={sheet}
          frame={frame}
          tiltStyle={tiltStyle}
          dashStyle={dashStyle}
          gestureHandler={gestureHandler}
        />
      )}

      {/* HUD — visible during play and wipeout (frozen) */}
      {(gameState === "playing" || gameState === "wiping_out" || gameState === "finished") && (
        <PointsTracker points={runScore} total={totalScore} />
      )}

      {/* Wipeout overlay */}
      {gameState === "wiping_out" && (
        <Animated.View
          key="wipeout"
          style={styles.solidOverlay}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(300)}
        >
          <Text style={styles.wipeoutText}>Wipeout!</Text>
        </Animated.View>
      )}

      {/* State overlays */}
      {gameState === "idle" && (
        <Animated.View style={styles.overlay} entering={FadeIn} exiting={FadeOut}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}
            onPress={handleStart}
          >
            <Text style={styles.actionText}>Drop In</Text>
          </Pressable>
        </Animated.View>
      )}

      {gameState === "countdown" && (
        <Animated.View style={styles.overlay} entering={FadeIn} exiting={FadeOut}>
          <Text style={styles.countdownText}>Get Ready</Text>
        </Animated.View>
      )}

      {/* "Solid!" — shows first, fades out before buttons appear */}
      {finishPhase === "solid" && (
        <Animated.View
          key="solid"
          style={styles.solidOverlay}
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(600)}
        >
          <Text style={styles.solidText}>Solid!</Text>
        </Animated.View>
      )}

      {/* Buttons — appear only after "Solid!" has faded */}
      {finishPhase === "buttons" && (
        <Animated.View key="buttons" style={styles.overlay} entering={FadeIn.duration(400)}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}
            onPress={handleDropAgain}
          >
            <Text style={styles.actionText}>Drop Again?</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.exitButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleExit}
          >
            <Text style={[styles.actionText, styles.exitText]}>Exit</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hamburger: {
    position: "absolute",
    top: Spacing.xxl,
    left: Spacing.lg,
    zIndex: 30,
  },
  hamburgerText: {
    color: Colors.neonCyan,
    fontSize: FontSize.xl,
    ...NeonGlow.cyan,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.overlay,
    zIndex: 20,
  },
  solidOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 25,
  },
  countdownText: {
    color: Colors.neonCyan,
    fontSize: FontSize.splash,
    fontWeight: "bold",
    ...NeonGlow.cyan,
  },
  solidText: {
    color: Colors.neonPink,
    fontSize: 80,
    fontWeight: "bold",
    ...NeonGlow.pink,
  },
  wipeoutText: {
    color: Colors.neonPink,
    fontSize: 64,
    fontWeight: "bold",
    ...NeonGlow.pink,
  },
  actionButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.neonCyan,
    borderRadius: 12,
    marginVertical: Spacing.sm,
    minWidth: 200,
    alignItems: "center",
  },
  exitButton: {
    borderColor: Colors.neonPink,
  },
  buttonPressed: {
    backgroundColor: "rgba(0,255,255,0.1)",
  },
  actionText: {
    color: Colors.neonCyan,
    fontSize: FontSize.lg,
    fontWeight: "bold",
    ...NeonGlow.cyan,
  },
  exitText: {
    color: Colors.neonPink,
    ...NeonGlow.pink,
  },
});
