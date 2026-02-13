import React, { useEffect, useState } from "react";
import { StyleSheet, StatusBar } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import { ScoreProvider } from "./src/hooks/useScore";
import { WalletProvider } from "./src/hooks/useMobileWallet";
import { Colors, FontSize } from "./src/constants/theme";

const SPLASH_DURATION = 2000;

function SplashOverlay({ onDone }: { onDone: () => void }) {
  const opacity = useSharedValue(1);
  const glowIntensity = useSharedValue(0.5);

  useEffect(() => {
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) runOnJS(onDone)();
      });
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    textShadowRadius: 10 + glowIntensity.value * 30,
  }));

  return (
    <Animated.View style={[styles.splash, containerStyle]}>
      <Animated.Text style={[styles.splashText, styles.splashGlow, textStyle]}>
        Neon Surfer
      </Animated.Text>
    </Animated.View>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <WalletProvider>
        <ScoreProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ScoreProvider>
      </WalletProvider>
      {!splashDone && <SplashOverlay onDone={() => setSplashDone(true)} />}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  splashText: {
    color: Colors.neonCyan,
    fontSize: FontSize.splash,
    fontWeight: "bold",
  },
  splashGlow: {
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
});
