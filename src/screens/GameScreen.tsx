import React, { useCallback, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
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

type FinishPhase = "none" | "solid" | "buttons";

export default function GameScreen() {
  const navigation = useNavigation<any>();
  const { gameState, startGame, resetGame, triggerWipeout, wasWipeout, timeLeft } = useGameLoop();
  const { runScore, totalScore, addPoints, commitRun } = useScore();
  const { sheet, frame } = useSpriteAnimation(gameState);
  const { gestureHandler, dashStyle, flipRotation } = useSwipeGesture(gameState);
  const { animatedStyle: tiltStyle, calibrate, tiltRef } = useAccelerometer(gameState, flipRotation);
  const { obstacles } = useObstacles(gameState, tiltRef, triggerWipeout);
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

  // Points accumulate during playing
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => addPoints(10), 100);
    return () => clearInterval(interval);
  }, [gameState, addPoints]);

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
