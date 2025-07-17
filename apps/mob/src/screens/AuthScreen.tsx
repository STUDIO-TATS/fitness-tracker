import React, { useState, useEffect } from 'react';
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
  Modal,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { colors } from '../constants/colors';
import { useI18n } from '../hooks/useI18n';
import { guestDataService } from '../services/guestDataService';

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
  const [hasBackup, setHasBackup] = useState(false);
  const [showRestoreOption, setShowRestoreOption] = useState(false);
  const [showGuestSetup, setShowGuestSetup] = useState(false);
  const [guestName, setGuestName] = useState('ゲストユーザー');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isDev = __DEV__; // React Native's development flag

  useEffect(() => {
    checkForBackup();
  }, []);

  const checkForBackup = async () => {
    const backup = await guestDataService.hasBackup();
    setHasBackup(backup);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

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

  const handleContinueAsGuest = async (restoreData = false) => {
    if (restoreData && hasBackup) {
      // データ復元の場合は直接ログイン
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        
        if (data.user) {
          const backup = await guestDataService.getGuestBackup();
          if (backup) {
            await guestDataService.restoreGuestData(data.user.id, backup);
            Alert.alert('成功', '以前のゲストデータを復元しました！');
          }
        }
      } catch (error: any) {
        console.error('Error restoring guest data:', error);
        Alert.alert('復元エラー', 'データの復元に失敗しました。新しいゲストとして開始します。');
        setShowGuestSetup(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      // 新規ゲストの場合はプロフィール設定画面を表示
      setShowGuestSetup(true);
    }
  };

  const handleRestoreBackup = () => {
    Alert.alert(
      'データ復元',
      '以前のゲストデータが見つかりました。復元しますか？',
      [
        { text: '新しく開始', onPress: () => handleContinueAsGuest(false) },
        { text: '復元して開始', onPress: () => handleContinueAsGuest(true) },
      ]
    );
  };

  const handleGuestProfileSave = async () => {
    if (!guestName.trim()) {
      Alert.alert('エラー', '名前を入力してください。');
      return;
    }

    if (!dateOfBirth) {
      Alert.alert('エラー', '生年月日を選択してください。');
      return;
    }

    const formattedDate = formatDate(dateOfBirth);
    const age = calculateAge(dateOfBirth);
    
    // 入力内容の確認
    Alert.alert(
      '設定内容の確認',
      `以下の内容で設定します。よろしいですか？\n\n【お名前】\n${guestName.trim()}\n\n【生年月日】\n${formattedDate} （${age}歳）\n\n※生年月日は後で変更できません`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '設定を完了', onPress: saveGuestProfile, style: 'default' },
      ]
    );
  };

  const saveGuestProfile = async () => {
    if (!dateOfBirth) return;
    
    setIsLoading(true);
    try {
      // Supabaseの匿名認証を使用
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      
      if (data.user) {
        const dateString = dateOfBirth.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // プロフィールを作成
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: data.user.id,
            display_name: guestName.trim(),
            date_of_birth: dateString,
            preferences: {
              isAnonymous: true,
              profileSetupCompleted: true,
              createdAt: new Date().toISOString(),
            },
          }, {
            onConflict: 'user_id',
          });
          
        if (profileError) {
          console.error('Error creating guest profile:', profileError);
          throw profileError;
        }

        Alert.alert('完了', 'プロフィールを設定しました！');
        setShowGuestSetup(false);
      }
    } catch (error: any) {
      console.error('Error creating guest profile:', error);
      Alert.alert('エラー', 'プロフィールの作成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // ゲストプロフィール設定画面の条件分岐
  if (showGuestSetup) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
        <ScrollView 
          contentContainerStyle={styles.guestContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.guestHeader}>
            <View style={styles.guestTitleContainer}>
              <Ionicons name="person-add" size={32} color={colors.primary} />
              <Text style={styles.guestTitle}>プロフィール設定</Text>
            </View>
            <Text style={styles.guestSubtitle}>
              ゲストユーザーとしてアプリを使用するために{'\n'}基本情報を入力してください
            </Text>
          </View>

          <View style={styles.guestForm}>
            <View style={styles.guestInputContainer}>
              <View style={styles.guestLabelContainer}>
                <Text style={styles.guestLabel}>お名前</Text>
                <Text style={styles.guestLabelHint}>（あとで変更できます）</Text>
              </View>
              <TextInput
                style={styles.guestInput}
                value={guestName}
                onChangeText={setGuestName}
                placeholder="お名前を入力してください"
                placeholderTextColor={colors.gray[400]}
                maxLength={50}
              />
            </View>

            <View style={styles.guestInputContainer}>
              <View style={styles.guestLabelContainer}>
                <Text style={styles.guestLabel}>生年月日</Text>
                <Text style={styles.guestLabelWarning}>（一度設定すると変更できません）</Text>
              </View>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.datePickerText, !dateOfBirth && styles.datePickerPlaceholder]}>
                  {dateOfBirth ? `${formatDate(dateOfBirth)} （${calculateAge(dateOfBirth)}歳）` : '生年月日を選択してください'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.purple[400]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.buttonDisabled]}
              onPress={handleGuestProfileSave}
              disabled={isLoading}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
              <Text style={styles.saveButtonText}>
                {isLoading ? '保存中...' : '設定を完了'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowGuestSetup(false)}
            >
              <Ionicons name="arrow-back-outline" size={16} color={colors.gray[700]} />
              <Text style={styles.backButtonText}>戻る</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* DatePicker Modal */}
        {showDatePicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>生年月日を選択</Text>
                  <TouchableOpacity 
                    onPress={() => setShowDatePicker(false)}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons name="close-outline" size={24} color={colors.gray[600]} />
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={dateOfBirth || new Date(2000, 0, 1)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  locale="ja-JP"
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.modalButtonText}>完了</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Modal>
        )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

        {/* Guest mode option */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>または</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={[styles.guestButton, isLoading && styles.buttonDisabled]}
          onPress={hasBackup ? handleRestoreBackup : () => handleContinueAsGuest(false)}
          disabled={isLoading}
        >
          <Text style={styles.guestButtonText}>
            {isLoading ? '処理中...' : 'ゲストとして続ける'}
          </Text>
          <Text style={styles.guestButtonSubtext}>
            {hasBackup 
              ? '登録不要・以前のデータを復元可能' 
              : '登録不要・データはSupabaseに保存'
            }
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pink[50],
  },
  flex1: {
    flex: 1,
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
  // Guest mode styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[300],
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.gray[500],
    fontSize: 14,
  },
  guestButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.purple[400],
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    color: colors.purple[600],
    fontSize: 16,
    fontWeight: '600',
  },
  guestButtonSubtext: {
    color: colors.gray[600],
    fontSize: 12,
    marginTop: 4,
  },
  // Guest profile setup styles
  guestContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    paddingTop: 20,
  },
  guestHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  guestTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
    justifyContent: 'center',
  },
  guestTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  guestForm: {
    marginBottom: 24,
  },
  guestInputContainer: {
    marginBottom: 32,
  },
  guestLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  guestLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[800],
  },
  guestLabelHint: {
    fontSize: 14,
    color: colors.gray[500],
    marginLeft: 8,
  },
  guestLabelWarning: {
    fontSize: 14,
    color: colors.red[600],
    marginLeft: 8,
    fontWeight: '600',
  },
  guestInput: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.gray[900],
    shadowColor: colors.gray[400],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guestInputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
  },
  datePickerButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.gray[400],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerText: {
    fontSize: 16,
    color: colors.gray[800],
    fontWeight: '500',
  },
  datePickerPlaceholder: {
    color: colors.gray[400],
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[800],
  },
  modalCloseButton: {
    padding: 4,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 32,
    gap: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  backButtonText: {
    color: colors.gray[700],
    fontSize: 16,
    fontWeight: '600',
  },
});