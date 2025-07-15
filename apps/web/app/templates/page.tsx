'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getCurrentUser, 
  getWorkoutTemplates, 
  deleteWorkoutTemplate,
  duplicateTemplate,
  createWorkoutFromTemplate
} from '@fitness-tracker/supabase'
import type { User, WorkoutTemplate } from '@fitness-tracker/types'

export default function TemplatesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showPublicOnly, setShowPublicOnly] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadTemplates()
  }, [selectedCategory, showPublicOnly])

  const loadTemplates = async () => {
    try {
      const { data: userData, error: userError } = await getCurrentUser()
      if (userError || !userData) {
        router.push('/auth')
        return
      }
      setUser(userData)

      const { data: templateData, error } = await getWorkoutTemplates(userData.id)
      if (error) {
        console.error('テンプレートの読み込みエラー:', error)
      } else {
        let filteredTemplates = templateData || []
        
        // カテゴリフィルター
        if (selectedCategory !== 'all') {
          filteredTemplates = filteredTemplates.filter(t => t.category === selectedCategory)
        }
        
        // 公開テンプレートのみ表示
        if (showPublicOnly) {
          filteredTemplates = filteredTemplates.filter(t => t.is_public)
        }
        
        setTemplates(filteredTemplates)
      }
    } catch (error) {
      console.error('エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('このテンプレートを削除してもよろしいですか？')) return

    try {
      const { error } = await deleteWorkoutTemplate(templateId)
      if (error) throw error
      loadTemplates()
    } catch (error: any) {
      alert('削除エラー: ' + error.message)
    }
  }

  const handleDuplicate = async (templateId: string, templateName: string) => {
    if (!user) return

    try {
      const { data, error } = await duplicateTemplate(templateId, user.id, `${templateName} (コピー)`)
      if (error) throw error
      loadTemplates()
      alert('テンプレートを複製しました')
    } catch (error: any) {
      alert('複製エラー: ' + error.message)
    }
  }

  const handleUseTemplate = async (templateId: string, templateName: string) => {
    if (!user) return

    try {
      const { data, error } = await createWorkoutFromTemplate(user.id, templateId, {
        name: templateName,
        date: new Date().toISOString().split('T')[0]
      })
      if (error) throw error
      
      router.push(`/workouts/${data?.id}`)
    } catch (error: any) {
      alert('ワークアウト作成エラー: ' + error.message)
    }
  }

  const getDifficultyColor = (level?: string | null) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (level?: string | null) => {
    switch (level) {
      case 'Beginner': return '初心者'
      case 'Intermediate': return '中級者'
      case 'Advanced': return '上級者'
      default: return '不明'
    }
  }

  const getCategoryLabel = (category?: string | null) => {
    const labels: Record<string, string> = {
      'Push': 'プッシュ',
      'Pull': 'プル',
      'Legs': 'レッグ',
      'Upper': '上半身',
      'Lower': '下半身',
      'Full Body': '全身',
      'Cardio': '有酸素',
      'Custom': 'カスタム'
    }
    return labels[category || ''] || category || 'その他'
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
              <span className="text-gray-700 dark:text-gray-300">ワークアウトテンプレート</span>
            </div>
            <div className="flex items-center">
              <Link
                href="/templates/new"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                新しいテンプレート
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">ワークアウトテンプレート</h1>

        {/* フィルター */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">カテゴリ</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="all">すべて</option>
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
            
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showPublicOnly}
                  onChange={(e) => setShowPublicOnly(e.target.checked)}
                  className="mr-2"
                />
                公開テンプレートのみ表示
              </label>
            </div>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">テンプレートがありません。</p>
            <Link
              href="/templates/new"
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              最初のテンプレートを作成
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                    <div className="flex gap-2 mb-2">
                      {template.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {getCategoryLabel(template.category)}
                        </span>
                      )}
                      {template.difficulty_level && (
                        <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(template.difficulty_level)}`}>
                          {getDifficultyLabel(template.difficulty_level)}
                        </span>
                      )}
                      {template.is_public && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          公開
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {template.user_id === user?.id && (
                    <div className="flex gap-1">
                      <Link
                        href={`/templates/${template.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:text-red-700 text-sm ml-2"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>

                {template.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {template.description}
                  </p>
                )}

                <div className="text-sm text-gray-500 mb-4">
                  <div className="flex justify-between">
                    <span>エクササイズ数: {template.template_exercises?.length || 0}</span>
                    {template.estimated_duration && (
                      <span>推定時間: {template.estimated_duration}分</span>
                    )}
                  </div>
                </div>

                {template.template_exercises && template.template_exercises.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">エクササイズ:</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {template.template_exercises.slice(0, 3).map((te) => (
                        <li key={te.id} className="flex justify-between">
                          <span>{te.exercise?.name}</span>
                          {te.suggested_sets && (
                            <span>{te.suggested_sets}セット</span>
                          )}
                        </li>
                      ))}
                      {template.template_exercises.length > 3 && (
                        <li className="text-gray-500">
                          ...他{template.template_exercises.length - 3}種目
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template.id, template.name)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    ワークアウト開始
                  </button>
                  
                  <button
                    onClick={() => handleDuplicate(template.id, template.name)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
                  >
                    複製
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}