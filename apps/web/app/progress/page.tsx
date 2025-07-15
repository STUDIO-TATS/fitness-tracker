'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { 
  getCurrentUser, 
  getMeasurements, 
  getWorkouts,
  getMeasurementsByDateRange 
} from '@fitness-tracker/supabase'
import type { User, BodyMeasurement, Workout } from '@fitness-tracker/types'

interface ChartData {
  date: string
  weight?: number
  body_fat_percentage?: number
  muscle_mass?: number
  chest?: number
  waist?: number
  workouts?: number
}

export default function ProgressPage() {
  const [user, setUser] = useState<User | null>(null)
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [selectedMetric, setSelectedMetric] = useState<string>('weight')
  const [dateRange, setDateRange] = useState<string>('3months')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadProgressData()
  }, [dateRange])

  const loadProgressData = async () => {
    try {
      const { data: userData, error: userError } = await getCurrentUser()
      if (userError || !userData) {
        router.push('/auth')
        return
      }
      setUser(userData)

      // 日付範囲を計算
      const endDate = new Date()
      const startDate = new Date()
      
      switch (dateRange) {
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
      }

      // データを取得
      const [measurementResult, workoutResult] = await Promise.all([
        getMeasurementsByDateRange(
          userData.id, 
          startDate.toISOString().split('T')[0], 
          endDate.toISOString().split('T')[0]
        ),
        getWorkouts(userData.id)
      ])

      if (measurementResult.data) {
        setMeasurements(measurementResult.data)
      }
      
      if (workoutResult.data) {
        setWorkouts(workoutResult.data.filter(w => 
          new Date(w.date) >= startDate && new Date(w.date) <= endDate
        ))
      }

      // チャート用データを準備
      prepareChartData(measurementResult.data || [], workoutResult.data || [])

    } catch (error) {
      console.error('進捗データの読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const prepareChartData = (measurements: BodyMeasurement[], workouts: Workout[]) => {
    // 日付ごとにワークアウト数をカウント
    const workoutCounts: Record<string, number> = {}
    workouts.forEach(workout => {
      const date = workout.date
      workoutCounts[date] = (workoutCounts[date] || 0) + 1
    })

    // 体測定データを変換
    const data: ChartData[] = measurements.map(measurement => ({
      date: measurement.date,
      weight: measurement.weight || undefined,
      body_fat_percentage: measurement.body_fat_percentage || undefined,
      muscle_mass: measurement.muscle_mass || undefined,
      chest: measurement.chest || undefined,
      waist: measurement.waist || undefined,
      workouts: workoutCounts[measurement.date] || 0
    }))

    // 日付でソート
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    setChartData(data)
  }

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      weight: '体重 (kg)',
      body_fat_percentage: '体脂肪率 (%)',
      muscle_mass: '筋肉量 (kg)',
      chest: '胸囲 (cm)',
      waist: 'ウエスト (cm)',
      workouts: 'ワークアウト数'
    }
    return labels[metric] || metric
  }

  const getLatestValue = (metric: string) => {
    if (metric === 'workouts') {
      return workouts.length
    }
    
    const latest = measurements[measurements.length - 1]
    if (!latest) return null
    
    return latest[metric as keyof BodyMeasurement] || null
  }

  const getPreviousValue = (metric: string) => {
    if (metric === 'workouts') {
      // 前期間のワークアウト数を計算（簡略化）
      return workouts.length
    }
    
    if (measurements.length < 2) return null
    
    const previous = measurements[measurements.length - 2]
    return previous[metric as keyof BodyMeasurement] || null
  }

  const getChangePercentage = (current: number | null, previous: number | null) => {
    if (!current || !previous || previous === 0) return null
    return ((current - previous) / previous) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  const currentValue = getLatestValue(selectedMetric)
  const previousValue = getPreviousValue(selectedMetric)
  const changePercentage = getChangePercentage(
    currentValue as number, 
    previousValue as number
  )

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
              <span className="text-gray-700 dark:text-gray-300">進捗</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/measurements"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                体測定記録
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">進捗チャート</h1>

        {/* 期間選択とメトリック選択 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">期間</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="1month">1ヶ月</option>
                <option value="3months">3ヶ月</option>
                <option value="6months">6ヶ月</option>
                <option value="1year">1年</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">表示項目</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="weight">体重</option>
                <option value="body_fat_percentage">体脂肪率</option>
                <option value="muscle_mass">筋肉量</option>
                <option value="chest">胸囲</option>
                <option value="waist">ウエスト</option>
                <option value="workouts">ワークアウト数</option>
              </select>
            </div>
          </div>

          {/* 統計サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">現在の値</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentValue ? `${currentValue}${selectedMetric === 'body_fat_percentage' ? '%' : selectedMetric === 'workouts' ? '回' : selectedMetric === 'weight' || selectedMetric === 'muscle_mass' ? 'kg' : 'cm'}` : '-'}
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-900 dark:text-green-100">前回からの変化</h3>
              <p className={`text-2xl font-bold ${changePercentage && changePercentage > 0 ? 'text-green-600' : changePercentage && changePercentage < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {changePercentage ? `${changePercentage > 0 ? '+' : ''}${changePercentage.toFixed(1)}%` : '-'}
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100">記録数</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {selectedMetric === 'workouts' ? workouts.length : measurements.length}
              </p>
            </div>
          </div>
        </div>

        {/* チャート */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{getMetricLabel(selectedMetric)}の推移</h2>
          
          {chartData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">表示するデータがありません。</p>
              <Link
                href="/measurements"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
              >
                体測定記録を追加
              </Link>
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {selectedMetric === 'workouts' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
                      formatter={(value: number) => [value, 'ワークアウト数']}
                    />
                    <Bar dataKey={selectedMetric} fill="#3B82F6" />
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
                      formatter={(value: number) => [value, getMetricLabel(selectedMetric)]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={selectedMetric} 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 最近の記録 */}
        {measurements.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">最近の記録</h2>
            <div className="space-y-4">
              {measurements.slice(-5).reverse().map((measurement) => (
                <div
                  key={measurement.id}
                  className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">
                      {new Date(measurement.date).toLocaleDateString('ja-JP')}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {measurement.weight && <span>体重: {measurement.weight}kg</span>}
                      {measurement.body_fat_percentage && <span>体脂肪率: {measurement.body_fat_percentage}%</span>}
                      {measurement.muscle_mass && <span>筋肉量: {measurement.muscle_mass}kg</span>}
                    </div>
                  </div>
                  <Link
                    href="/measurements"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    詳細を見る
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}