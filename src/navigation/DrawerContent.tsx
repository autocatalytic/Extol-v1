import React from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Colors, FontSize, NeonGlow, Spacing } from "../constants/theme";
import { useScore } from "../hooks/useScore";
import { useMobileWallet } from "../hooks/useMobileWallet";

export default function DrawerContent(props: any) {
  const { totalScore } = useScore();
  const { connected, address, skrBalance, solBalance, connecting, connect, disconnect } =
    useMobileWallet();

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      {/* Points display */}
      <View style={styles.section}>
        <Text style={styles.label}>Points</Text>
        <Text style={styles.points}>{totalScore.toLocaleString()}</Text>
      </View>

      <View style={styles.divider} />

      {/* Wallet section */}
      {connected ? (
        <View style={styles.section}>
          <Text style={styles.label}>Wallet</Text>
          <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
            {address}
          </Text>
          <View style={styles.balanceRow}>
            <Text style={styles.label}>SOL Balance</Text>
            <Text style={styles.balance}>{solBalance ?? "—"}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.label}>SKR Balance</Text>
            <Text style={styles.balance}>{skrBalance ?? "—"}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.walletButton, pressed && styles.buttonPressed]}
            onPress={disconnect}
          >
            <Text style={styles.disconnectText}>Disconnect</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [
              styles.walletButton,
              pressed && styles.buttonPressed,
              connecting && styles.walletButtonDisabled,
            ]}
            onPress={connect}
            disabled={connecting}
          >
            {connecting ? (
              <ActivityIndicator color={Colors.neonCyan} size="small" />
            ) : (
              <Text style={styles.connectText}>Connect Wallet</Text>
            )}
          </Pressable>
        </View>
      )}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,255,255,0.2)",
    marginHorizontal: Spacing.lg,
  },
  label: {
    color: Colors.whiteAlpha50,
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  points: {
    color: Colors.neonCyan,
    fontSize: FontSize.xl,
    fontWeight: "bold",
    ...NeonGlow.cyan,
  },
  address: {
    color: Colors.whiteAlpha70,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  balanceRow: {
    marginBottom: Spacing.md,
  },
  balance: {
    color: Colors.neonPink,
    fontSize: FontSize.lg,
    fontWeight: "bold",
    ...NeonGlow.pink,
  },
  walletButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neonCyan,
    borderRadius: 8,
    alignItems: "center",
    minHeight: 40,
    justifyContent: "center",
  },
  walletButtonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    backgroundColor: "rgba(0,255,255,0.1)",
  },
  connectText: {
    color: Colors.neonCyan,
    fontSize: FontSize.md,
    fontWeight: "600",
    ...NeonGlow.cyan,
  },
  disconnectText: {
    color: Colors.neonPink,
    fontSize: FontSize.md,
    ...NeonGlow.pink,
  },
});
