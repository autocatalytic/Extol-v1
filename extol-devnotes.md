# Tahitian Tube — Game Design Spec (v1)

## App Overview
Android surfing game for the Solana Seeker device. Players ride through a tube wave, collecting loot numbers for points while dodging geometric obstacles. Built with Expo SDK 52 and React Native, targeting 60fps on the Seeker's MediaTek Dimensity 7300.

Points link to a connected Solana wallet — logged-in players accumulate scores across sessions via AsyncStorage keyed to their wallet address. Future versions will connect points to on-chain token rewards (SKR).

### Seeker Device Features Used
- **Accelerometer/gyroscope** — tilt-to-move controls via expo-sensors
- **Haptic engine** — expo-haptics for loot collection (escalating by value), wipeout, and UI feedback
- **Mobile Wallet Adapter 2.0** — wallet connect/authorize for identity and balance display
- **Seed Vault** — biometric signing (future: on-chain transactions)


## User Experience Flow

### Splash Screen (3 seconds)
- Full-screen video background (Tahitian-splashScreen.mov) via expo-video
- "Tahitian Tube" text centered, 30% transparent, pulsing neon cyan glow
- Fades out after 3s, revealing the game screen

### Game Screen — Idle State
- Static terrain background image
- "Drop In" button centered
- Hamburger menu (top-left) opens drawer with wallet/score info

### Gameplay (30 seconds per run)
- "Get Ready" countdown overlay (1.5s) — accelerometer calibrates to current hold position
- Sprite appears at bottom-center of tube
- Obstacles and loot numbers approach from the vanishing point
- Score tracker visible top-right in neon gold
- Run ends after 30 seconds → "Solid!" text (2s) → action buttons

### Wipeout
- Collision with obstacle triggers wipeout sprite animation (1.2s)
- "Wipeout!" overlay text
- Transitions directly to action buttons (skips "Solid!" text)

### End-of-Run Buttons
- "Drop Again?" — commits score, recalibrates, starts new run
- "Exit" — commits score, returns to idle state

### Hamburger Menu (Drawer)
- **Points display** — current total score
- **Wallet section** (conditional):
  - Not connected: "Connect Wallet" button → triggers MWA authorize (fresh auth each time, no cached tokens)
  - Connected: wallet address, SOL balance, SKR balance, "Disconnect" button


## Scoring System

### Loot Collection (primary scoring)
- 40% of spawns are loot numbers instead of obstacles
- Values: 100, 150, 200, 250, 300, 350, 400, 450, 500 (random)
- Collecting: sprite collides with loot number → points added to run score
- Collection effects:
  - Spring scale burst with bouncy overshoot (damping 6, stiffness 300)
  - Rapid rotation wiggle (±12° shake settling to 0)
  - Glow throb (text shadow pulses outward)
  - Value-scaled font size (42px for 100, up to 78px for 500)
  - Color tier: green for ≤350, neon gold for ≥400
  - Screen flash (intensity scales with value)
  - Escalating haptics: Light (<250), Medium (250-399), Heavy (400+)
  - Float-up fade-out over ~1.1s

### Score Persistence
- **Wallet connected**: total accumulates across runs, persisted to AsyncStorage keyed by wallet address
- **No wallet**: run score resets to 0 between plays, no accumulation
- Score tracker: neon gold (#FFD700), 48px font with glow, total shown below at 60% opacity


## Sprite & Controls

### Tilt Controls (Accelerometer)
- expo-sensors at 16ms update interval (60Hz)
- Calibration: captures neutral offset on "Get Ready"
- Sensitivity multiplier: 3.5
- **EMA smoothing**: alpha = 0.3 (blends toward raw value)
- **Dead zone**: 0.03 (ignores micro-jitter below threshold)

### Tube Arc (Bottom-Half Ellipse)
The sprite rides along a curved arc representing the inside of a tube wave:

```
rise = ARC_CURVE_H × (1 - √(1 - t²))
```

Where `t` is the normalized tilt value (-1 to 1). This traces the bottom half of an ellipse — flat and controllable at center, curving up smoothly toward the tube walls.

- `ARC_BASE_Y` = 78% of screen height (bottom of tube)
- `ARC_HALF_WIDTH` = 42% of screen width (lateral range)
- `ARC_CURVE_HEIGHT` = 45% of screen height (vertical range — sprite reaches ~1/3 from top at full tilt)
- Sprite rotation: ±35° lean into the curve

### Hop Mechanic (Upward Swipe)
- Triggered by upward swipe (velocity threshold ~800 units/s)
- 3-phase animation: up (250ms) → hold (200ms) → down (300ms) = 750ms total
- 360° flip rotation over the full duration
- Nested Animated.Views prevent transform conflicts between hop and tilt

### Horizontal Dash (Left/Right Swipe)
- ±120px lateral displacement over 300ms
- Overrides tilt input during dash window


## Obstacles & Loot

### Obstacle Types
4 geometric neon shapes: diamond, circle, square, triangle
- Colors: neon cyan, neon pink, soft pink
- Wireframe style with glow (border + shadow)

### Loot Numbers
- Rendered as bold text in neon green (#00DD44) with glow
- Same perspective scaling as obstacles
- Font size scales with depth (8px at vanishing point, 28px at sprite level)

### Spawning
- Interval: 800ms to 1800ms between spawns (random)
- 9 lane positions: [-0.95, -0.8, -0.5, -0.2, 0, 0.2, 0.5, 0.8, 0.95]
- 40% loot, 60% obstacles
- Approach speed: 0.45 depth-units/second

### Perspective & Depth
- Vanishing point: screen center horizontally, 38% from top
- Objects spawn at depth=0 (vanishing point, tiny) and approach to depth=1 (sprite level, full size)
- Scale: quadratic (`depth²`) for natural perspective
- Position: linear interpolation from vanishing point to tube surface arc position

### Collision Detection
- 1D comparison in tilt-space: `|spriteTilt - obstacleLane| < threshold`
- Threshold: 0.2
- Collision window: depth 0.95 to 1.0
- Loot collision: collect (remove from scene, trigger effects)
- Obstacle collision: wipeout (end run)


## Sprite Sheets

| Sheet | Source | Dimensions | Grid | Frame Size |
|-------|--------|-----------|------|------------|
| Riding | surfer-riding.png | 2048×2048 | 3×3 | 682×682 |
| Wipeout | surfer-wipeout.png | 1024×1024 | 1×3 | 1024×341 |
| Recovery | surfer-recovery.png | 2048×2048 | 2×3 | 1024×682 |

- Height-based scaling for consistent character size across sheets
- Fixed 180×180 display clip with center-crop for wider frames
- Wipeout sprites appear at varied positions (collision location)


## Technical Architecture

### Key Files
| File | Purpose |
|------|---------|
| `App.tsx` | Root — splash overlay, providers, navigation container |
| `src/screens/GameScreen.tsx` | Game orchestrator — state overlays, loot effects, HUD |
| `src/hooks/useGameLoop.ts` | State machine: idle → countdown → playing → finished/wiping_out |
| `src/hooks/useAccelerometer.ts` | Tilt input with EMA smoothing, tube arc positioning |
| `src/hooks/useSwipeGesture.ts` | Hop (upward swipe + flip) and dash (horizontal swipe) |
| `src/hooks/useObstacles.ts` | Spawn, physics, collision — ref-based for React 18 compat |
| `src/hooks/useScore.ts` | Score context — wallet-aware persistence via AsyncStorage |
| `src/hooks/useMobileWallet.ts` | MWA 2.0 connect/authorize, balance fetching |
| `src/constants/tubeGeometry.ts` | Arc math, obstacle positioning, collision formula |
| `src/constants/theme.ts` | Colors (neon cyan/pink/green/gold), spacing, fonts, glow presets |
| `src/components/Sprite.tsx` | Sprite sheet renderer with nested transform views |
| `src/components/ObstacleLayer.tsx` | Renders obstacles (shapes) and loot (numbers) with perspective |
| `src/components/PointsTracker.tsx` | Score HUD — neon gold with glow |
| `src/navigation/DrawerContent.tsx` | Hamburger menu — wallet, scores, connect/disconnect |

### Key Bug Patterns (Reference)
- **React 18 setState timing**: functional updaters run during deferred render phase, not synchronously. Game physics/collision must use refs, not setState.
- **Reanimated UI thread**: gesture callbacks run on UI thread. JS functions (Haptics, etc.) must use `runOnJS()` wrapper + `"worklet"` directive.
- **Transform style conflicts**: multiple `transform` arrays in a style list — later silently overrides earlier. Fix: nested Animated.Views.

### Build
```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
yarn install
npx expo run:android
```
- No Expo Go (MWA requires native intents)
- Android only
- yarn, not npm
- Polyfills load first (index.js)


## Future Considerations
- Multiple levels with increasing difficulty (more obstacles, faster speed, narrower lanes)
- On-chain score submission / leaderboard
- SKR token rewards tied to score milestones
- Genesis NFT holder perks
- Lootbox/pachislot mechanics at end of runs
- Different terrain themes per level


## Credits
- Gemini https://gemini.google.com/
- Image by tohamina on Freepik
- SurfPics: https://x.com/surfgoldbeaches/status/2021343426965631143?s=20
