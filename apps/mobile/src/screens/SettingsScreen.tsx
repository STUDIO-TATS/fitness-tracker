import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Switch, Linking } from 'react-native'
import { Text, Card, Button } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'
import { supabase, signOut } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface UserPreferences {
  notifications: boolean
  darkMode: boolean
  language: string
  units: string
  autoSync: boolean
  trackLocation: boolean
}

export const SettingsScreen = () => {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: true,
    darkMode: false,
    language: 'ja',
    units: 'metric',
    autoSync: true,
    trackLocation: false,
  })
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [storageUsage, setStorageUsage] = useState<number>(0)

  useEffect(() => {
    loadUserProfile()
    loadPreferences()
    calculateStorageUsage()
  }, [])

  const loadUserProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setUserProfile(data)
    } catch (error: any) {
      console.error('プロフィール読み込みエラー:', error)
    }
  }

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('userPreferences')
      if (stored) {
        setPreferences(JSON.parse(stored))
      }
    } catch (error) {
      console.error('設定読み込みエラー:', error)
    }
  }

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify(newPreferences))
      setPreferences(newPreferences)
    } catch (error) {
      console.error('設定保存エラー:', error)
      Alert.alert('エラー', '設定の保存に失敗しました')
    }
  }

  const calculateStorageUsage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys()
      let totalSize = 0
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key)
        if (value) {
          totalSize += new Blob([value]).size
        }
      }
      
      setStorageUsage(totalSize / 1024) // KB
    } catch (error) {
      console.error('ストレージ使用量計算エラー:', error)
    }
  }

  const handleLogout = async () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            try {
              await signOut()
              // ナビゲーションは AuthContext で処理される
            } catch (error: any) {
              console.error('ログアウトエラー:', error)
              Alert.alert('エラー', 'ログアウトに失敗しました')
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleClearCache = async () => {
    Alert.alert(
      'キャッシュクリア',
      'キャッシュデータを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys()
              const cacheKeys = keys.filter(key => !key.includes('userPreferences'))
              await AsyncStorage.multiRemove(cacheKeys)
              Alert.alert('完了', 'キャッシュをクリアしました')
              calculateStorageUsage()
            } catch (error) {
              Alert.alert('エラー', 'キャッシュのクリアに失敗しました')
            }
          }
        }
      ]
    )
  }

  const handleExportData = async () => {
    if (!user) return

    Alert.alert(
      'データエクスポート',
      'この機能は現在開発中です',
      [{ text: 'OK' }]
    )
  }

  const handleDeleteAccount = async () => {
    Alert.alert(
      'アカウント削除',
      'アカウントを削除すると、すべてのデータが失われます。この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '確認',
              '本当にアカウントを削除しますか？',
              [
                { text: 'キャンセル', style: 'cancel' },
                {
                  text: '削除',
                  style: 'destructive',
                  onPress: async () => {
                    // 実際の削除処理はここに実装
                    Alert.alert('エラー', 'この機能は現在開発中です')
                  }
                }
              ]
            )
          }
        }
      ]
    )
  }

  const openURL = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('エラー', 'URLを開けませんでした')
    })
  }

  const renderSettingItem = (
    title: string,
    subtitle: string,
    icon: string,
    onPress: () => void,
    rightContent?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <MaterialCommunityIcons name={icon as any} size={24} color={colors.gray[600]} />
      </View>
      <View style={styles.settingContent}>
        <Text variant="body" weight="semibold">{title}</Text>
        <Text variant="caption" color="gray">{subtitle}</Text>
      </View>
      {rightContent || (
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.gray[400]} />
      )}
    </TouchableOpacity>
  )

  const renderSwitchItem = (
    title: string,
    subtitle: string,
    icon: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <MaterialCommunityIcons name={icon as any} size={24} color={colors.gray[600]} />
      </View>
      <View style={styles.settingContent}>
        <Text variant="body" weight="semibold">{title}</Text>
        <Text variant="caption" color="gray">{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.gray[300], true: colors.primary + '40' }}
        thumbColor={value ? colors.primary : colors.gray[500]}
      />
    </View>
  )

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* ユーザー情報 */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={32} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text variant="heading3" weight="bold">
                {userProfile?.display_name || user?.email || 'ユーザー'}
              </Text>
              <Text variant="caption" color="gray">{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* 一般設定 */}
        <Card style={styles.sectionCard}>
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>
            一般設定
          </Text>
          
          {renderSwitchItem(
            '通知',
            'プッシュ通知を有効にする',
            'bell',
            preferences.notifications,
            (value) => savePreferences({ ...preferences, notifications: value })
          )}
          
          {renderSwitchItem(
            'ダークモード',
            '外観をダークテーマにする',
            'theme-light-dark',
            preferences.darkMode,
            (value) => savePreferences({ ...preferences, darkMode: value })
          )}
          
          {renderSwitchItem(
            '自動同期',
            'データを自動的に同期する',
            'sync',
            preferences.autoSync,
            (value) => savePreferences({ ...preferences, autoSync: value })
          )}
          
          {renderSwitchItem(
            '位置情報',
            'トレーニング位置を記録する',
            'map-marker',
            preferences.trackLocation,
            (value) => savePreferences({ ...preferences, trackLocation: value })
          )}
        </Card>

        {/* データ・プライバシー */}
        <Card style={styles.sectionCard}>
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>
            データ・プライバシー
          </Text>
          
          {renderSettingItem(
            'データエクスポート',
            'データをエクスポートする',
            'download',
            handleExportData
          )}
          
          {renderSettingItem(
            'キャッシュクリア',
            `${storageUsage.toFixed(1)} KB使用中`,
            'delete-sweep',
            handleClearCache
          )}
          
          {renderSettingItem(
            'プライバシーポリシー',
            'プライバシーポリシーを確認',
            'shield-account',
            () => openURL('https://example.com/privacy')
          )}
        </Card>

        {/* サポート */}
        <Card style={styles.sectionCard}>
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>
            サポート
          </Text>
          
          {renderSettingItem(
            'ヘルプ・FAQ',
            'よくある質問を確認',
            'help-circle',
            () => openURL('https://example.com/help')
          )}
          
          {renderSettingItem(
            'お問い合わせ',
            'サポートチームに連絡',
            'email',
            () => openURL('mailto:support@example.com')
          )}
          
          {renderSettingItem(
            'アプリについて',
            'バージョン情報',
            'information',
            () => Alert.alert('FitTracker', 'バージョン 1.0.0\n© 2024 FitTracker Inc.')
          )}
        </Card>

        {/* アカウント操作 */}
        <Card style={styles.sectionCard}>
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>
            アカウント
          </Text>
          
          <TouchableOpacity style={styles.dangerItem} onPress={handleLogout}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons name="logout" size={24} color={colors.orange[500]} />
            </View>
            <View style={styles.settingContent}>
              <Text variant="body" weight="semibold" style={{ color: colors.orange[500] }}>
                ログアウト
              </Text>
              <Text variant="caption" color="gray">アカウントからログアウト</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
            <View style={styles.settingIcon}>
              <MaterialCommunityIcons name="delete" size={24} color={colors.red[500]} />
            </View>
            <View style={styles.settingContent}>
              <Text variant="body" weight="semibold" style={{ color: colors.red[500] }}>
                アカウント削除
              </Text>
              <Text variant="caption" color="gray">アカウントを完全に削除</Text>
            </View>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: spacing.md,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  sectionCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
})