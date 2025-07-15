'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  getCurrentUser, 
  getWorkouts,
  getExercises 
} from '@fitness-tracker/supabase'
import type { User, Workout, Exercise } from '@fitness-tracker/types'

interface OneRepMax {
  exercise: string
  exerciseId: string
  date: string
  weight: number
  reps: number
  oneRM: number
}

interface StrengthProgress {
  exercise: string
  data: Array<{
    date: string
    oneRM: number
    weight: number
    reps: number
  }>
}

// 1RM計算式（Brzycki formula）
const calculateOneRM = (weight: number, reps: number): number => {
  if (reps === 1) return weight
  if (reps > 12) return weight // 12回以上は正確性が低いため
  return weight / (1.0278 - (0.0278 * reps))
}

// Epley formula（代替）
const calculateOneRMEpley = (weight: number, reps: number): number => {
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

export default function StrengthPage() {
  const [user, setUser] = useState<User | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [oneRepMaxes, setOneRepMaxes] = useState<OneRepMax[]>([])
  const [strengthProgress, setStrengthProgress] = useState<StrengthProgress[]>([])
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [loading, setLoading] = useState(true)
  
  // 1RM計算機の状態
  const [calculatorWeight, setCalculatorWeight] = useState<number>(100)
  const [calculatorReps, setCalculatorReps] = useState<number>(5)
  
  const router = useRouter()

  useEffect(() => {
    loadStrengthData()
  }, [])

  useEffect(() => {
    if (oneRepMaxes.length > 0 && !selectedExercise) {
      // 最初のエクササイズを選択
      const firstExercise = strengthProgress[0]?.exercise
      if (firstExercise) {
        setSelectedExercise(firstExercise)
      }
    }
  }, [oneRepMaxes, strengthProgress])

  const loadStrengthData = async () => {
    try {
      const { data: userData, error: userError } = await getCurrentUser()
      if (userError || !userData) {
        router.push('/auth')
        return
      }
      setUser(userData)

      // ワークアウトデータと筋力エクササイズリストを取得
      const [workoutResult, exerciseResult] = await Promise.all([
        getWorkouts(userData.id),
        getExercises()
      ])

      if (workoutResult.data) {
        setWorkouts(workoutResult.data)
        calculateStrengthProgress(workoutResult.data)
      }

      if (exerciseResult.data) {
        // 筋力トレーニングのエクササイズのみフィルター
        const strengthExercises = exerciseResult.data.filter(exercise => 
          exercise.category === 'Strength' && 
          ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'].includes(exercise.muscle_group)
        )
        setExercises(strengthExercises)
      }

    } catch (error) {
      console.error('筋力データの読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStrengthProgress = (workouts: Workout[]) => {
    const oneRMData: OneRepMax[] = []
    const progressData: Record<string, StrengthProgress> = {}

    workouts.forEach(workout => {
      if (!workout.workout_exercises) return

      workout.workout_exercises.forEach(we => {
        if (!we.exercise || !we.sets) return
        
        const exercise = we.exercise
        // 筋力系のエクササイズのみ
        if (exercise.category !== 'Strength') return

        we.sets.forEach(set => {
          if (!set.weight || !set.reps || set.reps < 1 || set.reps > 12) return

          const oneRM = calculateOneRM(set.weight, set.reps)
          
          oneRMData.push({
            exercise: exercise.name,
            exerciseId: exercise.id,
            date: workout.date,
            weight: set.weight,
            reps: set.reps,
            oneRM: Math.round(oneRM * 10) / 10 // 小数点1桁
          })

          // 進捗データ用
          if (!progressData[exercise.name]) {
            progressData[exercise.name] = {
              exercise: exercise.name,
              data: []
            }
          }

          progressData[exercise.name].data.push({
            date: workout.date,
            oneRM: Math.round(oneRM * 10) / 10,
            weight: set.weight,
            reps: set.reps
          })
        })
      })
    })

    // 日付でソートし、同じ日の最大値のみ保持
    Object.keys(progressData).forEach(exerciseName => {
      const data = progressData[exerciseName].data
      
      // 日付でグループ化し、各日の最大1RMを取得
      const dailyMax: Record<string, any> = {}
      data.forEach(item => {
        if (!dailyMax[item.date] || item.oneRM > dailyMax[item.date].oneRM) {
          dailyMax[item.date] = item
        }
      })

      progressData[exerciseName].data = Object.values(dailyMax)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })

    setOneRepMaxes(oneRMData)
    setStrengthProgress(Object.values(progressData).filter(p => p.data.length > 0))
  }

  const getPersonalRecords = () => {
    const records: Record<string, OneRepMax> = {}
    
    oneRepMaxes.forEach(record => {
      if (!records[record.exercise] || record.oneRM > records[record.exercise].oneRM) {
        records[record.exercise] = record
      }
    })

    return Object.values(records).sort((a, b) => b.oneRM - a.oneRM)
  }

  const getSelectedExerciseProgress = () => {
    return strengthProgress.find(p => p.exercise === selectedExercise)?.data || []
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    )
  }

  const personalRecords = getPersonalRecords()
  const selectedProgress = getSelectedExerciseProgress()
  const calculatedOneRM = calculateOneRM(calculatorWeight, calculatorReps)
  const calculatedOneRMEpley = calculateOneRMEpley(calculatorWeight, calculatorReps)

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
              <span className="text-gray-700 dark:text-gray-300">筋力進捗</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">筋力進捗・1RMトラッキング</h1>

        {/* 1RM計算機 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">1RM計算機</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">重量 (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={calculatorWeight}
                    onChange={(e) => setCalculatorWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">レップ数</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={calculatorReps}
                    onChange={(e) => setCalculatorReps(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">計算結果</h3>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">Brzycki式</p>
                  <p className="text-2xl font-bold text-blue-600">{calculatedOneRM.toFixed(1)} kg</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">Epley式</p>
                  <p className="text-2xl font-bold text-green-600">{calculatedOneRMEpley.toFixed(1)} kg</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>※ 1RM（1 Rep Max）は1回だけ挙上できる最大重量の推定値です。</p>
            <p>※ 正確性を保つため、1〜12レップの範囲で計算してください。</p>
          </div>
        </div>

        {personalRecords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">筋力データがありません。</p>
            <p className="text-gray-500 mb-4">重量とレップ数を記録したワークアウトを追加すると、1RMが自動計算されます。</p>
            <Link
              href="/workouts/new"
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              ワークアウトを記録
            </Link>
          </div>
        ) : (
          <>
            {/* パーソナルレコード */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">パーソナルレコード（推定1RM）</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personalRecords.slice(0, 6).map((record) => (
                  <div
                    key={record.exercise}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-lg">{record.exercise}</h3>
                    <p className="text-2xl font-bold text-blue-600">{record.oneRM} kg</p>
                    <p className="text-sm text-gray-600">
                      {record.weight}kg × {record.reps}回
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(record.date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 進捗チャート */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">筋力進捗チャート</h2>
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  {strengthProgress.map((progress) => (
                    <option key={progress.exercise} value={progress.exercise}>
                      {progress.exercise}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProgress.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                      />
                      <YAxis 
                        label={{ value: '1RM (kg)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        labelFormatter={formatDate}
                        formatter={(value: number, name: string) => {
                          if (name === 'oneRM') {
                            return [`${value} kg`, '推定1RM']
                          }
                          return [value, name]
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="oneRM" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">データがありません</p>
                </div>
              )}

              {selectedProgress.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold mb-2">{selectedExercise} の統計</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">最高記録</span>
                      <p className="font-semibold">{Math.max(...selectedProgress.map(p => p.oneRM))} kg</p>
                    </div>
                    <div>
                      <span className="text-gray-600">最新記録</span>
                      <p className="font-semibold">{selectedProgress[selectedProgress.length - 1]?.oneRM} kg</p>
                    </div>
                    <div>
                      <span className="text-gray-600">記録回数</span>
                      <p className="font-semibold">{selectedProgress.length} 回</p>
                    </div>
                    <div>
                      <span className="text-gray-600">進捗</span>
                      <p className="font-semibold">
                        {selectedProgress.length > 1 ? 
                          `${(selectedProgress[selectedProgress.length - 1].oneRM - selectedProgress[0].oneRM).toFixed(1)} kg` :
                          '-'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}