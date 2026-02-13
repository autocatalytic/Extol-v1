import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Obstacle } from "../hooks/useObstacles";
import { obstacleScreenPosition, OBSTACLE_FULL_SIZE } from "../constants/tubeGeometry";
import { Colors } from "../constants/theme";

// Placeholder neon obstacle shapes — will be replaced with proper sprites
const OBSTACLE_COLORS = [Colors.neonCyan, Colors.neonPink, Colors.neonPinkSoft, Colors.neonCyan];
const OBSTACLE_SHAPES: Array<"diamond" | "circle" | "square" | "triangle"> = [
  "diamond",
  "circle",
  "square",
  "triangle",
];

interface Props {
  obstacles: Obstacle[];
}

function LootItem({ obstacle }: { obstacle: Obstacle }) {
  const { x, y, scale } = obstacleScreenPosition(obstacle.lane, obstacle.depth);
  const fontSize = Math.max(8, 28 * scale);

  if (fontSize < 6) return null;

  return (
    <Text
      style={{
        position: "absolute",
        left: x - fontSize * 1.2,
        top: y - fontSize * 0.6,
        fontSize,
        fontWeight: "bold",
        color: Colors.neonGreen,
        opacity: Math.min(1, obstacle.depth * 1.5),
        textShadowColor: Colors.neonGreen,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: fontSize * 0.4,
      }}
    >
      {obstacle.loot}
    </Text>
  );
}

function ObstacleItem({ obstacle }: { obstacle: Obstacle }) {
  if (obstacle.loot) return <LootItem obstacle={obstacle} />;

  const { x, y, scale } = obstacleScreenPosition(obstacle.lane, obstacle.depth);
  const size = OBSTACLE_FULL_SIZE * scale;
  const color = OBSTACLE_COLORS[obstacle.type % OBSTACLE_COLORS.length];
  const shape = OBSTACLE_SHAPES[obstacle.type % OBSTACLE_SHAPES.length];

  if (size < 2) return null; // too small to render

  const baseStyle = {
    position: "absolute" as const,
    left: x - size / 2,
    top: y - size / 2,
    width: size,
    height: size,
    opacity: Math.min(1, obstacle.depth * 1.5),
  };

  switch (shape) {
    case "circle":
      return (
        <View
          style={[
            baseStyle,
            {
              borderRadius: size / 2,
              borderWidth: Math.max(1, size * 0.12),
              borderColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: size * 0.3,
              shadowOpacity: 0.8,
            },
          ]}
        />
      );

    case "diamond":
      return (
        <View
          style={[
            baseStyle,
            {
              transform: [{ rotate: "45deg" }],
              borderWidth: Math.max(1, size * 0.12),
              borderColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: size * 0.3,
              shadowOpacity: 0.8,
            },
          ]}
        />
      );

    case "square":
      return (
        <View
          style={[
            baseStyle,
            {
              borderWidth: Math.max(1, size * 0.12),
              borderColor: color,
              borderRadius: size * 0.15,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: size * 0.3,
              shadowOpacity: 0.8,
            },
          ]}
        />
      );

    case "triangle":
      return (
        <View
          style={[
            baseStyle,
            {
              backgroundColor: "transparent",
              borderLeftWidth: size / 2,
              borderRightWidth: size / 2,
              borderBottomWidth: size * 0.85,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: color,
              width: 0,
              height: 0,
              left: x - size / 2,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: size * 0.3,
              shadowOpacity: 0.8,
            },
          ]}
        />
      );
  }
}

export default function ObstacleLayer({ obstacles }: Props) {
  return (
    <View style={styles.container} pointerEvents="none">
      {obstacles.map((obs) => (
        <ObstacleItem key={obs.id} obstacle={obs} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
});
