import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { IconButton, useTheme } from "react-native-paper";

interface ImagePreviewProps {
  imageUri: string;
  onRemove?: () => void;
  height?: number;
  borderRadius?: number;
}

export default function ImagePreview({
  imageUri,
  onRemove,
  height = 280,
  borderRadius = 16,
}: ImagePreviewProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderRadius }]}>
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { height, borderRadius }]}
        resizeMode="cover"
      />
      {onRemove && (
        <IconButton
          icon="close-circle"
          size={28}
          iconColor={theme.colors.surface}
          style={styles.removeButton}
          onPress={onRemove}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
});
