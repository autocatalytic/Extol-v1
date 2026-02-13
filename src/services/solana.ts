import { Connection, clusterApiUrl } from "@solana/web3.js";

// Use devnet for development; switch to mainnet-beta or a dedicated RPC for production
const CLUSTER = "mainnet-beta" as const;

let connectionInstance: Connection | null = null;

export function getConnection(): Connection {
  if (!connectionInstance) {
    connectionInstance = new Connection(clusterApiUrl(CLUSTER), "confirmed");
  }
  return connectionInstance;
}
