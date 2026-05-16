import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({
  visible,
  message = "Identifying your plant…",
}: LoadingOverlayProps) {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Pulse animation for the leaf emoji
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, pulseAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Animated.Text
          style={[styles.leafEmoji, { transform: [{ scale: pulseAnim }] }]}
        >
          🌿
        </Animated.Text>
        <ActivityIndicator
          animating
          size="large"
          color={theme.colors.primary}
          style={styles.spinner}
        />
        <Text variant="bodyLarge" style={[styles.message, { color: theme.colors.onSurface }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  card: {
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 48,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  leafEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    textAlign: "center",
  },
});
