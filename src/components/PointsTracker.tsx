import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedProps,
} from "react-native-reanimated";
import { Colors, FontSize, NeonGlow, Spacing } from "../constants/theme";

interface Props {
  points: number;
  total: number;
}

export default function PointsTracker({ points, total }: Props) {
  const displayValue = useSharedValue(0);

  useEffect(() => {
    displayValue.value = withTiming(points, { duration: 150 });
  }, [points]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.points, animatedStyle]}>
        {points.toLocaleString()}
      </Animated.Text>
      {total > 0 && (
        <Animated.Text style={styles.total}>
          Total: {(total + points).toLocaleString()}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Spacing.xxl,
    right: Spacing.lg,
    alignItems: "flex-end",
    zIndex: 10,
  },
  points: {
    color: Colors.neonGold,
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    ...NeonGlow.gold,
  },
  total: {
    color: Colors.neonGold,
    fontSize: FontSize.md,
    opacity: 0.6,
    marginTop: Spacing.xs,
    ...NeonGlow.gold,
  },
});
