import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <Text style={styles.text}>Extol v1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 24,
  },
});
