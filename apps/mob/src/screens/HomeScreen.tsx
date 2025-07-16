import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { KeyboardAvoidingWrapper } from "../components/KeyboardAvoidingWrapper";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { ChartSection } from "../components/ChartSection";
import { colors } from "../constants/colors";
import { icons } from "../constants/icons";
import { theme } from "../constants/theme";
import {
  commonStyles,
  spacing,
  typography,
  layout,
  borderRadius,
  shadows,
} from "../constants/styles";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";
import { supabase } from "../lib/supabase";
import { RootDrawerParamList } from "../types/navigation";

type HomeNavigationProp = DrawerNavigationProp<RootDrawerParamList, "Main">;

interface DashboardStats {
  activeGoals: number;
  monthlyWorkouts: number;
  todayActivities: number;
}

export default function HomeScreen() {
  const { session } = useAuth();
  const { t } = useI18n();
  const navigation = useNavigation<HomeNavigationProp>();
  const [weightPeriod, setWeightPeriod] = useState<"1month" | "3month">(
    "1month"
  );
  const [progressPeriod, setProgressPeriod] = useState<"weekly" | "monthly">(
    "weekly"
  );
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeGoals: 0,
    monthlyWorkouts: 0,
    todayActivities: 0,
  });
  const [weightData, setWeightData] = useState<any>({
    "1month": { labels: [], datasets: [] },
    "3month": { labels: [], datasets: [] },
  });
  const [workoutData, setWorkoutData] = useState<any>({
    weekly: { labels: [], datasets: [] },
    monthly: { labels: [], datasets: [] },
  });

  useEffect(() => {
    fetchDashboardData();
  }, [session]);

  const fetchDashboardData = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch stats in parallel
      const [
        goalsResult,
        workoutsResult,
        activitiesResult,
        measurementsResult,
      ] = await Promise.all([
        // Active goals count
        supabase
          .from("goals")
          .select("id", { count: "exact" })
          .eq("user_id", session.user.id)
          .eq("status", "active"),

        // Monthly workouts count
        supabase
          .from("workouts")
          .select("id", { count: "exact" })
          .eq("user_id", session.user.id)
          .gte("date", new Date(new Date().setDate(1)).toISOString()),

        // Today's activities count
        supabase
          .from("activity_logs")
          .select("id", { count: "exact" })
          .eq("user_id", session.user.id)
          .gte("check_in_time", new Date().toISOString().split("T")[0]),

        // Weight measurements for chart
        supabase
          .from("measurements")
          .select("measurement_date, weight")
          .eq("user_id", session.user.id)
          .order("measurement_date", { ascending: true })
          .limit(90),
      ]);

      // Update stats
      setStats({
        activeGoals: goalsResult.count || 0,
        monthlyWorkouts: workoutsResult.count || 0,
        todayActivities: activitiesResult.count || 0,
      });

      // Process weight data
      if (measurementsResult.data && measurementsResult.data.length > 0) {
        processWeightData(measurementsResult.data);
      } else {
        // Use placeholder data if no measurements
        setWeightData({
          "1month": {
            labels: ["データなし"],
            datasets: [
              {
                data: [0],
                color: (opacity = 1) => colors.primary,
                strokeWidth: 2,
              },
            ],
          },
          "3month": {
            labels: ["データなし"],
            datasets: [
              {
                data: [0],
                color: (opacity = 1) => colors.primary,
                strokeWidth: 2,
              },
            ],
          },
        });
      }

      // Fetch workout duration data
      await fetchWorkoutData();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processWeightData = (measurements: any[]) => {
    const now = new Date();
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 2));

    const oneMonthData = measurements.filter(
      (m) => new Date(m.measurement_date) >= oneMonthAgo
    );
    const threeMonthData = measurements.filter(
      (m) => new Date(m.measurement_date) >= threeMonthsAgo
    );

    const formatData = (data: any[]) => ({
      labels: data.map((m) => {
        const date = new Date(m.measurement_date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: data.map((m) => m.weight),
          color: (opacity = 1) => colors.primary,
          strokeWidth: 2,
        },
      ],
    });

    setWeightData({
      "1month": formatData(oneMonthData),
      "3month": formatData(threeMonthData),
    });
  };

  const fetchWorkoutData = async () => {
    if (!session?.user) return;

    try {
      // Weekly workout data
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      const { data: weeklyData } = await supabase
        .from("workouts")
        .select("date, duration_minutes")
        .eq("user_id", session.user.id)
        .gte("date", weekStart.toISOString());

      // Process weekly data
      const weekLabels = ["月", "火", "水", "木", "金", "土", "日"];
      const weekData = new Array(7).fill(0);

      weeklyData?.forEach((workout) => {
        const day = new Date(workout.date).getDay();
        const adjustedDay = day === 0 ? 6 : day - 1; // Adjust for Monday start
        weekData[adjustedDay] += workout.duration_minutes;
      });

      // Monthly workout data (last 6 months)
      const monthlyLabels: string[] = [];
      const monthlyMinutes: number[] = [];

      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const { data: monthData, count } = await supabase
          .from("workouts")
          .select("duration_minutes", { count: "exact" })
          .eq("user_id", session.user.id)
          .gte("date", monthStart.toISOString())
          .lt("date", monthEnd.toISOString());

        const totalMinutes =
          monthData?.reduce((sum, w) => sum + w.duration_minutes, 0) || 0;

        monthlyLabels.push(`${monthStart.getMonth() + 1}月`);
        monthlyMinutes.push(totalMinutes);
      }

      setWorkoutData({
        weekly: {
          labels: weekLabels,
          datasets: [
            {
              data: weekData,
              color: (opacity = 1) => theme.colors.action.primary,
            },
          ],
        },
        monthly: {
          labels: monthlyLabels,
          datasets: [
            {
              data: monthlyMinutes,
              color: (opacity = 1) => theme.colors.action.primary,
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error fetching workout data:", error);
    }
  };

  const weightPeriods = [
    { key: "1month", label: "1ヶ月" },
    { key: "3month", label: "3ヶ月" },
  ];

  const progressPeriods = [
    { key: "weekly", label: "週間" },
    { key: "monthly", label: "月間" },
  ];

  const barChartConfig = {
    color: (opacity = 1) => theme.colors.action.primary,
    barPercentage: 0.6,
    fillShadowGradient: theme.colors.action.primary,
    fillShadowGradientOpacity: 1,
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "workout":
        navigation.navigate("Main", {
          screen: "Workout",
          params: {
            screen: "WorkoutInput",
          },
        } as any);
        break;
      case "measurement":
        navigation.navigate("Main", {
          screen: "Measurement",
          params: {
            screen: "MeasurementInput",
          },
        } as any);
        break;
      case "goals":
        navigation.navigate("Main", {
          screen: "Goals",
        } as any);
        break;
      case "qr":
        // QR scanner implementation
        break;
    }
  };

  if (loading) {
    return (
      <KeyboardAvoidingWrapper>
        <ScreenWrapper>
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={theme.colors.action.primary}
            />
            <Text style={styles.loadingText}>{t("common.loading")}</Text>
          </View>
        </ScreenWrapper>
      </KeyboardAvoidingWrapper>
    );
  }

  return (
    <KeyboardAvoidingWrapper>
      <ScreenWrapper
        scrollable
        keyboardAvoiding={false}
        dismissKeyboardOnTap={false}
      >
        <View style={commonStyles.screenHeader}>
          <Text style={styles.greeting}>
            {t("home.welcome", { name: "" }).replace("さん", "！")}
          </Text>
          <Text style={styles.userName}>
            {session?.user?.email || t("common.guest")}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
        >
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statCard}>
              <LinearGradient
                colors={theme.colors.gradient.primary}
                style={styles.statGradient}
              >
                <Ionicons
                  name={icons.navigation.goalsOutline}
                  size={32}
                  color={theme.colors.text.inverse}
                />
                <Text style={styles.statNumber}>{stats.activeGoals}</Text>
                <Text style={styles.statLabel}>{t("goals.current")}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard}>
              <LinearGradient
                colors={theme.colors.gradient.aurora}
                style={styles.statGradient}
              >
                <Ionicons
                  name={icons.navigation.workoutOutline}
                  size={32}
                  color={theme.colors.text.inverse}
                />
                <Text style={styles.statNumber}>{stats.monthlyWorkouts}</Text>
                <Text style={styles.statLabel}>{t("workout.title")}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard}>
              <LinearGradient
                colors={theme.colors.gradient.mint}
                style={styles.statGradient}
              >
                <Ionicons
                  name={icons.status.checkmarkCircleOutline}
                  size={32}
                  color={theme.colors.text.inverse}
                />
                <Text style={styles.statNumber}>{stats.todayActivities}</Text>
                <Text style={styles.statLabel}>{t("home.todayActivity")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <ChartSection
          title={t("measurement.weight")}
          unit={t("measurement.kg")}
          data={weightData}
          chartType="line"
          currentPeriod={weightPeriod}
          periods={weightPeriods}
          onPeriodChange={(period) =>
            setWeightPeriod(period as "1month" | "3month")
          }
          icon="scale-outline"
        />

        <ChartSection
          title={
            progressPeriod === "weekly"
              ? t("home.weeklyProgress")
              : t("home.monthlyProgress")
          }
          unit={t("workout.minutes")}
          data={workoutData}
          chartType="bar"
          currentPeriod={progressPeriod}
          periods={progressPeriods}
          onPeriodChange={(period) =>
            setProgressPeriod(period as "weekly" | "monthly")
          }
          chartConfig={barChartConfig}
          icon="barbell-outline"
        />

        <View style={[commonStyles.section, styles.quickActionsSection]}>
          <View style={commonStyles.sectionHeader}>
            <View style={styles.sectionHeaderWithIcon}>
              <Ionicons
                name="flash-outline"
                size={20}
                color={theme.colors.text.primary}
                style={styles.sectionIcon}
              />
              <Text style={commonStyles.sectionTitle}>
                {t("home.quickActions")}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleQuickAction("workout")}
          >
            <LinearGradient
              colors={theme.colors.gradient.primary}
              style={styles.actionIcon}
            >
              <Ionicons
                name={icons.status.addCircleOutline}
                size={24}
                color={theme.colors.text.inverse}
              />
            </LinearGradient>
            <Text style={styles.actionText}>{t("home.startWorkout")}</Text>
            <Ionicons
              name={icons.navigation.forward}
              size={20}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleQuickAction("measurement")}
          >
            <LinearGradient
              colors={theme.colors.gradient.aurora}
              style={styles.actionIcon}
            >
              <Ionicons
                name={icons.stats.bodyOutline}
                size={24}
                color={theme.colors.text.inverse}
              />
            </LinearGradient>
            <Text style={styles.actionText}>{t("measurement.record")}</Text>
            <Ionicons
              name={icons.navigation.forward}
              size={20}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleQuickAction("goals")}
          >
            <LinearGradient
              colors={theme.colors.gradient.mint}
              style={styles.actionIcon}
            >
              <Ionicons
                name={icons.navigation.goalsOutline}
                size={24}
                color={theme.colors.text.inverse}
              />
            </LinearGradient>
            <Text style={styles.actionText}>{t("navigation.goals")}</Text>
            <Ionicons
              name={icons.navigation.forward}
              size={20}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleQuickAction("qr")}
          >
            <LinearGradient
              colors={theme.colors.gradient.secondary}
              style={styles.actionIcon}
            >
              <Ionicons
                name={icons.scanning.qrCodeOutline}
                size={24}
                color={theme.colors.text.inverse}
              />
            </LinearGradient>
            <Text style={styles.actionText}>{t("home.scanQR")}</Text>
            <Ionicons
              name={icons.navigation.forward}
              size={20}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        </View>

        {/* エミュレーター用の追加スペース */}
        <View style={{ height: 100 }} />
      </ScreenWrapper>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  greeting: {
    ...typography.screenTitle,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  userName: {
    ...typography.body,
    color: theme.colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: theme.colors.text.secondary,
    marginTop: spacing.md,
  },
  statsScroll: {
    marginBottom: theme.spacing.xl,
  },
  statsContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: layout.screenPadding,
  },
  statCard: {
    width: 120,
    height: 140,
    marginRight: theme.spacing.md,
  },
  statGradient: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.md,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
    marginVertical: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.inverse,
    textAlign: "center",
    fontWeight: theme.fontWeight.medium,
  },
  actionCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    marginHorizontal: layout.screenPadding,
    ...theme.shadows.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  actionText: {
    flex: 1,
    ...typography.body,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
  quickActionsSection: {
    backgroundColor: theme.colors.background.secondary,
    marginHorizontal: layout.screenPadding,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionHeaderWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: theme.spacing.sm,
  },
});
