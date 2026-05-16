import { MD3LightTheme } from "react-native-paper";

export const AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2E7D32",
    onPrimary: "#FFFFFF",
    primaryContainer: "#C8E6C9",
    onPrimaryContainer: "#1B5E20",
    secondary: "#A5D6A7",
    onSecondary: "#1B5E20",
    secondaryContainer: "#E8F5E9",
    onSecondaryContainer: "#2E7D32",
    tertiary: "#66BB6A",
    background: "#F1F8F1",
    onBackground: "#1C1B1F",
    surface: "#FFFFFF",
    onSurface: "#1C1B1F",
    surfaceVariant: "#E8F5E9",
    onSurfaceVariant: "#49454F",
    error: "#D32F2F",
    onError: "#FFFFFF",
    errorContainer: "#FFCDD2",
    outline: "#79747E",
    elevation: {
      level0: "transparent",
      level1: "#F5FAF5",
      level2: "#EDF7ED",
      level3: "#E8F5E9",
      level4: "#E0F2E0",
      level5: "#D8EED8",
    },
  },
  roundness: 12,
};

export type AppThemeType = typeof AppTheme;
