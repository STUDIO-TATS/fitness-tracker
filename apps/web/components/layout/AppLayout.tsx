'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import NavigationHeader from '../navigation/NavigationHeader'
import BottomNavigation from '../navigation/BottomNavigation'
import { getCurrentUser } from '@fitness-tracker/supabase'
import type { User } from '@fitness-tracker/types'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const { user, error } = await getCurrentUser()
      if (!error && user) {
        // ユーザーデータを適切な形式に変換
        setUser({
          id: user.id,
          email: user.email || '',
          display_name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.aud || new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('ユーザー情報の取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // 認証が必要ないページ（ログインページなど）
  const isAuthPage = pathname?.startsWith('/auth') || pathname === '/'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-sm">FT</span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
        </div>
      </div>
    )
  }

  // 認証ページではナビゲーションを表示しない
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダーナビゲーション */}
      <NavigationHeader user={user} />
      
      {/* メインコンテンツ */}
      <main className="pb-16 lg:pb-0">
        {children}
      </main>
      
      {/* ボトムナビゲーション（モバイルのみ） */}
      <BottomNavigation />
    </div>
  )
}