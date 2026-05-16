import React from "react";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppTheme } from "../constants/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={AppTheme}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            contentStyle: { backgroundColor: AppTheme.colors.background },
          }}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
