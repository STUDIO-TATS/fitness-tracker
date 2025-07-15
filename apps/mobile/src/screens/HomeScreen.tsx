import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, Card, Button } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'
import { useNavigation } from '@react-navigation/native'
import { 
  signOut, 
  getWorkouts, 
  getActiveGoals,
  getProfile
} from '../lib/supabase'
import type { Workout, Goal, Profile } from '@fitness-tracker/types'
import { useAuth } from '../hooks/useAuth'
import { DrawerLayout } from '../components/DrawerLayout'

export const HomeScreen = () => {
  const navigation = useNavigation<any>()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [activeGoals, setActiveGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      // Load profile
      const { data: profileData } = await getProfile(user.id)
      if (profileData) {
        setProfile(profileData)
      }

      // Load recent workouts
      const { data: workoutData } = await getWorkouts(user.id)
      if (workoutData) {
        setRecentWorkouts(workoutData.slice(0, 3)) // Show last 3 workouts
      }

      // Load active goals
      const { data: goalData } = await getActiveGoals(user.id)
      if (goalData) {
        setActiveGoals(goalData.slice(0, 2)) // Show top 2 goals
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadDashboardData()
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const getThisWeekWorkoutCount = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    return recentWorkouts.filter(workout => 
      new Date(workout.date) >= oneWeekAgo
    ).length
  }

  const getCompletedGoalsCount = () => {
    return activeGoals.filter(goal => goal.status === 'completed').length
  }

  const menuItems = [
    {
      title: 'ワークアウトを記録',
      description: '今日のトレーニングを記録しよう',
      icon: '💪',
      screen: 'Workout',
      color: colors.primary,
    },
    {
      title: '目標設定',
      description: '目標を設定して達成しよう',
      icon: '🎯',
      screen: 'Goals',
      color: colors.success,
    },
    {
      title: 'プロフィール',
      description: '設定とアカウント管理',
      icon: '👤',
      screen: 'Profile',
      color: colors.warning,
    },
  ]

  if (loading) {
    return (
      <DrawerLayout title="ホーム">
        <View style={styles.loadingContainer}>
          <Text variant="body">読み込み中...</Text>
        </View>
      </DrawerLayout>
    )
  }

  return (
    <DrawerLayout title="ホーム">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        style={{ padding: spacing.lg }}
      >
        <View style={styles.header}>
          <Text variant="heading2" weight="bold">
            {profile?.display_name ? `${profile.display_name}さん、` : ''}おかえりなさい！
          </Text>
          <Text variant="body" color="gray">今日も頑張りましょう</Text>
        </View>

        <View style={styles.stats}>
          <Card style={styles.statCard}>
            <Text variant="heading3" weight="bold" color="primary">
              {getThisWeekWorkoutCount()}
            </Text>
            <Text variant="caption" color="gray">今週のワークアウト</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text variant="heading3" weight="bold" color="success">
              {activeGoals.length}
            </Text>
            <Text variant="caption" color="gray">アクティブな目標</Text>
          </Card>
        </View>

        {/* Recent Workouts */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text variant="heading3" weight="semibold">最近のワークアウト</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Workout')}>
              <Text color="primary">すべて見る</Text>
            </TouchableOpacity>
          </View>
          
          {recentWorkouts.length === 0 ? (
            <View style={styles.emptySection}>
              <Text variant="body" color="gray">まだワークアウトがありません</Text>
              <Text variant="caption" color="gray">最初のワークアウトを記録しましょう！</Text>
            </View>
          ) : (
            recentWorkouts.map((workout) => (
              <View key={workout.id} style={styles.workoutItem}>
                <View style={styles.workoutInfo}>
                  <Text variant="body" weight="semibold">{workout.name}</Text>
                  <Text variant="caption" color="gray">
                    {new Date(workout.date).toLocaleDateString('ja-JP')}
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
            <Text variant="heading3" weight="semibold">アクティブな目標</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
              <Text color="primary">すべて見る</Text>
            </TouchableOpacity>
          </View>
          
          {activeGoals.length === 0 ? (
            <View style={styles.emptySection}>
              <Text variant="body" color="gray">まだ目標がありません</Text>
              <Text variant="caption" color="gray">最初の目標を設定しましょう！</Text>
            </View>
          ) : (
            activeGoals.map((goal) => (
              <View key={goal.id} style={styles.goalItem}>
                <View style={styles.goalInfo}>
                  <Text variant="body" weight="semibold">{goal.title}</Text>
                  {goal.target_value && (
                    <Text variant="caption" color="gray">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </Text>
                  )}
                </View>
                {goal.target_value && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%`
                          }
                        ]}
                      />
                    </View>
                    <Text variant="caption" color="gray">
                      {Math.round((goal.current_value / goal.target_value) * 100)}%
                    </Text>
                  </View>
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
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <View style={styles.menuContent}>
                  <Text variant="heading3" weight="semibold">{item.title}</Text>
                  <Text variant="caption" color="gray">{item.description}</Text>
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
      </ScrollView>
    </DrawerLayout>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: spacing.xl,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  menu: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  menuIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  logoutButton: {
    marginBottom: spacing.lg,
  },
})