import React, { useState, useEffect } from 'react'
import { View, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, Card, Button } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface ActivityLog {
  id: string
  check_in_time: string
  check_out_time: string | null
  duration_minutes: number | null
  calories_burned: number | null
  distance_km: number | null
  notes: string | null
  facility: {
    name: string
    facility_type: string
  }
  activity_type: {
    name: string
    category: string
  } | null
  company: {
    name: string
  }
}

interface ActivityStats {
  totalSessions: number
  totalDuration: number
  totalCalories: number
  avgDuration: number
}

export const ActivityLogsScreen = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('week')
  const [stats, setStats] = useState<ActivityStats>({
    totalSessions: 0,
    totalDuration: 0,
    totalCalories: 0,
    avgDuration: 0
  })
  const { user } = useAuth()

  const loadData = async () => {
    if (!user) return

    try {
      let dateFilter = ''
      const now = new Date()
      
      if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFilter = weekAgo.toISOString()
      } else if (filter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        dateFilter = monthAgo.toISOString()
      }

      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          facility:facilities(name, facility_type),
          activity_type:activity_types(name, category),
          company:companies(name)
        `)
        .eq('user_id', user.id)
        .order('check_in_time', { ascending: false })

      if (dateFilter) {
        query = query.gte('check_in_time', dateFilter)
      }

      const { data, error } = await query

      if (error) throw error

      const logs = data || []
      setActivityLogs(logs)

      // 統計の計算
      const totalSessions = logs.length
      const totalDuration = logs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0)
      const totalCalories = logs.reduce((sum, log) => sum + (log.calories_burned || 0), 0)
      const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0

      setStats({
        totalSessions,
        totalDuration,
        totalCalories,
        avgDuration
      })

    } catch (error: any) {
      console.error('アクティビティログ読み込みエラー:', error)
      Alert.alert('エラー', 'アクティビティログの読み込みに失敗しました')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user, filter])

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'training':
        return 'dumbbell'
      case 'swimming':
        return 'pool'
      case 'yoga':
        return 'yoga'
      case 'running':
        return 'run'
      case 'cycling':
        return 'bike'
      default:
        return 'play'
    }
  }

  const getFacilityTypeColor = (type: string) => {
    switch (type) {
      case 'gym':
        return colors.blue[500]
      case 'pool':
        return colors.cyan[500]
      case 'yoga_studio':
        return colors.purple[500]
      case 'exercise_studio':
        return colors.green[500]
      default:
        return colors.gray[500]
    }
  }

  const renderActivityLog = ({ item }: { item: ActivityLog }) => (
    <Card style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={[styles.activityIcon, { backgroundColor: getFacilityTypeColor(item.facility.facility_type) + '20' }]}>
          <MaterialCommunityIcons 
            name={getActivityIcon(item.activity_type?.category || 'training') as any} 
            size={24} 
            color={getFacilityTypeColor(item.facility.facility_type)} 
          />
        </View>
        <View style={styles.activityInfo}>
          <Text variant="body" weight="semibold">
            {item.activity_type?.name || 'フリートレーニング'}
          </Text>
          <Text variant="caption" color="gray">
            {item.facility.name} • {item.company.name}
          </Text>
          <Text variant="caption" color="gray">
            {formatDateTime(item.check_in_time)}
          </Text>
        </View>
      </View>

      <View style={styles.activityStats}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="clock" size={16} color={colors.gray[600]} />
          <Text variant="caption" color="gray">
            {formatDuration(item.duration_minutes)}
          </Text>
        </View>
        
        {item.calories_burned && (
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="fire" size={16} color={colors.orange[500]} />
            <Text variant="caption" color="gray">
              {item.calories_burned}kcal
            </Text>
          </View>
        )}

        {item.distance_km && (
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={16} color={colors.blue[500]} />
            <Text variant="caption" color="gray">
              {item.distance_km}km
            </Text>
          </View>
        )}
      </View>

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text variant="caption" color="gray">
            {item.notes}
          </Text>
        </View>
      )}
    </Card>
  )

  const renderStats = () => (
    <Card style={styles.statsCard}>
      <Text variant="body" weight="semibold" style={styles.statsTitle}>
        {filter === 'week' ? '今週' : filter === 'month' ? '今月' : '全期間'}の統計
      </Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text variant="heading3" weight="bold" color="primary">
            {stats.totalSessions}
          </Text>
          <Text variant="caption" color="gray">セッション</Text>
        </View>
        <View style={styles.statBox}>
          <Text variant="heading3" weight="bold" color="primary">
            {Math.round(stats.totalDuration / 60 * 10) / 10}
          </Text>
          <Text variant="caption" color="gray">時間</Text>
        </View>
        <View style={styles.statBox}>
          <Text variant="heading3" weight="bold" color="primary">
            {stats.totalCalories}
          </Text>
          <Text variant="caption" color="gray">kcal</Text>
        </View>
        <View style={styles.statBox}>
          <Text variant="heading3" weight="bold" color="primary">
            {Math.round(stats.avgDuration)}
          </Text>
          <Text variant="caption" color="gray">平均分</Text>
        </View>
      </View>
    </Card>
  )

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {(['all', 'week', 'month'] as const).map((filterType) => (
        <TouchableOpacity
          key={filterType}
          style={[
            styles.filterButton,
            filter === filterType && styles.filterButtonActive
          ]}
          onPress={() => setFilter(filterType)}
        >
          <Text
            variant="caption"
            weight="medium"
            color={filter === filterType ? 'white' : 'gray'}
          >
            {filterType === 'all' ? '全期間' : filterType === 'week' ? '今週' : '今月'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>読み込み中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading2" weight="bold">アクティビティログ</Text>
        {renderFilterButtons()}
      </View>

      <FlatList
        data={activityLogs}
        keyExtractor={(item) => item.id}
        renderItem={renderActivityLog}
        ListHeaderComponent={renderStats}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="clipboard-text" 
              size={48} 
              color={colors.gray[400]} 
            />
            <Text variant="body" color="gray" style={styles.emptyText}>
              アクティビティログがありません
            </Text>
            <Text variant="caption" color="gray" style={styles.emptySubtext}>
              施設でのトレーニングを開始してください
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  listContainer: {
    padding: spacing.md,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  activityCard: {
    marginBottom: spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  activityInfo: {
    flex: 1,
  },
  activityStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
    marginBottom: spacing.xs,
  },
  notesContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
})