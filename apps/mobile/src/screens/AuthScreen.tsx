import React, { useState } from 'react'
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Input, Text, Card } from '@fitness-tracker/ui'
import { signIn, signUp } from '../lib/supabase'
import { colors, spacing } from '@fitness-tracker/ui'

// テストアカウント
const TEST_ACCOUNTS = [
  { label: '一般会員（プレミアム）', email: 'user1@example.com', password: 'User123!' },
  { label: '一般会員（レギュラー）', email: 'user2@example.com', password: 'User123!' },
  { label: '一般会員（VIP）', email: 'user3@example.com', password: 'User123!' },
  { label: '管理者', email: 'admin@fittracker.com', password: 'Admin123!' },
  { label: 'スタッフ', email: 'staff@fittracker.com', password: 'Staff123!' },
]

export const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTestAccounts, setShowTestAccounts] = useState(false)

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert('エラー', 'すべてのフィールドを入力してください')
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, name)
        if (error) throw error
        Alert.alert('成功', '確認メールを送信しました')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
      }
    } catch (error: any) {
      Alert.alert('エラー', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="heading1" weight="bold">FitTracker</Text>
          <Text variant="body" color="gray">フィットネスの進捗を記録しよう</Text>
        </View>

        <Card style={styles.card}>
          <Text variant="heading2" weight="semibold" style={styles.title}>
            {isSignUp ? '新規登録' : 'ログイン'}
          </Text>

          {!isSignUp && (
            <View style={styles.testAccountSection}>
              <TouchableOpacity 
                onPress={() => setShowTestAccounts(!showTestAccounts)}
                style={styles.testAccountToggle}
              >
                <Text variant="caption" color="primary">
                  テストアカウントを選択 {showTestAccounts ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              
              {showTestAccounts && (
                <View style={styles.testAccountList}>
                  {TEST_ACCOUNTS.map((account, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.testAccountItem}
                      onPress={() => {
                        setEmail(account.email)
                        setPassword(account.password)
                        setShowTestAccounts(false)
                      }}
                    >
                      <Text variant="body" weight="medium">{account.label}</Text>
                      <Text variant="caption" color="gray">{account.email}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {isSignUp && (
            <Input
              label="名前"
              value={name}
              onChangeText={setName}
              placeholder="山田太郎"
              autoCapitalize="words"
            />
          )}

          <Input
            label="メールアドレス"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="パスワード"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title={isSignUp ? '登録' : 'ログイン'}
            onPress={handleAuth}
            loading={loading}
            style={styles.button}
          />

          <Button
            title={isSignUp ? 'ログインはこちら' : '新規登録はこちら'}
            onPress={() => setIsSignUp(!isSignUp)}
            variant="secondary"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  testAccountSection: {
    marginBottom: spacing.md,
  },
  testAccountToggle: {
    padding: spacing.sm,
    alignItems: 'center',
  },
  testAccountList: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  testAccountItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
})