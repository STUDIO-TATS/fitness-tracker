import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

interface PointActivity {
  id: string;
  title: string;
  points: number;
  date: string;
  type: 'earned' | 'spent';
  icon: string;
}

export default function PointsScreen() {
  const totalPoints = 2450;
  const [activities] = useState<PointActivity[]>([
    {
      id: '1',
      title: 'ワークアウト完了',
      points: 100,
      date: '2024-01-15',
      type: 'earned',
      icon: 'barbell',
    },
    {
      id: '2',
      title: '週間目標達成',
      points: 250,
      date: '2024-01-14',
      type: 'earned',
      icon: 'trophy',
    },
    {
      id: '3',
      title: 'プロテインバー交換',
      points: -300,
      date: '2024-01-13',
      type: 'spent',
      icon: 'gift',
    },
    {
      id: '4',
      title: '体重記録（7日連続）',
      points: 50,
      date: '2024-01-12',
      type: 'earned',
      icon: 'body',
    },
  ]);

  const rewards = [
    { id: '1', name: 'プロテインバー', points: 300, image: '🍫' },
    { id: '2', name: 'ジムタオル', points: 500, image: '🏃' },
    { id: '3', name: '1日無料パス', points: 1000, image: '🎫' },
    { id: '4', name: 'パーソナルトレーニング', points: 2000, image: '💪' },
  ];

  const renderActivity = ({ item }: { item: PointActivity }) => (
    <View style={styles.activityItem}>
      <View style={[
        styles.activityIcon,
        { backgroundColor: item.type === 'earned' ? colors.mint[100] : colors.pink[100] }
      ]}>
        <Ionicons
          name={item.icon as any}
          size={20}
          color={item.type === 'earned' ? colors.mint[600] : colors.pink[600]}
        />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDate}>{item.date}</Text>
      </View>
      <Text style={[
        styles.activityPoints,
        { color: item.type === 'earned' ? colors.mint[600] : colors.pink[600] }
      ]}>
        {item.type === 'earned' ? '+' : ''}{item.points}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper backgroundColor={colors.purple[50]} scrollable>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>ポイント</Text>
      </View>

      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>現在のポイント</Text>
        <Text style={styles.pointsValue}>{totalPoints.toLocaleString()}</Text>
        <Text style={styles.pointsUnit}>ポイント</Text>
        <TouchableOpacity style={styles.scanButton}>
          <Ionicons name="qr-code" size={20} color={colors.white} />
          <Text style={styles.scanButtonText}>QRコードでポイント獲得</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>交換可能な特典</Text>
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
          <Text style={styles.sectionTitle}>アクティビティ履歴</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>すべて見る</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activitiesContainer}>
          {activities.map((activity) => (
            <View key={activity.id}>
              {renderActivity({ item: activity })}
            </View>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.screenHeader,
  },
  screenTitle: {
    ...commonStyles.screenTitle,
    color: colors.purple[700],
  },
  pointsCard: {
    ...commonStyles.card,
    marginHorizontal: layout.screenPadding,
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  pointsLabel: {
    ...typography.small,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.purple[700],
  },
  pointsUnit: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: layout.screenPadding,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purple[500],
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  scanButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  section: {
    ...commonStyles.section,
  },
  sectionHeader: {
    ...commonStyles.sectionHeader,
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
    alignItems: 'center',
    ...shadows.sm,
  },
  rewardImage: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  rewardName: {
    ...typography.small,
    fontWeight: '500',
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  rewardPoints: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.purple[600],
  },
  activitiesContainer: {
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    fontWeight: '500',
    color: colors.gray[900],
  },
  activityDate: {
    ...typography.small,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  activityPoints: {
    ...typography.cardTitle,
    fontWeight: '600',
  },
});