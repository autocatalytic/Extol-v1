import { Dimensions } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// Vanishing point — center of the tube tunnel (derived from reference image)
export const VANISHING_POINT = {
  x: SCREEN_W * 0.5,
  y: SCREEN_H * 0.38,
};

// Tube arc at sprite depth — the curve the sprite rides along
const ARC_BASE_Y = SCREEN_H * 0.78; // bottom of tube where sprite sits when centered
const ARC_HALF_WIDTH = SCREEN_W * 0.42; // how far left/right the sprite can go
const ARC_CURVE_HEIGHT = SCREEN_H * 0.22; // how high sprite climbs when at tube walls

/**
 * Map a tilt value (-1 to 1) to a position on the tube surface arc.
 * t = 0: bottom center of tube
 * t = -1: left wall, t = 1: right wall
 */
export function tiltToTubePosition(t: number) {
  const clamped = Math.max(-1, Math.min(1, t));

  // x follows linear mapping
  const x = VANISHING_POINT.x + clamped * ARC_HALF_WIDTH;

  // y follows a cosine curve — rises toward tube walls
  const rise = ARC_CURVE_HEIGHT * (1 - Math.cos(clamped * Math.PI)) / 2;
  const y = ARC_BASE_Y - rise;

  // rotation: sprite leans into the curve (tangent angle)
  const rotation = clamped * 35; // degrees — lean into the wall

  return { x, y, rotation };
}

/**
 * Given an obstacle's lane position (-1 to 1) and depth (0 to 1),
 * compute its screen position and scale.
 * depth=0: at vanishing point (tiny), depth=1: at sprite level (full size)
 */
export function obstacleScreenPosition(lane: number, depth: number) {
  const target = tiltToTubePosition(lane);

  // Interpolate from vanishing point to tube surface position
  const x = VANISHING_POINT.x + (target.x - VANISHING_POINT.x) * depth;
  const y = VANISHING_POINT.y + (target.y - VANISHING_POINT.y) * depth;

  // Perspective scale — quadratic feels more natural than linear
  const scale = depth * depth;

  return { x, y, scale };
}

/**
 * Check if sprite and obstacle are colliding.
 * Both positions expressed as tilt values (-1 to 1).
 */
export function checkCollision(spriteTilt: number, obstacleLane: number, threshold = 0.2) {
  return Math.abs(spriteTilt - obstacleLane) < threshold;
}

// Obstacle approach speed — how many depth-units per second
export const OBSTACLE_SPEED = 0.45;

// Spawn interval range (ms)
export const OBSTACLE_SPAWN_MIN = 800;
export const OBSTACLE_SPAWN_MAX = 1800;

// Obstacle size at full scale (depth=1)
export const OBSTACLE_FULL_SIZE = 60;

export { SCREEN_W, SCREEN_H };
