import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image, Animated, Easing } from "react-native";
import { Appbar, Text, Button, Snackbar, Surface, Chip, Divider, Card, useTheme } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";
import InfoChip from "../components/InfoChip";
import { saveToHistory } from "../services/storageService";
import type { PlantResult, CareInfo, AyurvedicData, ScanRecord } from "../types";

export default function ResultScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ imageUri: string; results: string; careInfo: string; ayurvedicData: string }>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const results: PlantResult[] = useMemo(() => {
    try { return JSON.parse(params.results ?? "[]"); } catch { return []; }
  }, [params.results]);
  const careInfo: CareInfo | null = useMemo(() => {
    try { return JSON.parse(params.careInfo ?? "null"); } catch { return null; }
  }, [params.careInfo]);
  const ayuData: AyurvedicData | null = useMemo(() => {
    try { return JSON.parse(params.ayurvedicData ?? "null"); } catch { return null; }
  }, [params.ayurvedicData]);

  const plant = results[selectedIndex];

  if (!plant) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Result" />
        </Appbar.Header>
        <View style={styles.empty}>
          <Text style={{ fontSize: 56 }}>🤔</Text>
          <Text variant="titleMedium">No results found</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Try a clearer image.</Text>
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    try {
      const record: ScanRecord = {
        id: uuidv4(), imageUri: params.imageUri ?? "",
        commonName: plant.commonName, scientificName: plant.scientificName,
        confidence: plant.confidence, family: plant.family,
        watering: careInfo?.watering ?? "N/A", sunlight: careInfo?.sunlight ?? "N/A",
        poisonous: careInfo?.poisonous ?? false, description: careInfo?.description ?? "",
        scannedAt: new Date().toISOString(),
        localNames: ayuData?.localNames, medicinalUses: ayuData?.medicinalUses,
        ayurvedicBenefits: ayuData?.ayurvedicBenefits, doshaEffect: ayuData?.doshaEffect,
        partUsed: ayuData?.partUsed,
      };
      await saveToHistory(record);
      setSaved(true);
      setSnackMessage("Plant saved to history! 🌿");
      setSnackVisible(true);
    } catch {
      setSnackMessage("Failed to save.");
      setSnackVisible(true);
    }
  };

  const localName = ayuData?.localNames?.hindi ?? ayuData?.localNames?.sanskrit ?? null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: "transparent" }} elevated={false}>
        <Appbar.BackAction onPress={() => router.back()} iconColor={theme.colors.primary} />
        <Appbar.Content title="Plant Identified" titleStyle={{ fontWeight: "700" }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {/* Plant Image */}
        {params.imageUri && (
          <Surface style={styles.imgCard} elevation={3}>
            <Image source={{ uri: params.imageUri }} style={styles.img} resizeMode="cover" />
          </Surface>
        )}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* ── Name Section ── */}
          <View style={styles.nameSection}>
            <Text variant="headlineSmall" style={{ fontWeight: "800", letterSpacing: -0.5 }}>
              {plant.commonName}
            </Text>
            <Text variant="bodyLarge" style={{ fontStyle: "italic", color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
              {plant.scientificName}
            </Text>
            {localName && (
              <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: "600", marginTop: 4 }}>
                🏷️ {localName}
                {ayuData?.localNames?.sanskrit && ayuData.localNames.sanskrit !== localName
                  ? `  (Sanskrit: ${ayuData.localNames.sanskrit})`
                  : ""}
              </Text>
            )}
            <View style={styles.chipRow}>
              <InfoChip label={`${plant.confidence}% match`} variant={plant.confidence >= 60 ? "success" : "info"} icon="check-circle" />
              <InfoChip label={plant.family} variant="default" icon="leaf" />
              {ayuData?.doshaEffect && <InfoChip label={ayuData.doshaEffect} variant="info" icon="spa" />}
            </View>
          </View>

          {/* Multiple results selector */}
          {results.length > 1 && (
            <View style={{ marginBottom: 8 }}>
              <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>Other matches:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {results.map((r, i) => (
                  <Chip key={i} selected={i === selectedIndex} onPress={() => setSelectedIndex(i)}
                    style={[styles.rChip, i === selectedIndex && { backgroundColor: theme.colors.primaryContainer }]}
                    textStyle={{ color: i === selectedIndex ? theme.colors.primary : theme.colors.onSurfaceVariant, fontWeight: i === selectedIndex ? "700" : "400" }}>
                    {r.commonName} ({r.confidence}%)
                  </Chip>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Ayurvedic Benefits ── */}
          {ayuData && ayuData.ayurvedicBenefits.length > 0 && (
            <>
              <Divider style={{ marginVertical: 12 }} />
              <Card style={[styles.sectionCard, { backgroundColor: "#FFF8E1" }]} mode="contained">
                <Card.Content>
                  <Text variant="titleMedium" style={{ fontWeight: "700", color: "#F57F17", marginBottom: 10 }}>
                    🙏 Ayurvedic Benefits
                  </Text>
                  {ayuData.ayurvedicBenefits.map((b, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text variant="bodyMedium" style={{ flex: 1, color: "#4E342E" }}>{b}</Text>
                    </View>
                  ))}
                  {ayuData.partUsed && (
                    <Text variant="labelMedium" style={{ color: "#795548", marginTop: 8 }}>
                      🌱 Part used: {ayuData.partUsed}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            </>
          )}

          {/* ── Medicinal Uses ── */}
          {ayuData && ayuData.medicinalUses.length > 0 && (
            <Card style={[styles.sectionCard, { backgroundColor: "#E8F5E9" }]} mode="contained">
              <Card.Content>
                <Text variant="titleMedium" style={{ fontWeight: "700", color: "#2E7D32", marginBottom: 10 }}>
                  💊 Medicinal Uses
                </Text>
                {ayuData.medicinalUses.map((u, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text variant="bodyMedium" style={{ flex: 1, color: "#1B5E20" }}>{u}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* ── No Ayurvedic Data fallback ── */}
          {!ayuData && (
            <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surfaceVariant }]} mode="contained">
              <Card.Content>
                <Text variant="titleMedium" style={{ fontWeight: "700", marginBottom: 8 }}>
                  🌿 Ayurvedic Info
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Ayurvedic data is not available for this plant in our database yet.
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* ── Plant Care ── */}
          <Divider style={{ marginVertical: 12 }} />
          <Text variant="titleMedium" style={{ fontWeight: "700", marginBottom: 10 }}>🪴 Plant Care</Text>

          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
            <Card.Content>
              <View style={styles.careRow}>
                <Text style={{ fontSize: 22 }}>💧</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="labelLarge" style={{ fontWeight: "700" }}>Watering</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{careInfo?.watering ?? "Not available"}</Text>
                </View>
              </View>
              <Divider style={{ marginVertical: 10 }} />
              <View style={styles.careRow}>
                <Text style={{ fontSize: 22 }}>☀️</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="labelLarge" style={{ fontWeight: "700" }}>Sunlight</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{careInfo?.sunlight ?? "Not available"}</Text>
                </View>
              </View>
              <Divider style={{ marginVertical: 10 }} />
              <View style={styles.careRow}>
                <Text style={{ fontSize: 22 }}>{careInfo?.poisonous ? "⚠️" : "✅"}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="labelLarge" style={{ fontWeight: "700" }}>Toxicity</Text>
                  <InfoChip label={careInfo?.poisonous ? "Toxic" : "Safe"} variant={careInfo?.poisonous ? "danger" : "success"} />
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Save Button */}
          <Button mode="contained" icon={saved ? "check" : "content-save"}
            style={[styles.saveBtn, { backgroundColor: saved ? theme.colors.secondary : theme.colors.primary }]}
            contentStyle={{ height: 52 }}
            labelStyle={{ color: saved ? theme.colors.onSecondary : theme.colors.onPrimary, fontWeight: "700", fontSize: 16 }}
            onPress={handleSave} disabled={saved}>
            {saved ? "Saved to History" : "Save to History"}
          </Button>
        </Animated.View>
      </ScrollView>
      <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)} duration={2500}
        style={{ backgroundColor: theme.colors.primaryContainer }}>
        <Text style={{ color: theme.colors.onPrimaryContainer }}>{snackMessage}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  imgCard: { borderRadius: 20, overflow: "hidden", marginBottom: 20, elevation: 4 },
  img: { width: "100%", height: 260, borderRadius: 20 },
  nameSection: { marginBottom: 16 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10, gap: 4 },
  rChip: { marginRight: 8, borderRadius: 20 },
  sectionCard: { borderRadius: 16, marginBottom: 12 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  bullet: { fontSize: 16, marginRight: 8, marginTop: 1 },
  careRow: { flexDirection: "row", alignItems: "center" },
  saveBtn: { borderRadius: 16, marginTop: 12, elevation: 3 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
});
