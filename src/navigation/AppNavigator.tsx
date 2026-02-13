import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import GameScreen from "../screens/GameScreen";
import DrawerContent from "./DrawerContent";
import { Colors } from "../constants/theme";

const Drawer = createDrawerNavigator();

export default function AppNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: Colors.background, width: 280 },
        sceneStyle: { backgroundColor: Colors.background },
      }}
    >
      <Drawer.Screen
        name="Game"
        component={GameScreen}
        options={{ swipeEnabled: false }}
      />
    </Drawer.Navigator>
  );
}
