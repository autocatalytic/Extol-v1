# Tahitian Tube Core Design Spec

## App overview
MVP for an android application that will allow users to take advantage of a subset of Solana Seeker device features. It's a surfer game, with points gained by staying on the board. Users get max points by making it to the support boats, which is tied to the end of the primary gameplay video, below. Points are granted by time spent riding.

### User Experience
The splash screen below should load when the app is loading, then cut to the homescreen when the app is ready. It is only 3 seconds and we can modify this as we iterate.

Upon app load, users arrive at the main screen, with a button saying Play. The hamburger button in the top left will also be displayed (see below).

Eventually there will be multiple onboarding paths, but the current version will only have one: the primary gameplay window. 

Primary gameplay will have the following behavior: 
- Primary gameplay video will display
- Overlaid in the top right corner will be a points tracker, accumulating quickly with a scroll wheel visual. 
- In v.0, this version, points accumulate simply by watching the video until the end
- At conclusion of the video the splash graphic will overlay the points tracker, and the video will have the words "Beauty" in huge font overlaid. 
- After 3 seconds the word "Beauty" disappears and is followed by two buttons stacked above one another. The top one will have text "Ride Again?", and the lower one "Exit"
- "Ride Again" will run the process again, adding on to points from the prior session.
- "Exit" will take us to the main screen

Score and Points
- points should persist across sessions for logged in users (see below).
- users not logged in will restart with zero points on replay

There will also be a hamburger button in the top left which opens a menu. The only option in this version is a button to the connect wallet feature. We built this last time.
- users that connect their wallet will be "logged in".


### Seeker and Solana Mobile Stack Attributes to Features
I don't have a business model yet. My app goals are above and rather than spend a lot of time thinking through how I can make money my main goals are to utilize interesting aspects of Seeker. These are not in order.

- sign a transaction using the secure element, utilizing SKR
- do something with the built-in gyroscope/accelerometer or gps
- a lootbox or pachislot game aspect, using oxytocin loop or dopamine hits

And finally, a nice to have: something fun for the genesis NFT holders


## Wireframes, Screenshots and Mockups
Points splash (psd and jpg format): /Users/ken/Desktop/0f70dcca-fd60-4977-891c-10b23c5df8e8 
Main Screen: /Users/ken/Desktop/Gemini_Generated_Image_ux31yiux31yiux31.png
Surf splash screen: /Users/ken/Desktop/Tahitian-splashScreen.mov
Primary gameplay video: /Users/ken/Desktop/tahitian-tube.mov

## Layout Specs
Default style

## Color palette
Based on the palette in the uploaded tahitian-tube video

## Typography
Default

## Assets List
See links in the "Wireframes, Screenshots and Mockups" section above.


# Credits
Gemini https://gemini.google.com/
<a href="https://www.freepik.com/free-psd/stunning-aqua-splash-captivating-burst-water-droplets_408654745.htm">Image by tohamina on Freepik</a>
SurfPics: https://x.com/surfgoldbeaches/status/2021343426965631143?s=20



