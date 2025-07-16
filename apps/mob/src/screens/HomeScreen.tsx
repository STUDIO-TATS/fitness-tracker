import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, BarChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenWrapper } from "../components/ScreenWrapper";
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

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const { session } = useAuth();
  const { t } = useI18n();

  // 体重推移データ
  const weightData = {
    labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
    datasets: [
      {
        data: [72, 71.5, 71, 70.8, 70.5, 70.2],
        color: (opacity = 1) => colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  // 週間ワークアウトデータ
  const workoutData = {
    labels: ["月", "火", "水", "木", "金", "土", "日"],
    datasets: [
      {
        data: [30, 45, 0, 60, 30, 90, 45],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.background.primary,
    backgroundGradientTo: theme.colors.background.primary,
    decimalPlaces: 1,
    color: (opacity = 1) => theme.colors.chart.primary,
    labelColor: (opacity = 1) => theme.colors.text.secondary,
    style: {
      borderRadius: theme.borderRadius.lg,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.colors.action.primary,
    },
  };

  return (
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
              <Text style={styles.statNumber}>3</Text>
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
              <Text style={styles.statNumber}>12</Text>
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
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>{t("home.todayActivity")}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={commonStyles.section}>
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>
            {t("measurement.weight")}
          </Text>
        </View>
        <View style={styles.chartContainer}>
          <View style={styles.chartUnitWrapper}>
            <Text style={styles.chartUnit}>{t("measurement.kg")}</Text>
          </View>
          <LineChart
            data={weightData}
            width={screenWidth - 80}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withDots={true}
            withShadow={false}
          />
        </View>
      </View>

      <View style={commonStyles.section}>
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>
            {t("home.weeklyProgress")}
          </Text>
        </View>
        <View style={styles.chartContainer}>
          <View style={styles.chartUnitWrapper}>
            <Text style={styles.chartUnit}>{t("workout.minutes")}</Text>
          </View>
          <BarChart
            data={workoutData}
            width={screenWidth - 80}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => theme.colors.chart.tertiary,
            }}
            style={styles.chart}
            withInnerLines={false}
            showBarTops={false}
          />
        </View>
      </View>

      <View style={commonStyles.section}>
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>
            {t("home.quickActions")}
          </Text>
        </View>

        <TouchableOpacity style={styles.actionCard}>
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

        <TouchableOpacity style={styles.actionCard}>
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

        <TouchableOpacity style={styles.actionCard}>
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

        <TouchableOpacity style={styles.actionCard}>
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
  chartContainer: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: layout.screenPadding,
    ...theme.shadows.md,
    position: "relative",
  },
  chartUnitWrapper: {
    position: "absolute",
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 1,
  },
  chartUnit: {
    ...typography.small,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium,
  },
  chart: {
    borderRadius: theme.borderRadius.lg,
  },
});
