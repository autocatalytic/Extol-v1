import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Colors, FontSize, NeonGlow, Spacing } from "../constants/theme";

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.hamburger}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        hitSlop={16}
      >
        <Text style={styles.hamburgerText}>☰</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}
        onPress={() => navigation.navigate("Game")}
      >
        <Text style={styles.playText}>Play</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  hamburger: {
    position: "absolute",
    top: Spacing.xxl,
    left: Spacing.lg,
    zIndex: 10,
  },
  hamburgerText: {
    color: Colors.neonCyan,
    fontSize: FontSize.xl,
    ...NeonGlow.cyan,
  },
  playButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.neonCyan,
    borderRadius: 12,
  },
  playButtonPressed: {
    backgroundColor: "rgba(0,255,255,0.1)",
  },
  playText: {
    color: Colors.neonCyan,
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    ...NeonGlow.cyan,
  },
});
