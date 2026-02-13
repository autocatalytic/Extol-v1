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

  // Scale based on frame HEIGHT so the character is the same visual size across all sheets.
  // Wider frames (e.g. wipeout 1024×341) get center-cropped horizontally within the clip.
  const scale = SPRITE_DISPLAY_SIZE / frameHeight;

  const scaledFrameW = frameWidth * scale;
  const scaledFrameH = SPRITE_DISPLAY_SIZE;

  // Fixed clip — always SPRITE_DISPLAY_SIZE × SPRITE_DISPLAY_SIZE
  const clipWidth = SPRITE_DISPLAY_SIZE;
  const clipHeight = SPRITE_DISPLAY_SIZE;

  const imageWidth = config.width * scale;
  const imageHeight = config.height * scale;

  // Center-crop: if scaled frame is wider than clip, offset to show the middle
  const cropX = Math.max(0, (scaledFrameW - clipWidth) / 2);
  const offsetX = -(frame.col * scaledFrameW) - cropX;
  const offsetY = -(frame.row * scaledFrameH);

  // Nested views: outer handles dash (translateX/Y), inner handles tilt (position + rotation).
  // This prevents dashStyle's transform from overriding tiltStyle's rotation.
  return (
    <GestureDetector gesture={gestureHandler}>
      <Animated.View style={[styles.gestureContainer, dashStyle]}>
        <Animated.View
          style={[
            styles.wrapper,
            { width: clipWidth, height: clipHeight },
            tiltStyle,
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
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  gestureContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  wrapper: {
    position: "absolute",
    overflow: "hidden",
  },
});
