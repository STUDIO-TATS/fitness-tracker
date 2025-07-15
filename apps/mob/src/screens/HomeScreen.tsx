import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';
import { useAuth } from '../hooks/useAuth';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const { session } = useAuth();

  // 体重推移データ
  const weightData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
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
    labels: ['月', '火', '水', '木', '金', '土', '日'],
    datasets: [
      {
        data: [30, 45, 0, 60, 30, 90, 45],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 1,
    color: (opacity = 1) => colors.purple[500],
    labelColor: (opacity = 1) => colors.gray[600],
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  return (
    <ScreenWrapper scrollable keyboardAvoiding={false} dismissKeyboardOnTap={false}>
      <View style={commonStyles.screenHeader}>
        <Text style={styles.greeting}>こんにちは！</Text>
        <Text style={styles.userName}>{session?.user?.email || 'ゲスト'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="flag" size={32} color={colors.primary} />
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>アクティブな目標</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="barbell" size={32} color={colors.purple[500]} />
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>今月のワークアウト</Text>
        </View>
      </View>

      <View style={commonStyles.section}>
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>体重推移</Text>
        </View>
        <View style={styles.chartContainer}>
          <View style={styles.chartUnitWrapper}>
            <Text style={styles.chartUnit}>kg</Text>
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
          <Text style={commonStyles.sectionTitle}>週間ワークアウト時間</Text>
        </View>
        <View style={styles.chartContainer}>
          <View style={styles.chartUnitWrapper}>
            <Text style={styles.chartUnit}>分</Text>
          </View>
          <BarChart
            data={workoutData}
            width={screenWidth - 80}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => colors.mint[500],
            }}
            style={styles.chart}
            withInnerLines={false}
            showBarTops={false}
          />
        </View>
      </View>

      <View style={commonStyles.section}>
        <View style={commonStyles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>クイックアクション</Text>
        </View>
        
        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Ionicons name="add-circle" size={24} color={colors.white} />
          </View>
          <Text style={styles.actionText}>新しいワークアウトを記録</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: colors.purple[500] }]}>
            <Ionicons name="body" size={24} color={colors.white} />
          </View>
          <Text style={styles.actionText}>体重を記録</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={[styles.actionIcon, { backgroundColor: colors.mint[500] }]}>
            <Ionicons name="trophy" size={24} color={colors.white} />
          </View>
          <Text style={styles.actionText}>目標を確認</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
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
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  userName: {
    ...typography.body,
    color: colors.gray[600],
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginVertical: spacing.sm,
  },
  statLabel: {
    ...typography.small,
    color: colors.gray[600],
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginHorizontal: layout.screenPadding,
    ...shadows.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    flex: 1,
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: layout.screenPadding,
    ...shadows.md,
    position: 'relative',
  },
  chartUnitWrapper: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 1,
  },
  chartUnit: {
    ...typography.small,
    color: colors.gray[600],
    fontWeight: '500',
  },
  chart: {
    borderRadius: borderRadius.lg,
  },
});