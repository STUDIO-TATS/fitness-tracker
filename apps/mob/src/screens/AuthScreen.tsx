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
import { testUsers } from '../constants/testUsers';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
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
        Alert.alert('成功', '確認メールを送信しました');
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
        'エラー', 
        `${error.message}\n\n詳細: ${JSON.stringify(error, null, 2)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectTestUser = (user: typeof testUsers[0]) => {
    setEmail(user.email);
    setPassword(user.password);
    setIsSignUp(false);
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

          {!isSignUp && (
            <View style={styles.testUsersSection}>
              <Text style={styles.sectionTitle}>テストユーザーを選択</Text>
              {testUsers.map((user) => (
                <TouchableOpacity
                  key={user.email}
                  style={styles.userButton}
                  onPress={() => selectTestUser(user)}
                >
                  <Text style={styles.userButtonText}>{user.displayName}</Text>
                  <Text style={styles.userEmailText}>{user.email}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.divider} />
            </View>
          )}

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
  testUsersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[700],
    marginBottom: 12,
  },
  userButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.purple[200],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  userButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.purple[700],
  },
  userEmailText: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 20,
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
});