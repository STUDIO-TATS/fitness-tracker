import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingWrapper } from "../components/KeyboardAvoidingWrapper";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { colors } from "../constants/colors";
import { icons } from "../constants/icons";
import { theme } from "../constants/theme";
import { useI18n } from "../hooks/useI18n";
import { useNotifications } from "../contexts/NotificationContext";
import {
  commonStyles,
  spacing,
  typography,
  layout,
  borderRadius,
  shadows,
} from "../constants/styles";

export default function NotificationScreen() {
  const { t } = useI18n();
  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    markAsRead,
    onRefresh,
  } = useNotifications();


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "たった今";
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`;
    } else if (diffInHours < 48) {
      return "1日前";
    } else {
      return date.toLocaleDateString("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'app':
        return 'phone-portrait-outline';
      case 'facility':
        return 'business-outline';
      case 'achievement':
        return 'trophy-outline';
      case 'reminder':
        return 'alarm-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'app':
        return colors.purple[500];
      case 'facility':
        return colors.mint[500];
      case 'achievement':
        return colors.yellow[500];
      case 'reminder':
        return colors.pink[500];
      default:
        return colors.gray[500];
    }
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification,
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationTitleSection}>
            <View
              style={[
                styles.notificationIcon,
                { backgroundColor: getNotificationColor(item.type) },
              ]}
            >
              <Ionicons
                name={getNotificationIcon(item.type)}
                size={16}
                color={colors.white}
              />
            </View>
            <View style={styles.notificationTitleContainer}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationCategory}>
                {item.facilityName || item.category}
              </Text>
            </View>
          </View>
          <View style={styles.notificationMeta}>
            <Text style={styles.notificationDate}>
              {formatDate(item.createdAt)}
            </Text>
            {!item.isRead && <View style={styles.unreadBadge} />}
          </View>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={3}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <KeyboardAvoidingWrapper>
        <ScreenWrapper backgroundColor={theme.colors.background.tertiary} keyboardAvoiding={false} dismissKeyboardOnTap={false}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t("common.loading")}</Text>
          </View>
        </ScreenWrapper>
      </KeyboardAvoidingWrapper>
    );
  }

  return (
    <KeyboardAvoidingWrapper>
      <ScreenWrapper backgroundColor={theme.colors.background.tertiary} keyboardAvoiding={false} dismissKeyboardOnTap={false}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>{t("navigation.notifications")}</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadCountContainer}>
            <Text style={styles.unreadCountText}>
              {unreadCount} {t("notifications.unread")}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={colors.gray[400]}
            />
            <Text style={styles.emptyText}>
              {t("notifications.noNotifications")}
            </Text>
          </View>
        }
      />
      </ScreenWrapper>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.gray[500],
  },
  header: {
    ...commonStyles.screenHeader,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  screenTitle: {
    ...commonStyles.screenTitle,
    color: theme.colors.text.primary,
  },
  unreadCountContainer: {
    backgroundColor: colors.pink[500],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  unreadCountText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 100,
  },
  notificationItem: {
    ...commonStyles.card,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  notificationTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  notificationTitleContainer: {
    flex: 1,
  },
  notificationTitle: {
    ...typography.cardTitle,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  notificationCategory: {
    ...typography.caption,
    color: colors.gray[500],
  },
  notificationMeta: {
    alignItems: "flex-end",
  },
  notificationDate: {
    ...typography.caption,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificationMessage: {
    ...typography.body,
    color: colors.gray[700],
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray[500],
    marginTop: spacing.lg,
    textAlign: "center",
  },
});