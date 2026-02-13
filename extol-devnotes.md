# Seeker Game Core Design Spec

## App overview
MVP for an android game application that will attract players by linking points/scores with solana tokens (such as SKR) and take advantage of the Solana Seeker device features. We are iterating on the best format, starting with one version as a surfer game and another in a snowboard terrain park. The general idea is to have players go through levels of increasing difficulty, gaining points for not crashing. In the initial version we had points earned by not crashing (i.e. simply time riding) but we are transitioning to point rewards based on completing manouvers and point subtractions for crashing or hitting obstacles.

One more general comment: I am looking for interesting ways to incorporate the wallet into the gameplay or scoreboard, and I want to push any online transactions to the end of the engagement loop. However if there are interesting suggestions for using the onboard seeker wallet please make them.



# User Experience
The splash screen show large, pulsing text and display whle the app is loading, then fade out and cut to the homescreen when the app is ready. It is only 2 seconds or so.

Upon app load, users arrive at the main screen, with a button saying Play. The hamburger button in the top left will also be displayed (see below).

Eventually there will be multiple onboarding paths, but the current version will only have one: the primary gameplay window. 

Primary gameplay will have the following behavior: 
- Primary gameplay tab will display
- Overlaid in the top right corner will be a points tracker, accumulating quickly with a scroll wheel visual. 
- Points accumulate as the rider continues without crashing or colliding with obstacles, for a max of 15 seconds. 
- Finish line: after 15 seconds the text "Solid!" displays as the rider crosses a threshold
- After a small time interval the "Solid!" text fades out and is replaced with two buttons stacked above one another. The top one will have text "Drop Again?", and the lower one "Exit"
- "Drop Again" will run the process again, adding on to points from the prior session.
- "Exit" will take us to the main screen

Score and Points
- points should persist across sessions for logged in users (see below).
- users not logged in will restart with zero points on pressing "Exit" button.

There will be a hamburger button in the top left which opens a menu. Current points are displayed at the top, and below that the items displayed are conditional on whether the player has connected their wallet:
- users with a connected wallet will see the SKR they have in the seeker wallet 
- users who have not connected will see the "connect wallet" button. pressing it activates the connect wallet features.
- users that connect their wallet are "logged in".


## Seeker and Solana Mobile Stack Attributes to Features
I don't have a business model yet. My app goals are above and rather than spend a lot of time thinking through how I can make money my main goals are to utilize interesting aspects of Seeker. These are not in order.

- sign a transaction using the secure element, utilizing SKR
- do something with the built-in gyroscope/accelerometer or gps
- a lootbox or pachislot game aspect, using oxytocin loop or dopamine hits

And finally, a nice to have: something fun for the genesis NFT holders



# Game Play

## General Plan
sprite in foreground follows terrain loop video, obeying the laws of gravity and bouyancy
sprite movement is right to left, but follows the terrain below
movement is initiated with the phone accelerometer and gyroscope hardware
finger gestures add stunts or jumps when combined with tilt logic for move action

## Visual & Graphics Layer
The Seeker features a powerful GPU capable of high-fidelity rendering.

Enhanced Background: Use the new expo-video module. Unlike expo-av, it supports hardware-accelerated playback on Android 15, reducing CPU overhead during gameplay.

Character Layer: To enhance performance and responsiveness of the app, the rider/sprite should be a separate layer. Feel free to make suggestions here, such as ways to enhance the UX with React Three Fiber (R3F) in a 3D model, or other approaches like a Canvas-based approach for 2D. I'm not determined to use 3D if it's too much work.

## Sprite Movement Physics
These are suggestions and may be altered if you think they can be improved.

Tilt Logic & Calibration

To account for different user holding positions (e.g., lying down vs. sitting up), we implement a Neutral Offset variable. 

Suggested Physics Formula The final screen position $x_{pos}$ is calculated by:

    $$x_{pos} = x_{center} + ((a_x - a_{offset}) \cdot \sigma)$$
    
Where:
    $a_x$ is the raw X-axis data from the accelerometer.
    $a_{offset}$ is the value captured during the Calibration Step.
    $\sigma$ is the Sensitivity Multiplier (set as a constant or user-adjustable).

Not sure we need this, but suggested calibration procedure:
- Display a "Get Ready" overlay.
- User holds the device in their preferred neutral position.
- Capture $a_x$ and store it in a SharedValue or useRef.
- Subtract this offset from all subsequent sensor readings to normalize "Center."

Touch Interactivity

We need occasional swipes to complement tilt. This allows the player to quickly move the character or trigger a "Speed Boost" using a swipe.

One option for this would be to use React Native Gesture Handler for "Dashing."
Swipe Detection: Utilize a FlingGestureHandler or PanGesture with a velocity threshold ($\approx 800\text{ units/s}$) to distinguish between accidental touches and intentional dashes.

Input Priority: If a swipe is detected, it overrides the Tilt input for $300\text{ms}$ to ensure the dash feels responsive.

Layering in Expo
Here are a couple of suggestions to make the parallax effect visually interesting and smooth between the terrain and sprite assets:
- Background Layer: Use expo-video with isLooping set to true and resizeMode="cover" to fill the screen.
- Sprite Layer: Place the Sprite inside an Animated.View directly on top of the video.
- "Gliding" Effect: When the user tilts Left, rotate the sprite -15deg and move it translateX: -100. When the user tilts Right, rotate +15deg and move translateX: +100.

## Background
Using the implementation specific gameplay below, the terrain should loop smoothly for 20 seconds. the rider follows the terrain surface.


# Implementation Specific Iteration/Branch

## Implementation Specific Gameplay
Surfing game, with various obstacles to avoid while riding the wave. Eventually different levels will have increased difficulty but this iteration will have only one level, so we can focus on the core features: maneuvering, crashing, and dodging obstacles.

## Assets
Sprite Riding Sheet: /Users/ken/Downloads/surfer-riding.png 
Sprite Riding Sheet Map:
| tucked right | resting right  | shredding right  |
| tucked right | resting right  | shredding right  |
| tucked left  | resting left   | shredding left   |

Sprite Wipeouts: /Users/ken/Downloads/surfer-wipeout.png
Sprite Recovering: /Users/ken/Downloads/surfer-recovery.png

Terrain loop: /Users/ken/Downloads/Surfer_Sprite_and_Wave_Background.mp4
Terrain loop reference still image: /Users/ken/Downloads/surf-terrain-ref-image.png
Splash screen: "Neon Surfer"

## Implementation Specific Wireframes, Screenshots and Mockups
Let me know what details you require here.


# Layout Specs
Default style

# Color palette
Base on the palette in the implementation specific assets

## Typography
Default

# Credits
Gemini https://gemini.google.com/
<a href="https://www.freepik.com/free-psd/stunning-aqua-splash-captivating-burst-water-droplets_408654745.htm">Image by tohamina on Freepik</a>
SurfPics: https://x.com/surfgoldbeaches/status/2021343426965631143?s=20



