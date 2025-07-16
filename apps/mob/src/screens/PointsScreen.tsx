import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { colors } from "../constants/colors";
import { icons } from "../constants/icons";
import { theme } from "../constants/theme";
import { useI18n } from "../hooks/useI18n";
import {
  commonStyles,
  spacing,
  typography,
  layout,
  borderRadius,
  shadows,
} from "../constants/styles";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { PointTransaction, UserPoint } from "../types/database";

interface PointActivity {
  id: string;
  title: string;
  points: number;
  date: string;
  type: "earned" | "spent";
  icon: string;
}

export default function PointsScreen() {
  const { t } = useI18n();
  const { session } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [activities, setActivities] = useState<PointActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPointsData();
  }, [session]);

  const fetchPointsData = async () => {
    if (!session?.user?.id) {
      setTotalPoints(0);
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // ユーザーのポイント残高を取得
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('current_points')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (pointsError) throw pointsError;

      if (pointsData) {
        setTotalPoints(Math.floor(pointsData.current_points || 0));
      }

      // ポイント履歴を取得
      const { data: transactions, error: transactionsError } = await supabase
        .from('point_transactions')
        .select(`
          *,
          activity_logs (
            facilities (
              name
            )
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionsError) throw transactionsError;

      // トランザクションをアクティビティ形式に変換
      const formattedActivities = (transactions || []).map(transaction => ({
        id: transaction.id,
        title: getActivityTitle(transaction),
        points: Math.floor(transaction.amount),
        date: new Date(transaction.created_at).toLocaleDateString('ja-JP'),
        type: transaction.transaction_type === 'earn' ? 'earned' : 'spent' as 'earned' | 'spent',
        icon: getActivityIcon(transaction.transaction_type),
      }));

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching points data:', error);
      Alert.alert(t('common.error'), t('common.dataLoadError'));
      setTotalPoints(0);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTitle = (transaction: any): string => {
    if (transaction.description) {
      return transaction.description;
    }
    if (transaction.activity_logs?.facilities?.name) {
      return `${transaction.activity_logs.facilities.name}でのアクティビティ`;
    }
    return transaction.transaction_type === 'earn' ? 'ポイント獲得' : 'ポイント使用';
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'earn':
        return icons.navigation.workout;
      case 'use':
      case 'spent':
        return icons.rewards.gift;
      case 'expire':
        return icons.activity.time;
      default:
        return icons.misc.list;
    }
  };


  const rewards = [
    { id: "1", name: "プロテインバー", points: 300, image: "🍫" },
    { id: "2", name: "ジムタオル", points: 500, image: "🏃" },
    { id: "3", name: "1日無料パス", points: 1000, image: "🎫" },
    { id: "4", name: "パーソナルトレーニング", points: 2000, image: "💪" },
  ];

  const renderActivity = ({ item }: { item: PointActivity }) => (
    <View style={styles.activityItem}>
      <LinearGradient
        colors={
          item.type === "earned"
            ? theme.colors.gradient.mint
            : theme.colors.gradient.secondary
        }
        style={styles.activityIcon}
      >
        <Ionicons
          name={item.icon as any}
          size={20}
          color={theme.colors.text.inverse}
        />
      </LinearGradient>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDate}>{item.date}</Text>
      </View>
      <Text
        style={[
          styles.activityPoints,
          {
            color:
              item.type === "earned"
                ? theme.colors.status.completed
                : theme.colors.action.secondary,
          },
        ]}
      >
        {item.type === "earned" ? "+" : ""}
        {item.points}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper
      backgroundColor={theme.colors.background.tertiary}
      scrollable
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : (
        <>
          <View style={styles.pointsCard}>
        <LinearGradient
          colors={theme.colors.gradient.primary}
          style={styles.pointsGradient}
        >
          <Ionicons
            name={icons.rewards.star}
            size={32}
            color={theme.colors.text.inverse}
          />
          <Text style={styles.pointsLabel}>{t("points.currentPoints")}</Text>
          <Text style={styles.pointsValue}>{totalPoints.toLocaleString()}</Text>
          <Text style={styles.pointsUnit}>{t("points.title")}</Text>
          <TouchableOpacity style={styles.scanButton}>
            <Ionicons
              name={icons.scanning.qrCode}
              size={20}
              color={theme.colors.action.primary}
            />
            <Text style={styles.scanButtonText}>
              QR{t("common.code")}でポイント獲得
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons
            name={icons.rewards.gift}
            size={20}
            color={theme.colors.text.primary}
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>{t("points.rewards")}</Text>
        </View>
        <FlatList
          data={rewards}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.rewardCard}>
              <Text style={styles.rewardImage}>{item.image}</Text>
              <Text style={styles.rewardName}>{item.name}</Text>
              <Text style={styles.rewardPoints}>{item.points}P</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.rewardsList}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWithIcon}>
            <Ionicons
              name="time-outline"
              size={20}
              color={theme.colors.text.primary}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>{t("points.pointHistory")}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>{t("common.viewAll")}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activitiesContainer}>
          {activities.map((activity) => (
            <View key={activity.id}>{renderActivity({ item: activity })}</View>
          ))}
        </View>
      </View>
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.screenHeader,
  },
  screenTitle: {
    ...commonStyles.screenTitle,
    color: theme.colors.text.primary,
  },
  pointsCard: {
    marginHorizontal: layout.screenPadding,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    ...theme.shadows.lg,
  },
  pointsGradient: {
    padding: theme.spacing.xxl,
    alignItems: "center",
  },
  pointsLabel: {
    ...typography.small,
    color: theme.colors.text.inverse,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.fontWeight.medium,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
    fontFamily: theme.fontFamily.bold,
  },
  pointsUnit: {
    ...typography.body,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.lg,
    fontWeight: theme.fontWeight.medium,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  scanButtonText: {
    ...typography.body,
    color: theme.colors.action.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  section: {
    ...commonStyles.section,
  },
  sectionHeader: {
    ...commonStyles.sectionHeader,
  },
  sectionTitleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
  },
  viewAllText: {
    ...typography.small,
    color: colors.purple[600],
  },
  rewardsList: {
    paddingHorizontal: layout.screenPadding,
  },
  rewardCard: {
    ...commonStyles.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
    marginBottom: 0,
    width: 120,
    alignItems: "center",
    ...shadows.sm,
  },
  rewardImage: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  rewardName: {
    ...typography.small,
    fontWeight: "500",
    color: colors.gray[900],
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  rewardPoints: {
    ...typography.body,
    fontWeight: "bold",
    color: colors.purple[600],
  },
  activitiesContainer: {
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    fontWeight: "500",
    color: colors.gray[900],
  },
  activityDate: {
    ...typography.small,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  activityPoints: {
    ...typography.cardTitle,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.gray[500],
  },
});
