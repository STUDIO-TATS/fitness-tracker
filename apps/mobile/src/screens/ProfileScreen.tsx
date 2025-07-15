import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { Text, Card, Button, Input } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'
import { 
  signOut, 
  getProfile, 
  updateProfile,
  getCurrentUser
} from '../lib/supabase'
import type { User, Profile } from '@fitness-tracker/types'
import { useAuth } from '../hooks/useAuth'
import { DrawerLayout } from '../components/DrawerLayout'

export const ProfileScreen = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Form fields
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    if (!user) return
    
    try {
      const { data, error } = await getProfile(user.id)
      if (error) {
        console.error('Error loading profile:', error)
      } else if (data) {
        setProfile(data)
        setDisplayName(data.display_name || '')
        setUsername(data.username || '')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      const updates = {
        display_name: displayName || null,
        username: username || null
      }

      const { data, error } = await updateProfile(user.id, updates)
      if (error) throw error

      setProfile(data)
      setEditing(false)
      Alert.alert('成功', 'プロフィールを更新しました')
    } catch (error: any) {
      Alert.alert('エラー', error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut()
            } catch (error: any) {
              Alert.alert('エラー', error.message)
            }
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <DrawerLayout title="プロフィール">
        <View style={styles.loadingContainer}>
          <Text variant="body">読み込み中...</Text>
        </View>
      </DrawerLayout>
    )
  }

  return (
    <DrawerLayout title="プロフィール">
      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: spacing.lg }}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(profile?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text variant="heading2" weight="semibold">
                {profile?.display_name || 'ユーザー'}
              </Text>
              <Text variant="body" color="gray">
                {user?.email}
              </Text>
              {profile?.username && (
                <Text variant="caption" color="gray">
                  @{profile.username}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(!editing)}
          >
            <Text style={styles.editButtonText}>
              {editing ? 'キャンセル' : '編集'}
            </Text>
          </TouchableOpacity>
        </Card>

        {editing && (
          <Card style={styles.editCard}>
            <Text variant="heading3" weight="semibold" style={styles.editTitle}>
              プロフィール編集
            </Text>

            <Input
              label="表示名"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="表示名を入力"
            />

            <Input
              label="ユーザー名"
              value={username}
              onChangeText={setUsername}
              placeholder="ユーザー名を入力"
              autoCapitalize="none"
            />

            <View style={styles.editActions}>
              <Button
                title="キャンセル"
                onPress={() => {
                  setEditing(false)
                  setDisplayName(profile?.display_name || '')
                  setUsername(profile?.username || '')
                }}
                variant="secondary"
                style={styles.actionButton}
              />
              <Button
                title="保存"
                onPress={handleSaveProfile}
                loading={saving}
                style={styles.actionButton}
              />
            </View>
          </Card>
        )}

        <Card style={styles.statsCard}>
          <Text variant="heading3" weight="semibold" style={styles.statsTitle}>
            アカウント情報
          </Text>
          
          <View style={styles.statRow}>
            <Text variant="body" color="gray">登録日</Text>
            <Text variant="body">
              {user?.created_at 
                ? new Date(user.created_at).toLocaleDateString('ja-JP')
                : '不明'
              }
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text variant="body" color="gray">プロフィール更新日</Text>
            <Text variant="body">
              {profile?.updated_at 
                ? new Date(profile.updated_at).toLocaleDateString('ja-JP')
                : '未更新'
              }
            </Text>
          </View>
        </Card>

        <Card style={styles.settingsCard}>
          <Text variant="heading3" weight="semibold" style={styles.settingsTitle}>
            設定
          </Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text variant="body">🔔 通知設定</Text>
            <Text variant="body" color="gray">></Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text variant="body">📊 データのエクスポート</Text>
            <Text variant="body" color="gray">></Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text variant="body">🔒 プライバシーポリシー</Text>
            <Text variant="body" color="gray">></Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text variant="body">📝 利用規約</Text>
            <Text variant="body" color="gray">></Text>
          </TouchableOpacity>
        </Card>

        <Button
          title="ログアウト"
          onPress={handleSignOut}
          variant="secondary"
          style={styles.signOutButton}
        />

        <View style={styles.footer}>
          <Text variant="caption" color="gray" style={styles.versionText}>
            Fitness Tracker v1.0.0
          </Text>
        </View>
      </ScrollView>
    </DrawerLayout>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  editButton: {
    backgroundColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: colors.gray[700],
    fontWeight: '500',
  },
  editCard: {
    marginBottom: spacing.lg,
  },
  editTitle: {
    marginBottom: spacing.md,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsTitle: {
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  settingsCard: {
    marginBottom: spacing.lg,
  },
  settingsTitle: {
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  signOutButton: {
    marginBottom: spacing.xl,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  versionText: {
    textAlign: 'center',
  },
})