import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { TERRAIN_VIDEO } from "../assets";

interface Props {
  playing: boolean;
}

export default function TerrainVideo({ playing }: Props) {
  const player = useVideoPlayer(TERRAIN_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (playing) {
      player.play();
    } else {
      player.pause();
    }
  }, [playing, player]);

  return (
    <VideoView
      player={player}
      style={styles.video}
      nativeControls={false}
      contentFit="cover"
    />
  );
}

const styles = StyleSheet.create({
  video: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});
