import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

interface Activity {
  id: string;
  type: string;
  duration: number;
  facility: string;
  calories: number;
  notes?: string;
  time: string;
}

interface DayActivity {
  date: string;
  activities: Activity[];
  totalDuration: number;
  totalCalories: number;
}

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activitiesData, setActivitiesData] = useState<{ [key: string]: DayActivity }>({});

  useEffect(() => {
    generateMockData();
  }, [currentDate]);

  const generateMockData = () => {
    const data: { [key: string]: DayActivity } = {};
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // モックデータの生成
    const mockActivities = [
      { type: 'ランニング', facility: '秋川体育館', duration: 45, calories: 320 },
      { type: '筋力トレーニング', facility: 'フィットネスワールド渋谷店', duration: 60, calories: 280 },
      { type: '水泳', facility: 'あきる野市民プール', duration: 30, calories: 240 },
      { type: 'ヨガ', facility: 'ヘルシーライフ青山スタジオ', duration: 75, calories: 180 },
      { type: 'バスケットボール', facility: '秋川体育館', duration: 90, calories: 450 },
      { type: 'エアロビクス', facility: '五日市ファインプラザ', duration: 50, calories: 300 },
    ];

    // ランダムにアクティビティを配置
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getMonth() === month && Math.random() > 0.7) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const numActivities = Math.floor(Math.random() * 3) + 1;
        const dayActivities: Activity[] = [];
        let totalDuration = 0;
        let totalCalories = 0;

        for (let i = 0; i < numActivities; i++) {
          const activity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
          const time = `${String(9 + Math.floor(Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
          
          const activityData: Activity = {
            id: `${dateStr}-${i}`,
            type: activity.type,
            duration: activity.duration + Math.floor(Math.random() * 20) - 10,
            facility: activity.facility,
            calories: activity.calories + Math.floor(Math.random() * 50) - 25,
            time: time,
            notes: Math.random() > 0.7 ? '良いワークアウトでした！' : undefined,
          };

          dayActivities.push(activityData);
          totalDuration += activityData.duration;
          totalCalories += activityData.calories;
        }

        data[dateStr] = {
          date: dateStr,
          activities: dayActivities,
          totalDuration,
          totalCalories,
        };
      }
    }

    setActivitiesData(data);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // 月曜日スタート: 日曜日=0を月曜日=0に変換
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const hasActivity = (date: Date) => {
    const dateKey = formatDateKey(date);
    return activitiesData[dateKey] !== undefined;
  };

  const handleDatePress = (date: Date) => {
    const dateKey = formatDateKey(date);
    if (activitiesData[dateKey]) {
      setSelectedDate(dateKey);
      setModalVisible(true);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ランニング':
        return 'walk';
      case '筋力トレーニング':
        return 'barbell';
      case '水泳':
        return 'water';
      case 'ヨガ':
        return 'flower';
      case 'バスケットボール':
        return 'basketball';
      case 'エアロビクス':
        return 'fitness';
      default:
        return 'fitness';
    }
  };

  const renderDay = (date: Date) => {
    const isCurrentMonthDay = isCurrentMonth(date);
    const isDateToday = isToday(date);
    const hasActivityOnDate = hasActivity(date);

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[
          styles.dayCell,
          !isCurrentMonthDay && styles.otherMonthDay,
          isDateToday && styles.today,
          hasActivityOnDate && styles.hasActivity,
        ]}
        onPress={() => handleDatePress(date)}
        disabled={!hasActivityOnDate}
      >
        <Text
          style={[
            styles.dayText,
            !isCurrentMonthDay && styles.otherMonthText,
            isDateToday && styles.todayText,
            hasActivityOnDate && styles.activityText,
          ]}
        >
          {date.getDate()}
        </Text>
        {hasActivityOnDate && (
          <View style={styles.activityIndicator}>
            <View style={styles.activityDot} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <View style={styles.activityIconContainer}>
          <Ionicons
            name={getActivityIcon(item.type) as any}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityType}>{item.type}</Text>
          <Text style={styles.activityTime}>{item.time}</Text>
        </View>
        <View style={styles.activityStats}>
          <Text style={styles.activityDuration}>{item.duration}分</Text>
          <Text style={styles.activityCalories}>{item.calories}kcal</Text>
        </View>
      </View>
      <Text style={styles.activityFacility}>{item.facility}</Text>
      {item.notes && <Text style={styles.activityNotes}>{item.notes}</Text>}
    </View>
  );

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long' 
  });

  const selectedDayData = selectedDate ? activitiesData[selectedDate] : null;

  return (
    <ScreenWrapper backgroundColor={colors.purple[50]} scrollable>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>アクティビティカレンダー</Text>
      </View>

      {/* 月ナビゲーション */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <Ionicons name="chevron-back" size={24} color={colors.purple[600]} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{monthYear}</Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.purple[600]} />
        </TouchableOpacity>
      </View>

      {/* 曜日ヘッダー */}
      <View style={styles.weekHeader}>
        {['月', '火', '水', '木', '金', '土', '日'].map((day, index) => (
          <View key={day} style={styles.weekDayCell}>
            <Text style={[
              styles.weekDayText,
              index === 5 && styles.saturdayText,
              index === 6 && styles.sundayText,
            ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* カレンダーグリッド */}
      <View style={styles.calendar}>
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map(renderDay)}
          </View>
        ))}
      </View>

      {/* 統計情報 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color={colors.mint[600]} />
          <Text style={styles.statNumber}>
            {Object.keys(activitiesData).length}
          </Text>
          <Text style={styles.statLabel}>活動日数</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>
            {Object.values(activitiesData).reduce((total, day) => total + day.totalDuration, 0)}
          </Text>
          <Text style={styles.statLabel}>総運動時間(分)</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color={colors.yellow[600]} />
          <Text style={styles.statNumber}>
            {Object.values(activitiesData).reduce((total, day) => total + day.totalCalories, 0)}
          </Text>
          <Text style={styles.statLabel}>総消費カロリー</Text>
        </View>
      </View>

      {/* アクティビティ詳細モーダル */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate && new Date(selectedDate).toLocaleDateString('ja-JP', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>

            {selectedDayData && (
              <>
                <View style={styles.dayStatsContainer}>
                  <View style={styles.dayStat}>
                    <Text style={styles.dayStatNumber}>{selectedDayData.totalDuration}</Text>
                    <Text style={styles.dayStatLabel}>分</Text>
                  </View>
                  <View style={styles.dayStat}>
                    <Text style={styles.dayStatNumber}>{selectedDayData.totalCalories}</Text>
                    <Text style={styles.dayStatLabel}>kcal</Text>
                  </View>
                  <View style={styles.dayStat}>
                    <Text style={styles.dayStatNumber}>{selectedDayData.activities.length}</Text>
                    <Text style={styles.dayStatLabel}>活動</Text>
                  </View>
                </View>

                <FlatList
                  data={selectedDayData.activities}
                  renderItem={renderActivityItem}
                  keyExtractor={(item) => item.id}
                  style={styles.activitiesList}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: layout.screenPadding,
    paddingBottom: spacing.md,
  },
  screenTitle: {
    ...typography.screenTitle,
    color: colors.purple[700],
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  monthTitle: {
    ...typography.sectionTitle,
    color: colors.gray[900],
    fontWeight: 'bold',
  },
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.sm,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  weekDayText: {
    ...typography.small,
    color: colors.gray[600],
    fontWeight: '600',
  },
  sundayText: {
    color: colors.pink[600],
  },
  saturdayText: {
    color: colors.purple[600],
  },
  calendar: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    margin: 1,
    borderRadius: borderRadius.sm,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  today: {
    backgroundColor: colors.purple[100],
  },
  hasActivity: {
    backgroundColor: colors.primary + '20',
  },
  dayText: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '500',
  },
  otherMonthText: {
    color: colors.gray[400],
  },
  todayText: {
    color: colors.purple[700],
    fontWeight: 'bold',
  },
  activityText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  activityIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.mint[500],
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  statNumber: {
    ...typography.cardTitle,
    color: colors.gray[900],
    fontWeight: 'bold',
    fontSize: 20,
    marginVertical: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray[600],
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.sectionTitle,
    color: colors.gray[900],
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  dayStat: {
    alignItems: 'center',
  },
  dayStatNumber: {
    ...typography.cardTitle,
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 24,
  },
  dayStatLabel: {
    ...typography.small,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  activitiesList: {
    paddingHorizontal: spacing.xl,
  },
  activityItem: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '600',
  },
  activityTime: {
    ...typography.small,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  activityStats: {
    alignItems: 'flex-end',
  },
  activityDuration: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  activityCalories: {
    ...typography.caption,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  activityFacility: {
    ...typography.small,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  activityNotes: {
    ...typography.small,
    color: colors.gray[700],
    fontStyle: 'italic',
  },
});