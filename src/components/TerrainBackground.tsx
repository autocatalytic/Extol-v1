import React from "react";
import { Image, Dimensions, StyleSheet } from "react-native";
import { TERRAIN_REF } from "../assets";

const { width, height } = Dimensions.get("window");

export default function TerrainBackground() {
  return (
    <Image
      source={TERRAIN_REF}
      style={[styles.image, { width, height }]}
      resizeMode="stretch"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 0,
  },
});
