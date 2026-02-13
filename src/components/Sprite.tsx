import React from "react";
import { Image, StyleSheet } from "react-native";
import Animated, { AnimatedStyle } from "react-native-reanimated";
import { GestureDetector, GestureType } from "react-native-gesture-handler";
import {
  RIDING_SHEET,
  WIPEOUT_SHEET,
  RECOVERY_SHEET,
  RIDING_SHEET_SIZE,
  WIPEOUT_SHEET_SIZE,
  RECOVERY_SHEET_SIZE,
} from "../assets";

export type SpriteSheet = "riding" | "wipeout" | "recovery";

interface SpriteFrame {
  row: number;
  col: number;
}

interface Props {
  sheet: SpriteSheet;
  frame: SpriteFrame;
  tiltStyle: AnimatedStyle;
  dashStyle: AnimatedStyle;
  gestureHandler: GestureType;
}

const SPRITE_DISPLAY_SIZE = 180;

function getSheetConfig(sheet: SpriteSheet) {
  switch (sheet) {
    case "riding":
      return { source: RIDING_SHEET, ...RIDING_SHEET_SIZE };
    case "wipeout":
      return { source: WIPEOUT_SHEET, ...WIPEOUT_SHEET_SIZE };
    case "recovery":
      return { source: RECOVERY_SHEET, ...RECOVERY_SHEET_SIZE };
  }
}

export default function Sprite({ sheet, frame, tiltStyle, dashStyle, gestureHandler }: Props) {
  const config = getSheetConfig(sheet);

  const frameWidth = config.width / config.cols;
  const frameHeight = config.height / config.rows;
  const scale = SPRITE_DISPLAY_SIZE / frameWidth;

  const clipWidth = SPRITE_DISPLAY_SIZE;
  const clipHeight = frameHeight * scale;

  const imageWidth = config.width * scale;
  const imageHeight = config.height * scale;

  const offsetX = -(frame.col * frameWidth * scale);
  const offsetY = -(frame.row * frameHeight * scale);

  return (
    <GestureDetector gesture={gestureHandler}>
      <Animated.View
        style={[
          styles.wrapper,
          { width: clipWidth, height: clipHeight },
          tiltStyle,
          dashStyle,
        ]}
      >
        <Image
          source={config.source}
          style={{
            width: imageWidth,
            height: imageHeight,
            position: "absolute",
            left: offsetX,
            top: offsetY,
          }}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    overflow: "hidden",
    zIndex: 5,
  },
});
