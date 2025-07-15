import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

interface ActivityLog {
  id: string;
  title: string;
  description?: string;
  time: string;
  type: 'workout' | 'meal' | 'measurement' | 'goal' | 'achievement';
  icon: string;
  iconColor: string;
}

interface DaySection {
  title: string;
  data: ActivityLog[];
}

export default function ActivityLogsScreen() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  const [activities] = useState<DaySection[]>([
    {
      title: '今日',
      data: [
        {
          id: '1',
          title: '朝のワークアウト完了',
          description: '上半身トレーニング 45分',
          time: '08:30',
          type: 'workout',
          icon: 'barbell',
          iconColor: colors.primary,
        },
        {
          id: '2',
          title: '朝食を記録',
          description: 'タンパク質: 25g, カロリー: 450kcal',
          time: '09:15',
          type: 'meal',
          icon: 'restaurant',
          iconColor: colors.mint[500],
        },
        {
          id: '3',
          title: '体重測定',
          description: '70.2 kg (-0.3kg)',
          time: '07:00',
          type: 'measurement',
          icon: 'body',
          iconColor: colors.purple[500],
        },
      ],
    },
    {
      title: '昨日',
      data: [
        {
          id: '4',
          title: '週間目標達成！',
          description: '3回のワークアウトを完了',
          time: '20:00',
          type: 'achievement',
          icon: 'trophy',
          iconColor: colors.yellow[500],
        },
        {
          id: '5',
          title: '夕方のランニング',
          description: '5km, 28分',
          time: '18:30',
          type: 'workout',
          icon: 'walk',
          iconColor: colors.primary,
        },
      ],
    },
  ]);

  const filters = [
    { id: 'all', label: 'すべて', icon: 'apps' },
    { id: 'workout', label: 'ワークアウト', icon: 'barbell' },
    { id: 'meal', label: '食事', icon: 'restaurant' },
    { id: 'measurement', label: '測定', icon: 'body' },
    { id: 'achievement', label: '達成', icon: 'trophy' },
  ];

  const renderActivityItem = ({ item }: { item: ActivityLog }) => (
    <TouchableOpacity style={styles.activityItem}>
      <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}20` }]}>
        <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTime}>{item.time}</Text>
        <Text style={styles.activityTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.activityDescription}>{item.description}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: DaySection }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  return (
    <ScreenWrapper backgroundColor={colors.gray[50]}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>アクティビティログ</Text>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={selectedFilter === item.id ? colors.white : colors.gray[600]}
              />
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === item.id && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <SectionList
        sections={activities}
        renderItem={renderActivityItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.screenHeader,
  },
  screenTitle: {
    ...commonStyles.screenTitle,
    color: colors.gray[900],
  },
  filterContainer: {
    paddingVertical: spacing.lg,
  },
  filterList: {
    paddingHorizontal: layout.screenPadding,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    marginRight: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.small,
    fontWeight: '500',
    color: colors.gray[600],
  },
  filterTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingBottom: spacing.xxxl + spacing.sm,
  },
  sectionHeader: {
    ...typography.cardTitle,
    fontWeight: '600',
    color: colors.gray[900],
    paddingHorizontal: layout.screenPadding,
    paddingTop: layout.screenPadding,
    paddingBottom: spacing.md,
  },
  activityItem: {
    ...commonStyles.listItem,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTime: {
    ...typography.caption,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  activityTitle: {
    ...typography.body,
    fontWeight: '500',
    color: colors.gray[900],
  },
  activityDescription: {
    ...typography.small,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  yellow: {
    500: '#EAB308',
  },
});