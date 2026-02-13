import React, { createContext, useContext, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ScoreContextValue {
  runScore: number;
  totalScore: number;
  addPoints: (pts: number) => void;
  commitRun: () => void;
  resetAll: () => void;
  loadScore: (walletAddress: string | null) => void;
}

const ScoreContext = createContext<ScoreContextValue | null>(null);

const SCORE_KEY_PREFIX = "extol_score_";

export function ScoreProvider({ children }: { children: React.ReactNode }) {
  const [runScore, setRunScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [walletKey, setWalletKey] = useState<string | null>(null);

  const addPoints = useCallback((pts: number) => {
    setRunScore((prev) => prev + pts);
  }, []);

  const commitRun = useCallback(() => {
    if (walletKey) {
      // Wallet connected — accumulate and persist
      setTotalScore((prev) => {
        const next = prev + runScore;
        AsyncStorage.setItem(SCORE_KEY_PREFIX + walletKey, String(next)).catch(() => {});
        return next;
      });
    }
    // Always reset run score for next play
    setRunScore(0);
  }, [runScore, walletKey]);

  const resetAll = useCallback(() => {
    setRunScore(0);
    setTotalScore(0);
  }, []);

  const loadScore = useCallback(async (address: string | null) => {
    setWalletKey(address);
    if (address) {
      const stored = await AsyncStorage.getItem(SCORE_KEY_PREFIX + address).catch(() => null);
      if (stored) setTotalScore(parseInt(stored, 10) || 0);
    } else {
      setTotalScore(0);
    }
    setRunScore(0);
  }, []);

  const value: ScoreContextValue = {
    runScore,
    totalScore,
    addPoints,
    commitRun,
    resetAll,
    loadScore,
  };

  return React.createElement(ScoreContext.Provider, { value }, children);
}

export function useScore() {
  const ctx = useContext(ScoreContext);
  if (!ctx) throw new Error("useScore must be used within ScoreProvider");
  return ctx;
}
