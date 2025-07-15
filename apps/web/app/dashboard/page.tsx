'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { 
  getCurrentUser, 
  getWorkouts, 
  getActiveGoals, 
  getMeasurements,
  getExercises 
} from '@fitness-tracker/supabase'
import type { User, Workout, Goal, BodyMeasurement, Exercise } from '@fitness-tracker/types'
import AppLayout from '../../components/layout/AppLayout'

interface DashboardStats {
  totalWorkouts: number
  totalGoals: number
  completedGoals: number
  workoutsThisWeek: number
  workoutsThisMonth: number
  currentStreak: number
  weeklyProgress: Array<{ date: string; count: number }>
  muscleGroupStats: Array<{ name: string; count: number; color: string }>
  recentPRs: Array<{ exercise: string; weight: number; reps: number; date: string }>
  weightProgress: Array<{ date: string; weight: number }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16']

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { user: authUser, error: userError } = await getCurrentUser()
      if (userError || !authUser) {
        router.push('/auth')
        return
      }

      // ユーザーデータを適切な形式に変換
      const userData = {
        id: authUser.id,
        email: authUser.email || '',
        display_name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
        created_at: authUser.created_at || new Date().toISOString(),
        updated_at: authUser.aud || new Date().toISOString()
      }
      
      setUser(userData)

      // Load all data in parallel
      const [workoutResult, goalResult, measurementResult, exerciseResult] = await Promise.all([
        getWorkouts(userData.id),
        getActiveGoals(userData.id),
        getMeasurements(userData.id),
        getExercises()
      ])

      const allWorkouts = workoutResult.data || []
      const allGoals = goalResult.data || []
      const allMeasurements = measurementResult.data || []
      const allExercises = exerciseResult.data || []

      setWorkouts(allWorkouts.slice(0, 5)) // Show last 5 workouts
      setGoals(allGoals)
      setMeasurements(allMeasurements)
      setExercises(allExercises)

      // Calculate comprehensive stats
      calculateDashboardStats(allWorkouts, allGoals, allMeasurements)

    } catch (error) {
      console.error('ダッシュボードデータの読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDashboardStats = (workouts: Workout[], goals: Goal[], measurements: BodyMeasurement[]) => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // 基本統計
    const totalWorkouts = workouts.length
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.status === 'completed').length
    const workoutsThisWeek = workouts.filter(w => new Date(w.date) >= oneWeekAgo).length
    const workoutsThisMonth = workouts.filter(w => new Date(w.date) >= oneMonthAgo).length

    // ストリーク計算
    const currentStreak = calculateWorkoutStreak(workouts)

    // 週間進捗（過去7週）
    const weeklyProgress = []
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - (i - 1) * 7 * 24 * 60 * 60 * 1000)
      const weekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date)
        return workoutDate >= weekStart && workoutDate < weekEnd
      }).length
      
      weeklyProgress.push({
        date: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        count: weekWorkouts
      })
    }

    // 筋肉グループ統計
    const muscleGroups: Record<string, number> = {}
    workouts.forEach(workout => {
      workout.workout_exercises?.forEach(we => {
        if (we.exercise?.muscle_group) {
          muscleGroups[we.exercise.muscle_group] = (muscleGroups[we.exercise.muscle_group] || 0) + 1
        }
      })
    })

    const muscleGroupStats = Object.entries(muscleGroups)
      .map(([name, count], index) => ({
        name,
        count,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // 最近のPR（パーソナルレコード）
    const recentPRs = calculateRecentPRs(workouts).slice(0, 5)

    // 体重進捗（最近30日）
    const recentMeasurements = measurements
      .filter(m => new Date(m.date) >= oneMonthAgo && m.weight)
      .map(m => ({ date: m.date, weight: m.weight! }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setStats({
      totalWorkouts,
      totalGoals,
      completedGoals,
      workoutsThisWeek,
      workoutsThisMonth,
      currentStreak,
      weeklyProgress,
      muscleGroupStats,
      recentPRs,
      weightProgress: recentMeasurements
    })
  }

  const calculateWorkoutStreak = (workouts: Workout[]): number => {
    if (workouts.length === 0) return 0

    const workoutDates = [...new Set(workouts.map(w => w.date))]
      .sort((a, b) => new Date(b).getTime() - new Date(a.getTime()))

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const dateStr of workoutDates) {
      const workoutDate = new Date(dateStr)
      workoutDate.setHours(0, 0, 0, 0)
      
      const dayDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (24 * 60 * 60 * 1000))
      
      if (dayDiff === streak || (streak === 0 && dayDiff <= 1)) {
        streak++
        currentDate = workoutDate
      } else {
        break
      }
    }

    return streak
  }

  const calculateRecentPRs = (workouts: Workout[]) => {
    const prs: Array<{ exercise: string; weight: number; reps: number; date: string; oneRM: number }> = []
    
    workouts.forEach(workout => {
      workout.workout_exercises?.forEach(we => {
        if (we.exercise && we.sets) {
          we.sets.forEach(set => {
            if (set.weight && set.reps && set.reps <= 12) {
              const oneRM = set.reps === 1 ? set.weight : set.weight / (1.0278 - (0.0278 * set.reps))
              prs.push({
                exercise: we.exercise!.name,
                weight: set.weight,
                reps: set.reps,
                date: workout.date,
                oneRM: Math.round(oneRM * 10) / 10
              })
            }
          })
        }
      })
    })

    // 各エクササイズの最高記録を取得
    const exercisePRs: Record<string, typeof prs[0]> = {}
    prs.forEach(pr => {
      if (!exercisePRs[pr.exercise] || pr.oneRM > exercisePRs[pr.exercise].oneRM) {
        exercisePRs[pr.exercise] = pr
      }
    })

    return Object.values(exercisePRs)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(({ oneRM, ...rest }) => rest)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">読み込み中...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">おかえりなさい！</h2>

        {/* 統計サマリー */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">今週のワークアウト</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.workoutsThisWeek}</p>
              <p className="text-sm text-gray-600">回</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">連続日数</h3>
              <p className="text-3xl font-bold text-green-600">{stats.currentStreak}</p>
              <p className="text-sm text-gray-600">日</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">アクティブな目標</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalGoals - stats.completedGoals}</p>
              <p className="text-sm text-gray-600">個</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">総ワークアウト数</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.totalWorkouts}</p>
              <p className="text-sm text-gray-600">回</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 週間進捗チャート */}
          {stats && stats.weeklyProgress.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">週間ワークアウト進捗</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 筋肉グループ統計 */}
          {stats && stats.muscleGroupStats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">筋肉グループ別統計</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.muscleGroupStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={100}
                      dataKey="count"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.muscleGroupStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 体重進捗 */}
          {stats && stats.weightProgress.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">体重進捗（最近30日）</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.weightProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={formatDate}
                      formatter={(value: number) => [`${value} kg`, '体重']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 最近のパーソナルレコード */}
          {stats && stats.recentPRs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">最近のパーソナルレコード</h3>
                <Link href="/strength" className="text-blue-600 hover:text-blue-700 text-sm">
                  すべて見る
                </Link>
              </div>
              <div className="space-y-3">
                {stats.recentPRs.map((pr, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium">{pr.exercise}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pr.weight}kg × {pr.reps}回
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(pr.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 最近のワークアウト */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">最近のワークアウト</h3>
              <Link href="/workouts" className="text-blue-600 hover:text-blue-700">
                すべて見る
              </Link>
            </div>
            
            {workouts.length === 0 ? (
              <p className="text-gray-500">まだワークアウトがありません。フィットネスの旅を始めましょう！</p>
            ) : (
              <ul className="space-y-3">
                {workouts.map((workout) => (
                  <li key={workout.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{workout.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(workout.date)}
                      </p>
                    </div>
                    {workout.duration && (
                      <span className="text-sm text-gray-500">{workout.duration} 分</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            
            <Link
              href="/workouts/new"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              ワークアウト開始
            </Link>
          </div>

          {/* アクティブな目標 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">アクティブな目標</h3>
              <Link href="/goals" className="text-blue-600 hover:text-blue-700">
                すべて見る
              </Link>
            </div>
            
            {goals.length === 0 ? (
              <p className="text-gray-500">アクティブな目標がありません。目標を設定してモチベーションを保ちましょう！</p>
            ) : (
              <ul className="space-y-3">
                {goals.map((goal) => (
                  <li key={goal.id}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium">{goal.title}</p>
                      <span className="text-sm text-gray-500">
                        {goal.current_value}/{goal.target_value} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (goal.current_value / (goal.target_value || 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            <Link
              href="/goals/new"
              className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              新しい目標設定
            </Link>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">クイックアクション</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/workouts/new"
              className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
            >
              <div className="text-2xl mb-2">🏋️</div>
              <div className="font-medium">ワークアウト開始</div>
            </Link>
            
            <Link
              href="/measurements"
              className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors"
            >
              <div className="text-2xl mb-2">📏</div>
              <div className="font-medium">体測定記録</div>
            </Link>
            
            <Link
              href="/goals/new"
              className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium">目標設定</div>
            </Link>
            
            <Link
              href="/progress"
              className="bg-orange-600 text-white p-4 rounded-lg text-center hover:bg-orange-700 transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">進捗確認</div>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}