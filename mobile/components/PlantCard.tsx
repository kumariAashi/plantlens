import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import InfoChip from "./InfoChip";

interface PlantCardProps {
  icon: string;
  title: string;
  description: string;
  chipLabel?: string;
  chipVariant?: "default" | "success" | "danger" | "info";
}

export default function PlantCard({
  icon,
  title,
  description,
  chipLabel,
  chipVariant = "default",
}: PlantCardProps) {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
      <Card.Content style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            numberOfLines={3}
          >
            {description}
          </Text>
          {chipLabel && (
            <View style={styles.chipRow}>
              <InfoChip label={chipLabel} variant={chipVariant} />
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
});
