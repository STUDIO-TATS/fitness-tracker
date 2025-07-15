'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { 
  getCurrentUser, 
  getWorkouts 
} from '@fitness-tracker/supabase'
import type { User, Workout } from '@fitness-tracker/types'

interface WorkoutStats {
  totalWorkouts: number
  totalDuration: number
  totalExercises: number
  totalSets: number
  averageDuration: number
  workoutsThisWeek: number
  workoutsThisMonth: number
  muscleGroupStats: Array<{ name: string; count: number; color: string }>
  weeklyStats: Array<{ week: string; count: number }>
  monthlyStats: Array<{ month: string; count: number }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16']

export default function WorkoutHistoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [stats, setStats] = useState<WorkoutStats | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6months')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadWorkoutHistory()
  }, [selectedPeriod])

  const loadWorkoutHistory = async () => {
    try {
      const { data: userData, error: userError } = await getCurrentUser()
      if (userError || !userData) {
        router.push('/auth')
        return
      }
      setUser(userData)

      const { data: workoutData, error } = await getWorkouts(userData.id)
      if (error) {
        console.error('ワークアウト履歴の読み込みエラー:', error)
      } else {
        const allWorkouts = workoutData || []
        
        // 期間でフィルター
        const endDate = new Date()
        const startDate = new Date()
        
        switch (selectedPeriod) {
          case '1month':
            startDate.setMonth(endDate.getMonth() - 1)
            break
          case '3months':
            startDate.setMonth(endDate.getMonth() - 3)
            break
          case '6months':
            startDate.setMonth(endDate.getMonth() - 6)
            break
          case '1year':
            startDate.setFullYear(endDate.getFullYear() - 1)
            break
          case 'all':
            startDate.setFullYear(2000) // 全期間
            break
        }

        const filteredWorkouts = allWorkouts.filter(workout => 
          new Date(workout.date) >= startDate && new Date(workout.date) <= endDate
        )
        
        setWorkouts(filteredWorkouts)
        calculateStats(filteredWorkouts)
      }
    } catch (error) {
      console.error('エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (workouts: Workout[]) => {
    const totalWorkouts = workouts.length
    const totalDuration = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0)
    
    let totalExercises = 0
    let totalSets = 0
    const muscleGroups: Record<string, number> = {}

    workouts.forEach(workout => {
      if (workout.workout_exercises) {
        totalExercises += workout.workout_exercises.length
        
        workout.workout_exercises.forEach(we => {
          if (we.sets) {
            totalSets += we.sets.length
          }
          
          if (we.exercise?.muscle_group) {
            muscleGroups[we.exercise.muscle_group] = 
              (muscleGroups[we.exercise.muscle_group] || 0) + 1
          }
        })
      }
    })

    const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0

    // 今週のワークアウト数
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const workoutsThisWeek = workouts.filter(w => new Date(w.date) >= oneWeekAgo).length

    // 今月のワークアウト数
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const workoutsThisMonth = workouts.filter(w => new Date(w.date) >= oneMonthAgo).length

    // 筋肉グループ統計
    const muscleGroupStats = Object.entries(muscleGroups)
      .map(([name, count], index) => ({
        name,
        count,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.count - a.count)

    // 週間統計（過去12週）
    const weeklyStats = []
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - ((i - 1) * 7))
      
      const weekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date)
        return workoutDate >= weekStart && workoutDate < weekEnd
      }).length

      weeklyStats.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        count: weekWorkouts
      })
    }

    // 月間統計（過去12ヶ月）
    const monthlyStats = []
    for (let i = 11; i >= 0; i--) {
      const month = new Date()
      month.setMonth(month.getMonth() - i)
      
      const monthWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date)
        return workoutDate.getMonth() === month.getMonth() && 
               workoutDate.getFullYear() === month.getFullYear()
      }).length

      monthlyStats.push({
        month: `${month.getFullYear()}/${month.getMonth() + 1}`,
        count: monthWorkouts
      })
    }

    setStats({
      totalWorkouts,
      totalDuration,
      totalExercises,
      totalSets,
      averageDuration,
      workoutsThisWeek,
      workoutsThisMonth,
      muscleGroupStats,
      weeklyStats,
      monthlyStats
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-xl font-semibold">
                Fitness Tracker
              </Link>
              <span className="text-gray-500">/</span>
              <Link href="/workouts" className="text-gray-700 dark:text-gray-300 hover:text-gray-900">
                ワークアウト
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-700 dark:text-gray-300">履歴・統計</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">ワークアウト履歴・統計</h1>
          
          <div>
            <label className="block text-sm font-medium mb-2">期間</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="1month">1ヶ月</option>
              <option value="3months">3ヶ月</option>
              <option value="6months">6ヶ月</option>
              <option value="1year">1年</option>
              <option value="all">全期間</option>
            </select>
          </div>
        </div>

        {!stats || stats.totalWorkouts === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">選択した期間にワークアウトデータがありません。</p>
            <Link
              href="/workouts/new"
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              最初のワークアウトを記録
            </Link>
          </div>
        ) : (
          <>
            {/* 統計サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">総ワークアウト数</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalWorkouts}</p>
                <p className="text-sm text-gray-600">回</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">総トレーニング時間</h3>
                <p className="text-3xl font-bold text-green-600">{Math.round(stats.totalDuration / 60)}</p>
                <p className="text-sm text-gray-600">時間</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">総エクササイズ数</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.totalExercises}</p>
                <p className="text-sm text-gray-600">種目</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">総セット数</h3>
                <p className="text-3xl font-bold text-orange-600">{stats.totalSets}</p>
                <p className="text-sm text-gray-600">セット</p>
              </div>
            </div>

            {/* 詳細統計 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">平均ワークアウト時間</h3>
                <p className="text-2xl font-bold">{Math.round(stats.averageDuration)}</p>
                <p className="text-sm text-gray-600">分</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">今週のワークアウト</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.workoutsThisWeek}</p>
                <p className="text-sm text-gray-600">回</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">今月のワークアウト</h3>
                <p className="text-2xl font-bold text-green-600">{stats.workoutsThisMonth}</p>
                <p className="text-sm text-gray-600">回</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* 筋肉グループ別統計 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">筋肉グループ別エクササイズ数</h2>
                {stats.muscleGroupStats.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.muscleGroupStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
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
                ) : (
                  <p className="text-gray-500">データがありません</p>
                )}
              </div>

              {/* 週間ワークアウト数 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">週間ワークアウト数（過去12週）</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.weeklyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 月間ワークアウト数 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">月間ワークアウト数（過去12ヶ月）</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}