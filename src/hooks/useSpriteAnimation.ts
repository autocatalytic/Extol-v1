import { useState, useEffect, useRef } from "react";
import { GameState } from "./useGameLoop";
import { SpriteSheet } from "../components/Sprite";
import { getRidingFrame, WIPEOUT_SHEET_SIZE, RECOVERY_SHEET_SIZE } from "../assets";

interface SpriteState {
  sheet: SpriteSheet;
  frame: { row: number; col: number };
}

export function useSpriteAnimation(gameState: GameState): SpriteState {
  const [sheet, setSheet] = useState<SpriteSheet>("riding");
  const [frame, setFrame] = useState({ row: 0, col: 1 }); // resting right
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    switch (gameState) {
      case "idle":
      case "countdown":
        setSheet("riding");
        setFrame(getRidingFrame("resting", "right"));
        break;

      case "playing":
        setSheet("riding");
        // Cycle between resting and shredding for visual interest
        let toggle = false;
        setFrame(getRidingFrame("resting", "right"));
        intervalRef.current = setInterval(() => {
          toggle = !toggle;
          setFrame(getRidingFrame(toggle ? "shredding" : "resting", "right"));
        }, 800);
        break;

      case "wiping_out":
        setSheet("wipeout");
        setFrame({
          row: Math.floor(Math.random() * WIPEOUT_SHEET_SIZE.rows),
          col: 0,
        });
        break;

      case "recovering":
        setSheet("recovery");
        setFrame({
          row: Math.floor(Math.random() * RECOVERY_SHEET_SIZE.rows),
          col: Math.floor(Math.random() * RECOVERY_SHEET_SIZE.cols),
        });
        break;

      case "finished":
        setSheet("riding");
        setFrame(getRidingFrame("shredding", "right"));
        break;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameState]);

  return { sheet, frame };
}
