import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../constants/colors";
import { icons } from "../constants/icons";
import { theme } from "../constants/theme";
import { typography, spacing } from "../constants/styles";

interface FloatingActionButtonProps {
  onPress: () => void;
  text: string;
  icon?: keyof typeof icons.status;
  gradientColors?: [string, string];
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  text,
  icon = "add",
  gradientColors = theme.colors.gradient.primary,
}) => {
  return (
    <View style={styles.floatingButtonContainer}>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={onPress}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.floatingButtonGradient}
        >
          <Ionicons
            name={icons.status[icon]}
            size={24}
            color={theme.colors.text.inverse}
          />
          <Text style={styles.floatingButtonText}>
            {text}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    zIndex: 1000,
    elevation: 1000,
  },
  floatingButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    ...theme.shadows.lg,
  },
  floatingButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  floatingButtonText: {
    ...typography.body,
    color: theme.colors.text.inverse,
    fontWeight: theme.fontWeight.semibold,
  },
});