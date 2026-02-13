// Sprite sheets
export const RIDING_SHEET = require("./surfer-riding.png");
export const WIPEOUT_SHEET = require("./surfer-wipeouts.png");
export const RECOVERY_SHEET = require("./surfer-recovery.png");

// Terrain
export const TERRAIN_VIDEO = require("./Surfer_Sprite_and_Wave_Background.mp4");
export const TERRAIN_REF = require("./surf-terrain-ref-image-portrait.png");

// Sprite sheet dimensions
export const RIDING_SHEET_SIZE = { width: 2048, height: 2048, cols: 3, rows: 3 };
export const WIPEOUT_SHEET_SIZE = { width: 1024, height: 1024, cols: 1, rows: 3 };
export const RECOVERY_SHEET_SIZE = { width: 2048, height: 2048, cols: 2, rows: 3 };

/**
 * Riding sheet map (3x3):
 * Row 0: tucked-right  | resting-right  | shredding-right
 * Row 1: tucked-right  | resting-right  | shredding-right
 * Row 2: tucked-left   | resting-left   | shredding-left
 */
export type RidingPose = "tucked" | "resting" | "shredding";
export type Direction = "right" | "left";

export function getRidingFrame(pose: RidingPose, direction: Direction) {
  const col = pose === "tucked" ? 0 : pose === "resting" ? 1 : 2;
  const row = direction === "right" ? 0 : 2;
  return { row, col };
}
