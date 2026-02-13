import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getConnection } from "../services/solana";

const APP_IDENTITY = {
  name: "Tahitian Tube",
  uri: "https://extol.app",
  icon: "favicon.ico",
};

const AUTH_TOKEN_KEY = "mwa_auth_token";

interface WalletContextValue {
  connected: boolean;
  address: string | null;
  skrBalance: string | null;
  solBalance: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue>({
  connected: false,
  address: null,
  skrBalance: null,
  solBalance: null,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
  refreshBalance: async () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [skrBalance, setSkrBalance] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connected = address !== null;

  const fetchBalances = useCallback(async (walletAddress: string) => {
    try {
      const connection = getConnection();
      const pubkey = new PublicKey(walletAddress);

      // Fetch SOL balance
      const lamports = await connection.getBalance(pubkey);
      setSolBalance((lamports / LAMPORTS_PER_SOL).toFixed(4));

      // Fetch SKR token balance by mint (works across Token and Token-2022)
      const SKR_MINT = new PublicKey("SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3");

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
          mint: SKR_MINT,
        });

        let totalSkr = 0;
        for (const { account } of tokenAccounts.value) {
          const amount = account.data.parsed?.info?.tokenAmount?.uiAmount;
          if (amount) totalSkr += amount;
        }

        setSkrBalance(totalSkr > 0 ? totalSkr.toString() : "0");
      } catch {
        setSkrBalance("0");
      }
    } catch (err) {
      console.warn("Balance fetch failed:", err);
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (address) await fetchBalances(address);
  }, [address, fetchBalances]);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      const result = await transact(async (wallet: Web3MobileWallet) => {
        const auth = await wallet.authorize({
          chain: "solana:mainnet",
          identity: APP_IDENTITY,
          auth_token: storedToken ?? undefined,
        });
        return auth;
      });

      // MWA 2.0 returns address as base64 — decode to bytes for PublicKey
      const rawAddress = result.accounts[0].address;
      const addressBytes =
        typeof rawAddress === "string"
          ? Buffer.from(rawAddress, "base64")
          : rawAddress;
      const walletAddress = new PublicKey(addressBytes).toBase58();
      setAddress(walletAddress);

      if (result.auth_token) {
        setAuthToken(result.auth_token);
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.auth_token);
      }

      // Fetch balances after successful connect
      await fetchBalances(walletAddress);
    } catch (err) {
      console.warn("Wallet connect failed:", err);
    } finally {
      setConnecting(false);
    }
  }, [fetchBalances]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setAuthToken(null);
    setSkrBalance(null);
    setSolBalance(null);
    AsyncStorage.removeItem(AUTH_TOKEN_KEY).catch(() => {});
  }, []);

  const value: WalletContextValue = {
    connected,
    address,
    skrBalance,
    solBalance,
    connecting,
    connect,
    disconnect,
    refreshBalance,
  };

  return React.createElement(WalletContext.Provider, { value }, children);
}

export function useMobileWallet() {
  return useContext(WalletContext);
}
