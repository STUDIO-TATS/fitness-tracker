'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getCurrentUser, 
  getExercises,
  createWorkoutTemplate,
  addTemplateExercise,
  reorderTemplateExercises
} from '@fitness-tracker/supabase'
import type { 
  User, 
  Exercise, 
  CreateWorkoutTemplateInput, 
  CreateTemplateExerciseInput,
  TemplateCategory,
  DifficultyLevel
} from '@fitness-tracker/types'

interface TemplateExerciseForm extends CreateTemplateExerciseInput {
  tempId: string
  exercise?: Exercise
}

export default function NewTemplatePage() {
  const [user, setUser] = useState<User | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const router = useRouter()

  const [templateData, setTemplateData] = useState<CreateWorkoutTemplateInput>({
    name: '',
    description: '',
    category: 'Custom',
    estimated_duration: 60,
    difficulty_level: 'Beginner',
    is_public: false
  })

  const [templateExercises, setTemplateExercises] = useState<TemplateExerciseForm[]>([])
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [exerciseForm, setExerciseForm] = useState<Omit<TemplateExerciseForm, 'tempId' | 'exercise'>>({
    exercise_id: '',
    order_index: 0,
    suggested_sets: 3,
    suggested_reps_min: 8,
    suggested_reps_max: 12,
    suggested_weight_percentage: 70,
    suggested_rest_seconds: 120,
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: userData, error: userError } = await getCurrentUser()
      if (userError || !userData) {
        router.push('/auth')
        return
      }
      setUser(userData)

      const { data: exerciseData, error } = await getExercises()
      if (error) {
        console.error('エクササイズの読み込みエラー:', error)
      } else {
        setExercises(exerciseData || [])
      }
    } catch (error) {
      console.error('エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateChange = (field: keyof CreateWorkoutTemplateInput, value: any) => {
    setTemplateData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddExercise = () => {
    if (!selectedExercise) return

    const newExercise: TemplateExerciseForm = {
      ...exerciseForm,
      tempId: Date.now().toString(),
      exercise_id: selectedExercise.id,
      order_index: templateExercises.length,
      exercise: selectedExercise
    }

    setTemplateExercises(prev => [...prev, newExercise])
    setShowExerciseModal(false)
    setSelectedExercise(null)
    setExerciseForm({
      exercise_id: '',
      order_index: 0,
      suggested_sets: 3,
      suggested_reps_min: 8,
      suggested_reps_max: 12,
      suggested_weight_percentage: 70,
      suggested_rest_seconds: 120,
      notes: ''
    })
  }

  const handleRemoveExercise = (tempId: string) => {
    setTemplateExercises(prev => 
      prev.filter(ex => ex.tempId !== tempId)
        .map((ex, index) => ({ ...ex, order_index: index }))
    )
  }

  const handleMoveExercise = (tempId: string, direction: 'up' | 'down') => {
    setTemplateExercises(prev => {
      const index = prev.findIndex(ex => ex.tempId === tempId)
      if (index === -1) return prev
      
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= prev.length) return prev
      
      const newList = [...prev]
      const [item] = newList.splice(index, 1)
      newList.splice(newIndex, 0, item)
      
      return newList.map((ex, i) => ({ ...ex, order_index: i }))
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      // テンプレート作成
      const { data: template, error: templateError } = await createWorkoutTemplate(user.id, templateData)
      if (templateError || !template) throw templateError

      // エクササイズ追加
      for (const exercise of templateExercises) {
        const { error } = await addTemplateExercise(template.id, {
          exercise_id: exercise.exercise_id,
          order_index: exercise.order_index,
          suggested_sets: exercise.suggested_sets,
          suggested_reps_min: exercise.suggested_reps_min,
          suggested_reps_max: exercise.suggested_reps_max,
          suggested_weight_percentage: exercise.suggested_weight_percentage,
          suggested_rest_seconds: exercise.suggested_rest_seconds,
          notes: exercise.notes
        })
        if (error) throw error
      }

      router.push('/templates')
    } catch (error: any) {
      alert('保存エラー: ' + error.message)
    } finally {
      setSaving(false)
    }
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
              <Link href="/templates" className="text-gray-700 dark:text-gray-300 hover:text-gray-900">
                テンプレート
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-700 dark:text-gray-300">新規作成</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">新しいワークアウトテンプレート</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本情報 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">基本情報</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">テンプレート名*</label>
                <input
                  type="text"
                  value={templateData.name}
                  onChange={(e) => handleTemplateChange('name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                  placeholder="例: プッシュワークアウト（初心者）"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">カテゴリ</label>
                <select
                  value={templateData.category}
                  onChange={(e) => handleTemplateChange('category', e.target.value as TemplateCategory)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Push">プッシュ</option>
                  <option value="Pull">プル</option>
                  <option value="Legs">レッグ</option>
                  <option value="Upper">上半身</option>
                  <option value="Lower">下半身</option>
                  <option value="Full Body">全身</option>
                  <option value="Cardio">有酸素</option>
                  <option value="Custom">カスタム</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">難易度</label>
                <select
                  value={templateData.difficulty_level}
                  onChange={(e) => handleTemplateChange('difficulty_level', e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Beginner">初心者</option>
                  <option value="Intermediate">中級者</option>
                  <option value="Advanced">上級者</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">推定時間（分）</label>
                <input
                  type="number"
                  value={templateData.estimated_duration || ''}
                  onChange={(e) => handleTemplateChange('estimated_duration', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  placeholder="60"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">説明</label>
              <textarea
                value={templateData.description}
                onChange={(e) => handleTemplateChange('description', e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                rows={3}
                placeholder="このテンプレートの内容や目的を説明してください..."
              />
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={templateData.is_public}
                  onChange={(e) => handleTemplateChange('is_public', e.target.checked)}
                  className="mr-2"
                />
                他のユーザーと共有（公開テンプレート）
              </label>
            </div>
          </div>

          {/* エクササイズ */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">エクササイズ</h2>
              <button
                type="button"
                onClick={() => setShowExerciseModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                エクササイズ追加
              </button>
            </div>

            {templateExercises.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                エクササイズを追加してください
              </p>
            ) : (
              <div className="space-y-4">
                {templateExercises.map((exercise, index) => (
                  <div key={exercise.tempId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{index + 1}. {exercise.exercise?.name}</h3>
                        <p className="text-sm text-gray-600">
                          {exercise.exercise?.muscle_group} - {exercise.exercise?.category}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleMoveExercise(exercise.tempId, 'up')}
                          disabled={index === 0}
                          className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveExercise(exercise.tempId, 'down')}
                          disabled={index === templateExercises.length - 1}
                          className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(exercise.tempId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {exercise.suggested_sets && (
                        <div>
                          <span className="text-gray-500">セット数: </span>
                          <span>{exercise.suggested_sets}</span>
                        </div>
                      )}
                      {exercise.suggested_reps_min && exercise.suggested_reps_max && (
                        <div>
                          <span className="text-gray-500">レップ数: </span>
                          <span>{exercise.suggested_reps_min}-{exercise.suggested_reps_max}</span>
                        </div>
                      )}
                      {exercise.suggested_weight_percentage && (
                        <div>
                          <span className="text-gray-500">重量: </span>
                          <span>{exercise.suggested_weight_percentage}% 1RM</span>
                        </div>
                      )}
                      {exercise.suggested_rest_seconds && (
                        <div>
                          <span className="text-gray-500">休憩: </span>
                          <span>{exercise.suggested_rest_seconds}秒</span>
                        </div>
                      )}
                    </div>
                    
                    {exercise.notes && (
                      <p className="text-sm text-gray-600 mt-2">{exercise.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving || templateExercises.length === 0}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : 'テンプレート保存'}
            </button>
            <Link
              href="/templates"
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-400"
            >
              キャンセル
            </Link>
          </div>
        </form>

        {/* エクササイズ追加モーダル */}
        {showExerciseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">エクササイズを追加</h3>
              
              {/* エクササイズ選択 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">エクササイズ*</label>
                <select
                  value={selectedExercise?.id || ''}
                  onChange={(e) => {
                    const exercise = exercises.find(ex => ex.id === e.target.value)
                    setSelectedExercise(exercise || null)
                  }}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="">エクササイズを選択...</option>
                  {exercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name} ({exercise.muscle_group})
                    </option>
                  ))}
                </select>
              </div>

              {/* エクササイズ設定 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">推奨セット数</label>
                  <input
                    type="number"
                    value={exerciseForm.suggested_sets || ''}
                    onChange={(e) => setExerciseForm(prev => ({ 
                      ...prev, 
                      suggested_sets: parseInt(e.target.value) || undefined 
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    min="1"
                    placeholder="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">休憩時間（秒）</label>
                  <input
                    type="number"
                    value={exerciseForm.suggested_rest_seconds || ''}
                    onChange={(e) => setExerciseForm(prev => ({ 
                      ...prev, 
                      suggested_rest_seconds: parseInt(e.target.value) || undefined 
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    min="0"
                    placeholder="120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">最小レップ数</label>
                  <input
                    type="number"
                    value={exerciseForm.suggested_reps_min || ''}
                    onChange={(e) => setExerciseForm(prev => ({ 
                      ...prev, 
                      suggested_reps_min: parseInt(e.target.value) || undefined 
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    min="1"
                    placeholder="8"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">最大レップ数</label>
                  <input
                    type="number"
                    value={exerciseForm.suggested_reps_max || ''}
                    onChange={(e) => setExerciseForm(prev => ({ 
                      ...prev, 
                      suggested_reps_max: parseInt(e.target.value) || undefined 
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    min="1"
                    placeholder="12"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">推奨重量（1RMの%）</label>
                  <input
                    type="number"
                    value={exerciseForm.suggested_weight_percentage || ''}
                    onChange={(e) => setExerciseForm(prev => ({ 
                      ...prev, 
                      suggested_weight_percentage: parseFloat(e.target.value) || undefined 
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    min="1"
                    max="100"
                    step="0.1"
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">メモ</label>
                <textarea
                  value={exerciseForm.notes}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                  placeholder="フォームのポイントや注意点など..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleAddExercise}
                  disabled={!selectedExercise}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  追加
                </button>
                <button
                  type="button"
                  onClick={() => setShowExerciseModal(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}