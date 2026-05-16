import React from "react";
import { StyleSheet } from "react-native";
import { Chip, useTheme } from "react-native-paper";

interface InfoChipProps {
  label: string;
  icon?: string;
  variant?: "default" | "success" | "danger" | "info";
  onPress?: () => void;
}

export default function InfoChip({
  label,
  icon,
  variant = "default",
  onPress,
}: InfoChipProps) {
  const theme = useTheme();

  const chipColors = {
    default: {
      bg: theme.colors.secondaryContainer,
      text: theme.colors.onSecondaryContainer,
    },
    success: {
      bg: "#C8E6C9",
      text: "#1B5E20",
    },
    danger: {
      bg: "#FFCDD2",
      text: "#B71C1C",
    },
    info: {
      bg: "#BBDEFB",
      text: "#0D47A1",
    },
  };

  const colors = chipColors[variant];

  return (
    <Chip
      icon={icon}
      mode="flat"
      style={[styles.chip, { backgroundColor: colors.bg }]}
      textStyle={[styles.text, { color: colors.text }]}
      onPress={onPress}
      compact
    >
      {label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
});
