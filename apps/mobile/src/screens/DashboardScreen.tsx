import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native'
import { supabase } from '../lib/supabase'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { DrawerLayout } from '../components/DrawerLayout'

const { width } = Dimensions.get('window')

interface Workout {
  id: string
  name: string
  date: string
  duration: number
  notes?: string
}

interface Goal {
  id: string
  title: string
  target_value: number
  current_value: number
  unit: string
  status: string
}

interface BodyMeasurement {
  id: string
  date: string
  weight: number
  body_fat_percentage?: number
}

export function DashboardScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [activeGoals, setActiveGoals] = useState<Goal[]>([])
  const [latestMeasurement, setLatestMeasurement] = useState<BodyMeasurement | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // ユーザー情報を取得
      const { data: { user: userData }, error } = await supabase.auth.getUser()
      
      if (!userData) {
        setLoading(false)
        return
      }
      
      const formattedUser = {
        id: userData.id,
        email: userData.email!,
        created_at: userData.created_at
      }
      setUser(formattedUser)

      if (userData) {
        // 最近のワークアウトを取得
        const { data: workouts } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', userData.id)
          .order('date', { ascending: false })
          .limit(3)
        setRecentWorkouts(workouts || [])

        // アクティブな目標を取得
        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userData.id)
          .eq('status', 'active')
          .limit(3)
        setActiveGoals(goals || [])

        // 最新の体測定データを取得
        const { data: measurements } = await supabase
          .from('body_measurements')
          .select('*')
          .eq('user_id', userData.id)
          .order('date', { ascending: false })
          .limit(1)
        setLatestMeasurement(measurements?.[0] || null)
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  if (loading) {
    return (
      <DrawerLayout title="ダッシュボード">
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </DrawerLayout>
    )
  }

  return (
    <DrawerLayout title="ダッシュボード">
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.greeting}>おはようございます</Text>
          <Text style={styles.userName}>{user?.email || 'ユーザー'}さん</Text>
        </View>

        {/* 今日の統計 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {recentWorkouts.filter(w => w.date === new Date().toISOString().split('T')[0]).length}
            </Text>
            <Text style={styles.statLabel}>今日のトレーニング</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeGoals.length}</Text>
            <Text style={styles.statLabel}>アクティブな目標</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {latestMeasurement ? `${latestMeasurement.weight}kg` : '--'}
            </Text>
            <Text style={styles.statLabel}>現在の体重</Text>
          </View>
        </View>

        {/* 最近のトレーニング */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近のトレーニング</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>すべて見る</Text>
            </TouchableOpacity>
          </View>
          {recentWorkouts.length > 0 ? (
            recentWorkouts.map((workout) => (
              <TouchableOpacity key={workout.id} style={styles.workoutCard}>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDetails}>
                    {formatDate(workout.date)} • {workout.duration}分
                  </Text>
                  {workout.notes && (
                    <Text style={styles.workoutNotes}>{workout.notes}</Text>
                  )}
                </View>
                <View style={styles.workoutIcon}>
                  <MaterialCommunityIcons name="dumbbell" size={20} color="#2563EB" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>まだトレーニングがありません</Text>
            </View>
          )}
        </View>

        {/* 目標の進捗 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>目標の進捗</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>すべて見る</Text>
            </TouchableOpacity>
          </View>
          {activeGoals.length > 0 ? (
            activeGoals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${calculateProgress(goal.current_value, goal.target_value)}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>まだ目標が設定されていません</Text>
            </View>
          )}
        </View>

        {/* 体重の変化 */}
        {latestMeasurement && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>最新の体測定</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>詳細</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.measurementCard}>
              <View style={styles.measurementRow}>
                <Text style={styles.measurementLabel}>体重</Text>
                <Text style={styles.measurementValue}>{latestMeasurement.weight} kg</Text>
              </View>
              {latestMeasurement.body_fat_percentage && (
                <View style={styles.measurementRow}>
                  <Text style={styles.measurementLabel}>体脂肪率</Text>
                  <Text style={styles.measurementValue}>{latestMeasurement.body_fat_percentage}%</Text>
                </View>
              )}
              <Text style={styles.measurementDate}>
                {formatDate(latestMeasurement.date)}
              </Text>
            </View>
          </View>
        )}

        {/* クイックアクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>クイックアクション</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="dumbbell" size={24} color="#2563EB" />
              <Text style={styles.actionText}>トレーニング開始</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Measurement')}
            >
              <MaterialIcons name="assessment" size={24} color="#2563EB" />
              <Text style={styles.actionText}>体測定記録</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Goal')}
            >
              <MaterialIcons name="flag" size={24} color="#2563EB" />
              <Text style={styles.actionText}>目標設定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </DrawerLayout>
  )
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  workoutDetails: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  workoutNotes: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'right',
  },
  measurementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  measurementLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  measurementDate: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
})