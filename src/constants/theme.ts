export const Colors = {
  background: "#0D0D0D",
  neonCyan: "#00FFFF",
  neonPink: "#FF00FF",
  neonPinkSoft: "#FF66FF",
  white: "#FFFFFF",
  whiteAlpha70: "rgba(255,255,255,0.7)",
  whiteAlpha50: "rgba(255,255,255,0.5)",
  overlay: "rgba(0,0,0,0.6)",
  transparent: "transparent",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 36,
  xxl: 48,
  splash: 64,
} as const;

export const NeonGlow = {
  cyan: {
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  pink: {
    textShadowColor: Colors.neonPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
} as const;
