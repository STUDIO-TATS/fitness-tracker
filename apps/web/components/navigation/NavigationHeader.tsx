'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Icon from 'react-native-vector-icons/Ionicons'
import DrawerMenu from './DrawerMenu'
import { signOut } from '@fitness-tracker/supabase'

interface NavigationItem {
  name: string
  href: string
}

const desktopNavItems: NavigationItem[] = [
  { name: 'ワークアウト', href: '/workouts' },
  { name: 'テンプレート', href: '/templates' },
  { name: '目標', href: '/goals' },
  { name: '体測定', href: '/measurements' },
  { name: '進捗', href: '/progress' },
  { name: '筋力', href: '/strength' },
  { name: '履歴', href: '/workouts/history' }
]

interface NavigationHeaderProps {
  user: { display_name?: string; email: string } | null
}

export default function NavigationHeader({ user }: NavigationHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* 左側: ロゴ + モバイルメニュー */}
          <div className="flex items-center space-x-4">
            <DrawerMenu user={user} />
            
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FT</span>
              </div>
              <span className="hidden sm:block text-xl font-semibold text-gray-900 dark:text-white">
                Fitness Tracker
              </span>
            </Link>
          </div>

          {/* 中央: デスクトップナビゲーション */}
          <nav className="hidden lg:flex space-x-8">
            {desktopNavItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* 右側: アクション + ユーザーメニュー */}
          <div className="flex items-center space-x-3">
            {/* 検索ボタン（将来の機能用） */}
            <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Icon name="search-outline" size={20} />
            </button>

            {/* 通知ボタン（将来の機能用） */}
            <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
              <Icon name="notifications-outline" size={20} />
              {/* 通知バッジ（例） */}
              {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
            </button>

            {/* ユーザー情報とメニュー */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.display_name || user?.email?.split('@')[0] || 'ゲスト'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ようこそ！
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link
                  href="/profile"
                  className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  <span className="text-sm font-medium">
                    {(user?.display_name || user?.email)?.charAt(0).toUpperCase() || 'G'}
                  </span>
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            </div>

            {/* モバイル用ユーザーアバター */}
            <Link
              href="/profile"
              className="lg:hidden w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400"
            >
              <span className="text-sm font-medium">
                {(user?.display_name || user?.email)?.charAt(0).toUpperCase() || 'G'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}