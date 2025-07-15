'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getCurrentUser, 
  getMeasurements, 
  createMeasurement, 
  deleteMeasurement,
  updateMeasurement 
} from '@fitness-tracker/supabase'
import type { User, BodyMeasurement, CreateBodyMeasurementInput } from '@fitness-tracker/types'

export default function MeasurementsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurement | null>(null)
  const [saving, setSaving] = useState(false)
  
  // フォームの状態
  const [formData, setFormData] = useState<CreateBodyMeasurementInput>({
    date: new Date().toISOString().split('T')[0],
    weight: undefined,
    body_fat_percentage: undefined,
    muscle_mass: undefined,
    chest: undefined,
    waist: undefined,
    hips: undefined,
    biceps_left: undefined,
    biceps_right: undefined,
    thigh_left: undefined,
    thigh_right: undefined,
    calf_left: undefined,
    calf_right: undefined,
    notes: ''
  })
  
  const router = useRouter()

  useEffect(() => {
    loadMeasurements()
  }, [])

  const loadMeasurements = async () => {
    try {
      const { data: userData, error: userError } = await getCurrentUser()
      if (userError || !userData) {
        router.push('/auth')
        return
      }
      setUser(userData)

      const { data: measurementData, error } = await getMeasurements(userData.id)
      if (error) {
        console.error('体測定データの読み込みエラー:', error)
      } else {
        setMeasurements(measurementData || [])
      }
    } catch (error) {
      console.error('エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      if (editingMeasurement) {
        // 更新
        const { error } = await updateMeasurement(editingMeasurement.id, formData)
        if (error) throw error
      } else {
        // 新規作成
        const { error } = await createMeasurement(user.id, formData)
        if (error) throw error
      }

      setShowForm(false)
      setEditingMeasurement(null)
      resetForm()
      loadMeasurements()
    } catch (error: any) {
      alert('エラー: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (measurement: BodyMeasurement) => {
    setEditingMeasurement(measurement)
    setFormData({
      date: measurement.date,
      weight: measurement.weight || undefined,
      body_fat_percentage: measurement.body_fat_percentage || undefined,
      muscle_mass: measurement.muscle_mass || undefined,
      chest: measurement.chest || undefined,
      waist: measurement.waist || undefined,
      hips: measurement.hips || undefined,
      biceps_left: measurement.biceps_left || undefined,
      biceps_right: measurement.biceps_right || undefined,
      thigh_left: measurement.thigh_left || undefined,
      thigh_right: measurement.thigh_right || undefined,
      calf_left: measurement.calf_left || undefined,
      calf_right: measurement.calf_right || undefined,
      notes: measurement.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (measurementId: string) => {
    if (!confirm('この体測定記録を削除してもよろしいですか？')) return

    try {
      const { error } = await deleteMeasurement(measurementId)
      if (error) throw error
      loadMeasurements()
    } catch (error: any) {
      alert('削除エラー: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      weight: undefined,
      body_fat_percentage: undefined,
      muscle_mass: undefined,
      chest: undefined,
      waist: undefined,
      hips: undefined,
      biceps_left: undefined,
      biceps_right: undefined,
      thigh_left: undefined,
      thigh_right: undefined,
      calf_left: undefined,
      calf_right: undefined,
      notes: ''
    })
  }

  const handleInputChange = (field: keyof CreateBodyMeasurementInput, value: string) => {
    if (field === 'date' || field === 'notes') {
      setFormData(prev => ({ ...prev, [field]: value }))
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value ? parseFloat(value) : undefined 
      }))
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
              <span className="text-gray-700 dark:text-gray-300">体測定記録</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  setShowForm(true)
                  setEditingMeasurement(null)
                  resetForm()
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                新しい記録
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">体測定記録</h1>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">
              {editingMeasurement ? '記録を編集' : '新しい記録を追加'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">日付</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">体重 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight || ''}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="70.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">体脂肪率 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.body_fat_percentage || ''}
                    onChange={(e) => handleInputChange('body_fat_percentage', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="15.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">筋肉量 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.muscle_mass || ''}
                    onChange={(e) => handleInputChange('muscle_mass', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="55.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">胸囲 (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.chest || ''}
                    onChange={(e) => handleInputChange('chest', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="95.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">ウエスト (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.waist || ''}
                    onChange={(e) => handleInputChange('waist', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="80.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ヒップ (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hips || ''}
                    onChange={(e) => handleInputChange('hips', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="90.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">左上腕 (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.biceps_left || ''}
                    onChange={(e) => handleInputChange('biceps_left', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="32.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">右上腕 (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.biceps_right || ''}
                    onChange={(e) => handleInputChange('biceps_right', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="32.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">左太もも (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.thigh_left || ''}
                    onChange={(e) => handleInputChange('thigh_left', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="55.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">右太もも (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.thigh_right || ''}
                    onChange={(e) => handleInputChange('thigh_right', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="55.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">左ふくらはぎ (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.calf_left || ''}
                    onChange={(e) => handleInputChange('calf_left', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="36.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">右ふくらはぎ (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.calf_right || ''}
                    onChange={(e) => handleInputChange('calf_right', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    placeholder="36.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">メモ</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                  placeholder="今日の調子や気づいたことなど..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingMeasurement(null)
                    resetForm()
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-400"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {measurements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">まだ体測定記録がありません。</p>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingMeasurement(null)
                resetForm()
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              最初の記録を追加
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {measurements.map((measurement) => (
              <div
                key={measurement.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">
                    {new Date(measurement.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(measurement)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(measurement.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      削除
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {measurement.weight && (
                    <div>
                      <span className="text-sm text-gray-500">体重</span>
                      <p className="font-semibold">{measurement.weight} kg</p>
                    </div>
                  )}
                  {measurement.body_fat_percentage && (
                    <div>
                      <span className="text-sm text-gray-500">体脂肪率</span>
                      <p className="font-semibold">{measurement.body_fat_percentage}%</p>
                    </div>
                  )}
                  {measurement.muscle_mass && (
                    <div>
                      <span className="text-sm text-gray-500">筋肉量</span>
                      <p className="font-semibold">{measurement.muscle_mass} kg</p>
                    </div>
                  )}
                  {measurement.chest && (
                    <div>
                      <span className="text-sm text-gray-500">胸囲</span>
                      <p className="font-semibold">{measurement.chest} cm</p>
                    </div>
                  )}
                  {measurement.waist && (
                    <div>
                      <span className="text-sm text-gray-500">ウエスト</span>
                      <p className="font-semibold">{measurement.waist} cm</p>
                    </div>
                  )}
                  {measurement.hips && (
                    <div>
                      <span className="text-sm text-gray-500">ヒップ</span>
                      <p className="font-semibold">{measurement.hips} cm</p>
                    </div>
                  )}
                </div>

                {measurement.notes && (
                  <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <span className="text-sm text-gray-500">メモ</span>
                    <p className="mt-1">{measurement.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}