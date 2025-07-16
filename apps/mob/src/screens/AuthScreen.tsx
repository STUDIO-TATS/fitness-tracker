import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../constants/colors';
import { useI18n } from '../hooks/useI18n';

// Development test users
const DEV_USERS = [
  { email: 'admin@fittracker.com', password: 'testpass123', name: 'システム管理者' },
  { email: 'staff@fittracker.com', password: 'testpass123', name: 'スタッフ太郎' },
  { email: 'user1@example.com', password: 'testpass123', name: '田中太郎' },
  { email: 'user2@example.com', password: 'testpass123', name: '鈴木花子' },
  { email: 'user3@example.com', password: 'testpass123', name: '佐藤次郎' },
];

export default function AuthScreen() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const isDev = __DEV__; // React Native's development flag

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('common.emailPasswordRequired'));
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert(t('common.success'), t('common.confirmEmailSent'));
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert(
        'ログインエラー', 
        error.message || '認証に失敗しました。メールアドレスとパスワードを確認してください。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevUserSelect = (devEmail: string, devPassword: string) => {
    setEmail(devEmail);
    setPassword(devPassword);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Fitness Tracker</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? '新規登録' : 'ログイン'}
          </Text>

          <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          placeholderTextColor={colors.gray[400]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="パスワード"
          placeholderTextColor={colors.gray[400]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '処理中...' : (isSignUp ? '登録' : 'ログイン')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.switchText}>
            {isSignUp
              ? 'すでにアカウントをお持ちの方はこちら'
              : 'アカウントをお持ちでない方はこちら'}
          </Text>
        </TouchableOpacity>

        {/* Development only: Test user selection */}
        {isDev && !isSignUp && (
          <View style={styles.devSection}>
            <Text style={styles.devTitle}>開発用テストユーザー</Text>
            <View style={styles.devUsersContainer}>
              {DEV_USERS.map((user, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.devUserButton}
                  onPress={() => handleDevUserSelect(user.email, user.password)}
                >
                  <Text style={styles.devUserName}>{user.name}</Text>
                  <Text style={styles.devUserEmail}>{user.email}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.devNote}>※ 開発環境でのみ表示されます</Text>
          </View>
        )}
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pink[50],
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: colors.purple[600],
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    color: colors.gray[900],
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: colors.purple[600],
    fontSize: 14,
  },
  // Development styles
  devSection: {
    marginTop: 40,
    padding: 20,
    backgroundColor: colors.yellow[50],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.yellow[300],
    borderStyle: 'dashed' as const,
  },
  devTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.yellow[800],
    marginBottom: 12,
    textAlign: 'center',
  },
  devUsersContainer: {
    gap: 8,
  },
  devUserButton: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.yellow[300],
    marginBottom: 8,
  },
  devUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 2,
  },
  devUserEmail: {
    fontSize: 12,
    color: colors.gray[600],
  },
  devNote: {
    fontSize: 12,
    color: colors.yellow[700],
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});