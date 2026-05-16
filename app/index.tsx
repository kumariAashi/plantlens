import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Platform,
  Alert,
} from "react-native";
import {
  Appbar,
  Text,
  FAB,
  Button,
  Snackbar,
  Surface,
  useTheme,
  IconButton,
} from "react-native-paper";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import ImagePreview from "../components/ImagePreview";
import LoadingOverlay from "../components/LoadingOverlay";
import { usePlantIdentify } from "../hooks/usePlantIdentify";

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { loading, identify, error, reset } = usePlantIdentify();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [snackMessage, setSnackMessage] = useState("");
  const [snackVisible, setSnackVisible] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Animations
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
        delay: 300,
      }),
    ]).start();
  }, [heroFade, heroSlide, buttonScale]);

  const showError = (msg: string) => {
    setSnackMessage(msg);
    setSnackVisible(true);
  };

  const resizeImage = async (uri: string): Promise<string> => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch {
      return uri;
    }
  };

  const handleOpenCamera = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        showError("Camera permission is required to scan plants.");
        return;
      }
    }
    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      if (photo?.uri) {
        setShowCamera(false);
        const resized = await resizeImage(photo.uri);
        setSelectedImage(resized);
      }
    } catch {
      showError("Failed to capture photo. Please try again.");
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const resized = await resizeImage(result.assets[0].uri);
        setSelectedImage(resized);
      }
    } catch {
      showError("Failed to pick image. Please try again.");
    }
  };

  const handleIdentify = async () => {
    if (!selectedImage) {
      showError("Please select or capture a plant image first.");
      return;
    }

    try {
      const { results, careInfo, ayurvedicData } = await identify(selectedImage);

      if (results && results.length > 0) {
        router.push({
          pathname: "/result",
          params: {
            imageUri: selectedImage,
            results: JSON.stringify(results),
            careInfo: JSON.stringify(careInfo),
            ayurvedicData: JSON.stringify(ayurvedicData),
          },
        });
      }
    } catch (err: any) {
      showError(err?.message ?? "Identification failed. Please try again.");
    }
  };

  // Camera view
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />
        <View style={[styles.cameraOverlay, { paddingTop: insets.top }]}>
          <IconButton
            icon="close"
            iconColor="#fff"
            size={28}
            style={styles.cameraCloseBtn}
            onPress={() => setShowCamera(false)}
          />
          <View style={styles.cameraBottomBar}>
            <FAB
              icon="camera"
              size="large"
              style={[styles.captureBtn, { backgroundColor: theme.colors.primary }]}
              color="#fff"
              onPress={handleCapture}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* App Bar */}
      <Appbar.Header
        style={{ backgroundColor: theme.colors.background }}
        elevated={false}
      >
        <Appbar.Content
          title="PlantLens 🌿"
          titleStyle={[styles.appBarTitle, { color: theme.colors.primary }]}
        />
        <Appbar.Action
          icon="history"
          onPress={() => router.push("/history")}
          iconColor={theme.colors.primary}
        />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: heroFade,
              transform: [{ translateY: heroSlide }],
            },
          ]}
        >
          <View style={[styles.heroIllustration, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={styles.heroEmoji}>🌱</Text>
          </View>
          <Text
            variant="headlineMedium"
            style={[styles.heroTitle, { color: theme.colors.onBackground }]}
          >
            Discover Plants
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.heroTagline, { color: theme.colors.onSurfaceVariant }]}
          >
            Point. Snap. Identify.
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.heroDesc, { color: theme.colors.onSurfaceVariant }]}
          >
            Take a photo or upload an image to instantly identify any plant and
            learn about its care needs.
          </Text>
        </Animated.View>

        {/* Image Preview */}
        {selectedImage && (
          <Surface style={styles.previewSurface} elevation={2}>
            <ImagePreview
              imageUri={selectedImage}
              onRemove={() => {
                setSelectedImage(null);
                reset();
              }}
              height={240}
              borderRadius={16}
            />
          </Surface>
        )}

        {/* Action Buttons */}
        <Animated.View
          style={[styles.buttonsContainer, { transform: [{ scale: buttonScale }] }]}
        >
          <FAB
            icon="camera"
            label="Scan Plant"
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            color={theme.colors.onPrimary}
            onPress={handleOpenCamera}
          />

          <Button
            mode="outlined"
            icon="image-multiple"
            style={styles.uploadBtn}
            contentStyle={styles.uploadBtnContent}
            labelStyle={{ color: theme.colors.primary }}
            onPress={handlePickImage}
          >
            Upload Image
          </Button>

          {selectedImage && (
            <Button
              mode="contained"
              icon="magnify"
              style={[styles.identifyBtn, { backgroundColor: theme.colors.primary }]}
              contentStyle={styles.identifyBtnContent}
              labelStyle={{ color: theme.colors.onPrimary, fontWeight: "700" }}
              onPress={handleIdentify}
              loading={loading}
              disabled={loading}
            >
              Identify Plant
            </Button>
          )}
        </Animated.View>

        {/* Quick Tips */}
        <Surface style={[styles.tipsCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleSmall" style={[styles.tipsTitle, { color: theme.colors.primary }]}>
            📸 Tips for best results
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            • Get close to the leaf or flower{"\n"}
            • Ensure good lighting{"\n"}
            • Avoid blurry images{"\n"}
            • Focus on a single plant
          </Text>
        </Surface>
      </ScrollView>

      {/* Loading Overlay */}
      <LoadingOverlay visible={loading} />

      {/* Snackbar */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3500}
        action={{
          label: "OK",
          onPress: () => setSnackVisible(false),
        }}
        style={{ backgroundColor: theme.colors.error }}
      >
        {snackMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  heroIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heroEmoji: {
    fontSize: 56,
  },
  heroTitle: {
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroTagline: {
    fontWeight: "600",
    marginBottom: 8,
  },
  heroDesc: {
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  previewSurface: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  fab: {
    borderRadius: 16,
    elevation: 4,
  },
  uploadBtn: {
    borderRadius: 16,
    borderWidth: 1.5,
  },
  uploadBtnContent: {
    height: 52,
  },
  identifyBtn: {
    borderRadius: 16,
    elevation: 3,
  },
  identifyBtnContent: {
    height: 52,
  },
  tipsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  tipsTitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  cameraCloseBtn: {
    alignSelf: "flex-start",
    margin: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  cameraBottomBar: {
    alignItems: "center",
    paddingBottom: 40,
  },
  captureBtn: {
    borderRadius: 36,
    elevation: 6,
  },
});
