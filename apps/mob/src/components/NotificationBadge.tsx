import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { icons } from "../constants/icons";
import { theme } from "../constants/theme";
import { typography, spacing, borderRadius } from "../constants/styles";
import { useNotifications } from "../contexts/NotificationContext";

interface NotificationBadgeProps {
  onPress: () => void;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  onPress,
}) => {
  const { unreadCount } = useNotifications();
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons
        name={icons.status.notifications}
        size={24}
        color={theme.colors.text.inverse}
      />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: spacing.sm,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.pink[500],
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 12,
  },
});