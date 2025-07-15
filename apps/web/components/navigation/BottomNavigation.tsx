'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from 'react-native-vector-icons/Ionicons'

interface BottomNavItem {
  name: string
  href: string
  icon: string
  badge?: number
}

const bottomNavItems: BottomNavItem[] = [
  { 
    name: 'ホーム', 
    href: '/dashboard', 
    icon: 'home-outline'
  },
  { 
    name: 'ワークアウト', 
    href: '/workouts', 
    icon: 'barbell-outline'
  },
  { 
    name: 'テンプレート', 
    href: '/templates', 
    icon: 'document-text-outline'
  },
  { 
    name: '目標', 
    href: '/goals', 
    icon: 'trophy-outline'
  },
  { 
    name: 'プロフィール', 
    href: '/profile', 
    icon: 'person-outline'
  }
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30">
      <div className="grid grid-cols-5 h-16">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center px-1 py-2 text-xs font-medium transition-colors relative ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="relative">
                <Icon 
                  name={isActive ? item.icon.replace('-outline', '') : item.icon}
                  size={24}
                  color={isActive ? '#2563EB' : '#6B7280'}
                  style={{ marginBottom: 4 }}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`leading-none ${isActive ? 'font-semibold' : ''}`}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-b-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}