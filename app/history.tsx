import React, { useCallback } from "react";
import { View, StyleSheet, FlatList, Image } from "react-native";
import { Appbar, Text, TouchableRipple, IconButton, Divider, useTheme } from "react-native-paper";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHistory } from "../hooks/useHistory";
import type { ScanRecord } from "../types";

export default function HistoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { history, loading, refresh, removeItem } = useHistory();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const renderItem = ({ item }: { item: ScanRecord }) => (
    <TouchableRipple
      onPress={() =>
        router.push({
          pathname: "/result",
          params: {
            imageUri: item.imageUri,
            results: JSON.stringify([{
              commonName: item.commonName, scientificName: item.scientificName,
              confidence: item.confidence, family: item.family,
            }]),
            careInfo: JSON.stringify({
              watering: item.watering, sunlight: item.sunlight,
              poisonous: item.poisonous, description: item.description,
            }),
            ayurvedicData: JSON.stringify(
              item.medicinalUses ? {
                localNames: item.localNames, medicinalUses: item.medicinalUses,
                ayurvedicBenefits: item.ayurvedicBenefits, doshaEffect: item.doshaEffect,
                partUsed: item.partUsed,
              } : null
            ),
          },
        })
      }
      rippleColor={theme.colors.primaryContainer}
      style={styles.itemContainer}
    >
      <View style={styles.itemRow}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbPlaceholder, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={{ fontSize: 24 }}>🌿</Text>
          </View>
        )}
        <View style={styles.itemText}>
          <Text variant="titleMedium" style={{ fontWeight: "700", color: theme.colors.onSurface }} numberOfLines={1}>
            {item.commonName}
          </Text>
          <Text variant="bodySmall" style={{ fontStyle: "italic", color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
            {item.scientificName}
          </Text>
          {item.localNames?.hindi && (
            <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: "600" }}>
              {item.localNames.hindi}
            </Text>
          )}
          <Text variant="labelSmall" style={{ color: theme.colors.outline, marginTop: 2 }}>
            {formatDate(item.scannedAt)} · {item.confidence}% match
          </Text>
        </View>
        <IconButton icon="delete-outline" size={20} iconColor={theme.colors.outline}
          onPress={() => removeItem(item.id)} />
      </View>
    </TouchableRipple>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }} elevated={false}>
        <Appbar.BackAction onPress={() => router.back()} iconColor={theme.colors.primary} />
        <Appbar.Content title="My Plants 🕘" titleStyle={{ fontWeight: "800", color: theme.colors.primary }} />
      </Appbar.Header>
      {history.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 64 }}>🌱</Text>
          <Text variant="titleMedium" style={{ fontWeight: "700", color: theme.colors.onSurface, marginTop: 12 }}>
            No plants yet
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center", paddingHorizontal: 40 }}>
            Go explore! Scan or upload a plant photo to start building your collection.
          </Text>
        </View>
      ) : (
        <FlatList data={history} keyExtractor={(item) => item.id} renderItem={renderItem}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          showsVerticalScrollIndicator={false} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  itemContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  itemRow: { flexDirection: "row", alignItems: "center" },
  thumbnail: { width: 56, height: 56, borderRadius: 14, marginRight: 14 },
  thumbPlaceholder: { width: 56, height: 56, borderRadius: 14, marginRight: 14, justifyContent: "center", alignItems: "center" },
  itemText: { flex: 1 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
});
