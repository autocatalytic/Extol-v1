# CLAUDE.md — Solana Seeker Android dApp

## Project Overview

This is a React Native / Expo Android application targeting the **Solana Seeker** phone (and compatible Android devices). It integrates with the **Solana Mobile Stack (SMS)** for wallet interactions, transaction signing, and on-chain operations via Mobile Wallet Adapter 2.0.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Expo | SDK 52+ (RN 0.76+) |
| Language | TypeScript | 5.x |
| Blockchain | Solana | mainnet-beta / devnet |
| Wallet Protocol | Mobile Wallet Adapter | 2.0 |
| Web3 SDK | @solana/web3.js | 1.x (legacy API, broad ecosystem compat) |
| Token SDK | @solana/spl-token | 0.4.x |
| Target Device | Solana Seeker | Android 15 (API 35) |
| Navigation library | expo-router or @react-navigation/native |  |
| Video playback | expo-video for SDK 52+ |  |
| Haptic Trigger Points | expo-haptics |  |
| Tilt to Movement | expo-sensors |  |
| Smooth 60FPS Movement | react-native-reanimated |   |
  
---

## Critical Constraints

- **No Expo Go.** MWA requires native Android intents. Always use custom dev builds (`npx expo run:android` or EAS Build).
- **Android only.** MWA does not work on iOS. The Solana Mobile Stack is Android-exclusive.
- **Use yarn, not npm.** There are known Metro resolution issues with npm and MWA dependencies.
- **Polyfills must load first.** `react-native-get-random-values` and `Buffer` global must be imported before any `@solana/*` package.
- **Never interact with Seed Vault directly.** dApps use MWA; the wallet app handles Seed Vault internally.

---

## Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/               # Custom React hooks
│   ├── useMobileWallet.ts    # MWA wallet interaction hook
│   ├── useAuthorization.ts   # Auth state management
│   ├── useConnection.ts      # RPC connection hook
│   └── useBalance.ts
├── services/            # Business logic / Solana operations
│   ├── solana.ts             # RPC connection setup
│   ├── transfer.ts           # SOL/token transfer logic
│   └── wallet.ts             # Wallet utilities
├── constants/           # App configuration, RPC endpoints
├── utils/               # Utility functions
└── styles/              # Shared styles/themes
index.js                 # Entry point (polyfills go here, BEFORE app import)
App.tsx                  # Root component
app.json                 # Expo config
metro.config.js          # Metro bundler config with polyfill resolvers
eas.json                 # EAS Build config
```

---

## Key Packages

### Core Solana Mobile
```
@solana-mobile/mobile-wallet-adapter-protocol       # Low-level MWA protocol
@solana-mobile/mobile-wallet-adapter-protocol-web3js # MWA with web3.js types (primary dApp SDK)
@solana-mobile/wallet-adapter-mobile                 # Optional: bridges MWA into @solana/wallet-adapter
```

### Solana
```
@solana/web3.js          # RPC, transactions, keypairs (use v1.x for MWA compat)
@solana/spl-token        # SPL token operations (v0.4.x, compat with web3.js v1)
```

### Polyfills (required)
```
react-native-get-random-values   # crypto.getRandomValues polyfill
buffer                           # Node Buffer polyfill
```

### Optional but common
```
@tanstack/react-query            # RPC response caching
@react-native-async-storage/async-storage  # Persist auth tokens
expo-secure-store                # Secure storage for sensitive data
expo-crypto                      # Alternative to react-native-get-random-values (SDK 49+)
```

---

## Polyfill Setup

The entry point (`index.js`) MUST import polyfills before anything else:

```javascript
// index.js — polyfills MUST be first
import "react-native-get-random-values";
import { Buffer } from "buffer";
global.Buffer = Buffer;

// Then import app
import "expo-router/entry";
```

For Expo SDK 49+, you can use `expo-crypto` instead:
```javascript
import { polyfillWebCrypto } from "expo-crypto";
polyfillWebCrypto();
```

### metro.config.js

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve("react-native-get-random-values"),
};

module.exports = config;
```

---

## Mobile Wallet Adapter 2.0 Patterns

### Core API: `transact()`

All wallet interactions happen inside a `transact()` callback that opens an encrypted session:

```typescript
import { transact, Web3MobileWallet } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";

const APP_IDENTITY = {
  name: "My dApp",
  uri: "https://mydapp.com",
  icon: "favicon.ico",
};

const result = await transact(async (wallet: Web3MobileWallet) => {
  const auth = await wallet.authorize({
    chain: "solana:mainnet-beta",
    identity: APP_IDENTITY,
  });
  // Use auth.accounts[0].address as the connected wallet
  // Use auth.auth_token for future sessions
  return auth;
});
```

### MWA 2.0 Key Rules

- **`signAndSendTransactions` is mandatory** — wallets must implement it. Prefer it over `signTransactions`.
- **`signTransactions` is deprecated** — still available but not guaranteed.
- **`reauthorize()` is removed** — pass stored `auth_token` to `authorize()` instead.
- **Keep sessions short** — do transaction building outside `transact()`, only sign inside it.
- **Check capabilities** — call `wallet.getCapabilities()` to check `max_transactions_per_request` before batching.
- **Handle disconnects** — wrap `transact()` in try/catch; WebSocket sessions can drop if user backgrounds the wallet app.

### Persisting Auth (skip re-approval on return visits)

```typescript
// Store after first auth
await AsyncStorage.setItem("mwa_auth_token", authResult.auth_token);

// Reuse on subsequent sessions
const storedToken = await AsyncStorage.getItem("mwa_auth_token");
await transact(async (wallet) => {
  await wallet.authorize({
    chain: "solana:devnet",
    identity: APP_IDENTITY,
    auth_token: storedToken ?? undefined,
  });
});
```

### Sign In With Solana (SIWS)

```typescript
const signInPayload = {
  domain: "mydapp.com",
  statement: "Sign in to My dApp",
  uri: "https://mydapp.com",
};

const result = await transact(async (wallet) => {
  return wallet.authorize({
    chain: "solana:mainnet-beta",
    identity: APP_IDENTITY,
    sign_in_payload: signInPayload,
  });
});
// Verify result.sign_in_result server-side
```

---

## Solana Development Guidelines

### RPC Connection

```typescript
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
// For production: use a dedicated RPC provider (Helius, QuickNode, Triton, etc.)
```

### Transaction Building

- Use `VersionedTransaction` with `TransactionMessage` for v0 transactions (preferred).
- Always fetch a recent blockhash immediately before signing.
- Set appropriate compute units with `ComputeBudgetProgram` for complex transactions.
- Use `connection.confirmTransaction()` with the signature and blockhash context for reliable confirmation.

### Token Operations

```typescript
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token";
```

- Always use Associated Token Accounts (ATAs).
- Check if the recipient ATA exists before transferring; create it if needed.
- For Token-2022 extensions, use the `TOKEN_2022_PROGRAM_ID`.

### Error Handling

- `SendTransactionError` — inspect `.logs` for program error details.
- `TokenAccountNotFoundError` — ATA doesn't exist; create it first.
- MWA session errors — catch at the `transact()` level, provide user-friendly recovery UI.

---

## Solana Seeker Device Notes

### Hardware Context
- **Processor:** MediaTek Dimensity 7300 (octa-core, mid-range)
- **RAM:** 8 GB — be mindful of memory with large transaction batches
- **OS:** Android 15 (API 35)
- **Seed Vault:** TEE-backed secure key storage with biometric access (double-tap to sign)

### TEEPIN Architecture
The Seeker uses a three-layer trust architecture:
1. **Hardware Layer:** Cryptographic proofs for system integrity
2. **Platform Layer:** On-chain registry for OS version validation
3. **Network Layer:** Decentralized audit trail via Guardians

### dApp Store Publishing
- Build a release APK signed with a **dedicated signing key** (Google Play keys are rejected)
- Create App NFT and Release NFT on-chain
- Submit through the Solana dApp Publisher Portal
- Review: 2-3 days for new submissions, ~1 day for updates
- Can be automated via CI/CD with the Publishing CLI tool

### Seeker Genesis Token
- Soulbound NFT auto-assigned to each device
- Acts as verification credential for ecosystem rewards and airdrops
- Check for its presence to gate Seeker-exclusive features

---

## Build & Run Commands

```bash
# Install dependencies (use yarn)
yarn install

# Start dev server with custom dev client
npx expo start --dev-client

# Build and run on Android device/emulator
npx expo run:android

# Prebuild native project (for inspection/customization)
npx expo prebuild

# EAS Build (cloud)
eas build --profile development --platform android

# Production APK
eas build --profile production --platform android
```

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Using Expo Go | Use `npx expo run:android` or EAS dev builds |
| Missing polyfills | Import `react-native-get-random-values` + `Buffer` before any Solana import |
| Using npm instead of yarn | Switch to yarn for Metro resolution compatibility |
| Calling deprecated `reauthorize()` | Pass `auth_token` to `authorize()` instead |
| Batching too many transactions | Check `wallet.getCapabilities().max_transactions_per_request` first |
| Signing with Google Play key for dApp Store | Use a separate dedicated signing key |
| Trying MWA on iOS | MWA is Android-only; iOS requires browser wallet extensions or deeplinks |
| Using `@solana/web3.js` v2 / `@solana/kit` with MWA | MWA protocol-web3js expects v1.x types; stick with v1 for wallet interactions |

---

## Useful References

- [Solana Mobile Docs](https://docs.solanamobile.com/)
- [MWA 2.0 Spec](https://solana-mobile.github.io/mobile-wallet-adapter/spec/spec.html)
- [Expo dApp Template](https://github.com/solana-mobile/solana-mobile-expo-template)
- [Solana Mobile Stack SDK](https://github.com/solana-mobile/solana-mobile-stack-sdk)
- [dApp Store Publishing](https://docs.solanamobile.com/dapp-publishing/overview)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token Docs](https://spl.solana.com/token)
