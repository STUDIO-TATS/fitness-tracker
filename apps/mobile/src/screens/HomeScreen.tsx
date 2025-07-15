import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text, Card, Button } from "@fitness-tracker/ui";
import { colors, spacing } from "@fitness-tracker/ui";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  signOut,
  getWorkouts,
  getActiveGoals,
  getProfile,
} from "../lib/supabase";
import type { Workout, Goal, Profile } from "@fitness-tracker/types";
import { useAuth } from "../hooks/useAuth";
import {
  ScreenWrapper,
  LoadingScreen,
  EmptyState,
  StatsCard,
  ProgressBar,
} from "../components/shared";

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      // Add a small delay to ensure the component is properly mounted
      setTimeout(() => {
        loadDashboardData();
      }, 100);
    } else {
      console.log("❌ [DEBUG] No user, skipping loadDashboardData");
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Load profile
      const { data: profileData, error: profileError } = await getProfile(
        user.id
      );
      if (profileError) {
        console.error("❌ [DEBUG] Profile error:", profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      // Load recent workouts
      const { data: workoutData, error: workoutError } = await getWorkouts(
        user.id
      );
      if (workoutError) {
        console.error("❌ [DEBUG] Workout error:", workoutError);
      } else {
        setRecentWorkouts(workoutData?.slice(0, 3) || []); // Show last 3 workouts
      }

      // Load active goals
      const { data: goalData, error: goalError } = await getActiveGoals(
        user.id
      );
      if (goalError) {
        console.error("❌ [DEBUG] Goal error:", goalError);
      } else {
        setActiveGoals(goalData?.slice(0, 2) || []); // Show top 2 goals
      }
    } catch (error) {
      console.error("💥 [DEBUG] Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getThisWeekWorkoutCount = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return recentWorkouts.filter(
      (workout) => new Date(workout.date) >= oneWeekAgo
    ).length;
  };

  const getCompletedGoalsCount = () => {
    return activeGoals.filter((goal) => goal.status === "completed").length;
  };

  const menuItems = [
    {
      title: "ワークアウトを記録",
      description: "今日のトレーニングを記録しよう",
      icon: "dumbbell",
      screen: "Workout",
      color: colors.purple[500],
    },
    {
      title: "目標設定",
      description: "目標を設定して達成しよう",
      icon: "target",
      screen: "Goals",
      color: colors.mint[500],
    },
    {
      title: "プロフィール",
      description: "設定とアカウント管理",
      icon: "account",
      screen: "Profile",
      color: colors.pink[500],
    },
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScreenWrapper scrollable refreshing={refreshing} onRefresh={handleRefresh}>
      <View style={styles.header}>
        <Text variant="heading2" weight="bold">
          {profile?.display_name
            ? `${profile.display_name}さん、`
            : user?.email
            ? `${user.email}さん、`
            : ""}
          おかえりなさい！
        </Text>
        <Text variant="body" color="gray">
          今日も頑張りましょう
        </Text>
      </View>

      <View style={styles.stats}>
        <StatsCard
          title="今週のワークアウト"
          value={getThisWeekWorkoutCount()}
          icon="dumbbell"
          color={colors.purple[500]}
        />
        <StatsCard
          title="アクティブな目標"
          value={activeGoals.length}
          icon="target"
          color={colors.mint[500]}
        />
      </View>

      {/* Recent Workouts */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text variant="heading3" weight="semibold">
            最近のワークアウト
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Workout")}>
            <Text style={{ color: colors.purple[500] }}>すべて見る</Text>
          </TouchableOpacity>
        </View>

        {recentWorkouts.length === 0 ? (
          <EmptyState
            icon="dumbbell"
            title="ワークアウトがありません"
            description="最初のワークアウトを記録しましょう！"
            actionText="ワークアウトを記録"
            onAction={() => navigation.navigate("Workout")}
          />
        ) : (
          recentWorkouts.map((workout) => (
            <View key={workout.id} style={styles.workoutItem}>
              <View style={styles.workoutInfo}>
                <Text variant="body" weight="semibold">
                  {workout.name}
                </Text>
                <Text variant="caption" color="gray">
                  {new Date(workout.date).toLocaleDateString("ja-JP")}
                  {workout.duration && ` • ${workout.duration}分`}
                </Text>
              </View>
              <Text variant="caption" color="gray">
                {workout.workout_exercises?.length || 0} エクササイズ
              </Text>
            </View>
          ))
        )}
      </Card>

      {/* Active Goals */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text variant="heading3" weight="semibold">
            アクティブな目標
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Goals")}>
            <Text style={{ color: colors.mint[500] }}>すべて見る</Text>
          </TouchableOpacity>
        </View>

        {activeGoals.length === 0 ? (
          <EmptyState
            icon="target"
            title="目標がありません"
            description="最初の目標を設定しましょう！"
            actionText="目標を設定"
            onAction={() => navigation.navigate("Goals")}
          />
        ) : (
          activeGoals.map((goal) => (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalInfo}>
                <Text variant="body" weight="semibold">
                  {goal.title}
                </Text>
                {goal.target_value && (
                  <Text variant="caption" color="gray">
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </Text>
                )}
              </View>
              {goal.target_value && (
                <ProgressBar
                  current={goal.current_value}
                  target={goal.target_value}
                  unit={goal.unit}
                  color={colors.mint[500]}
                  showText={false}
                />
              )}
            </View>
          ))
        )}
      </Card>

      {/* Quick Actions */}
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <Card style={[styles.menuItem, { borderLeftColor: item.color }]}>
              <MaterialCommunityIcons
                name={item.icon}
                size={32}
                color={item.color}
                style={styles.menuIcon}
              />
              <View style={styles.menuContent}>
                <Text variant="heading3" weight="semibold">
                  {item.title}
                </Text>
                <Text variant="caption" color="gray">
                  {item.description}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="ログアウト"
        onPress={handleSignOut}
        variant="secondary"
        style={styles.logoutButton}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  workoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  workoutInfo: {
    flex: 1,
  },
  goalItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  goalInfo: {
    marginBottom: spacing.xs,
  },
  menu: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
  },
  menuIcon: {
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  logoutButton: {
    marginBottom: spacing.lg,
  },
});
