'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from 'react-native-vector-icons/Ionicons'
import { signOut } from '@fitness-tracker/supabase'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const QRScanner = dynamic(() => import('./QRScanner'), {
  ssr: false,
})

interface NavigationItem {
  name: string
  href: string
  icon: string
  description?: string
}

const navigationItems: NavigationItem[] = [
  { name: 'ダッシュボード', href: '/dashboard', icon: 'home-outline', description: 'ホーム画面' },
  { name: 'ワークアウト', href: '/workouts', icon: 'barbell-outline', description: 'トレーニング記録' },
  { name: 'テンプレート', href: '/templates', icon: 'document-text-outline', description: 'ワークアウトテンプレート' },
  { name: '目標', href: '/goals', icon: 'trophy-outline', description: '目標設定と追跡' },
  { name: '体測定', href: '/measurements', icon: 'scale-outline', description: '体重・体組成記録' },
  { name: '進捗', href: '/progress', icon: 'analytics-outline', description: '進捗分析' },
  { name: '筋力', href: '/strength', icon: 'fitness-outline', description: '筋力記録・1RM' },
  { name: '履歴', href: '/workouts/history', icon: 'time-outline', description: 'ワークアウト履歴' },
  { name: 'プロフィール', href: '/profile', icon: 'person-outline', description: 'ユーザー情報' }
]

interface DrawerMenuProps {
  user: { display_name?: string; email: string } | null
}

export default function DrawerMenu({ user }: DrawerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* メニューボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        aria-label="メニューを開く"
      >
        <Icon name="menu-outline" size={24} />
      </button>

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* ドロワーメニュー */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FT</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Fitness Tracker
                </h2>
                {user && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.display_name || user.email}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={closeMenu}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="メニューを閉じる"
            >
              <Icon name="close-outline" size={24} />
            </button>
          </div>

          {/* ナビゲーションリスト */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon
                    name={isActive ? item.icon.replace('-outline', '') : item.icon}
                    size={20}
                    color={isActive ? '#3B82F6' : '#9CA3AF'}
                    style={{ marginRight: 12 }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* QRスキャナー */}
          {showQRScanner && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <QRScanner onClose={() => setShowQRScanner(false)} />
            </div>
          )}

          {/* フッター */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
            <button
              onClick={() => setShowQRScanner(!showQRScanner)}
              className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Icon name="qr-code-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
              QRコードスキャン
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Icon name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 12 }} />
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </>
  )
}