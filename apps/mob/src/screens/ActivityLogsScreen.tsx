import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SectionList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import type { ActivityLog as DBActivityLog, Measurement, Goal } from '../types/database';

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
  const { session } = useAuth();
  const { t } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<DaySection[]>([]);

  useEffect(() => {
    fetchActivities();
  }, [session, selectedFilter]);

  const fetchActivities = async () => {
    if (!session?.user?.id) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // アクティビティログを取得
      const { data: activityLogs, error: activityError } = await supabase
        .from('activity_logs')
        .select(`
          *,
          facilities (
            name,
            facility_type
          ),
          activity_types (
            name,
            category
          )
        `)
        .eq('user_id', session.user.id)
        .order('check_in_time', { ascending: false })
        .limit(50);

      if (activityError) throw activityError;

      // 測定記録を取得
      const { data: measurements, error: measurementError } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('measurement_date', { ascending: false })
        .limit(10);

      if (measurementError) throw measurementError;

      // データを統合して表示用に変換
      const combinedActivities = formatActivities(activityLogs || [], measurements || []);
      setActivities(combinedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      Alert.alert(t('common.error'), t('common.dataLoadError'));
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatActivities = (logs: any[], measurements: any[]): DaySection[] => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const sections: { [key: string]: ActivityLog[] } = {
      today: [],
      yesterday: [],
      older: []
    };

    // アクティビティログを処理
    logs.forEach(log => {
      const date = new Date(log.check_in_time);
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

      const activity: ActivityLog = {
        id: log.id,
        title: log.activity_types?.name || log.facilities?.name || 'ワークアウト',
        description: `${log.duration_minutes || 0}分${log.calories_burned ? `, ${log.calories_burned}kcal` : ''}`,
        time: timeStr,
        type: 'workout',
        icon: 'barbell',
        iconColor: colors.primary,
      };

      if (dateStr === todayStr) {
        sections.today.push(activity);
      } else if (dateStr === yesterdayStr) {
        sections.yesterday.push(activity);
      } else {
        sections.older.push(activity);
      }
    });

    // 測定記録を処理
    measurements.forEach(measurement => {
      const date = new Date(measurement.measurement_date);
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

      const activity: ActivityLog = {
        id: measurement.id,
        title: '体重測定',
        description: `${measurement.weight}kg${measurement.body_fat_percentage ? `, 体脂肪率: ${measurement.body_fat_percentage}%` : ''}`,
        time: timeStr,
        type: 'measurement',
        icon: 'body',
        iconColor: colors.purple[500],
      };

      if (dateStr === todayStr) {
        sections.today.push(activity);
      } else if (dateStr === yesterdayStr) {
        sections.yesterday.push(activity);
      } else {
        sections.older.push(activity);
      }
    });

    // セクションを作成
    const result: DaySection[] = [];
    if (sections.today.length > 0) {
      result.push({ title: t('common.today'), data: sections.today });
    }
    if (sections.yesterday.length > 0) {
      result.push({ title: t('common.yesterday'), data: sections.yesterday });
    }
    if (sections.older.length > 0) {
      result.push({ title: t('common.older'), data: sections.older });
    }

    return result;
  };


  const filters = [
    { id: 'all', label: t('activityLogs.filterAll'), icon: 'apps' },
    { id: 'workout', label: t('activityLogs.filterWorkout'), icon: 'barbell' },
    { id: 'measurement', label: t('activityLogs.filterMeasurement'), icon: 'body' },
  ];

  // フィルタリングされたアクティビティを取得
  const getFilteredActivities = (): DaySection[] => {
    if (selectedFilter === 'all') {
      return activities;
    }

    return activities.map(section => ({
      ...section,
      data: section.data.filter(item => item.type === selectedFilter)
    })).filter(section => section.data.length > 0);
  };

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : (
        <SectionList
          sections={getFilteredActivities()}
          renderItem={renderActivityItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('activityLogs.noData')}</Text>
            </View>
          }
        />
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
    color: colors.gray[900],
  },
  filterContainer: {
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.gray[500],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray[500],
  },
});