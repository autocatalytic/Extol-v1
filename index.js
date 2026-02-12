// Polyfills MUST load before any @solana/* import
import "./src/polyfills";
import "react-native-gesture-handler";

import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);
