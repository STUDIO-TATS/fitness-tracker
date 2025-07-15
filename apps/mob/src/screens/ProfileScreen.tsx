import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

export default function ProfileScreen() {
  const { session } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '山田太郎',
    username: 'yamada_taro',
    bio: 'フィットネス愛好家です。毎日の運動を心がけています。',
    age: '28',
    height: '170',
    weight: '65',
    goal: '筋力アップ',
    location: '東京都',
  });

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
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('保存完了', 'プロフィールを更新しました');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // プロフィールデータを元に戻す処理をここに追加
  };

  const updateField = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderField = (label: string, field: string, icon: string, multiline: boolean = false) => (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <Ionicons name={icon as any} size={20} color={colors.purple[600]} />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      {isEditing ? (
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={profileData[field as keyof typeof profileData]}
          onChangeText={(text) => updateField(field, text)}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <Text style={styles.fieldValue}>
          {profileData[field as keyof typeof profileData]}
        </Text>
      )}
    </View>
  );

  return (
    <ScreenWrapper backgroundColor={colors.purple[50]} scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>プロフィール</Text>
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={20} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Ionicons name="close" size={20} color={colors.gray[600]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color={colors.purple[600]} />
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Ionicons name="camera" size={16} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.email}>{session?.user?.email}</Text>
      </View>

      <View style={styles.fieldsContainer}>
        {renderField('表示名', 'displayName', 'person-outline')}
        {renderField('ユーザー名', 'username', 'at-outline')}
        {renderField('自己紹介', 'bio', 'document-text-outline', true)}
        {renderField('年齢', 'age', 'calendar-outline')}
        {renderField('身長 (cm)', 'height', 'resize-outline')}
        {renderField('体重 (kg)', 'weight', 'barbell-outline')}
        {renderField('目標', 'goal', 'trophy-outline')}
        {renderField('地域', 'location', 'location-outline')}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="calendar" size={24} color={colors.mint[600]} />
          <Text style={styles.statNumber}>142</Text>
          <Text style={styles.statLabel}>日数</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="flame" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>28</Text>
          <Text style={styles.statLabel}>連続日数</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={24} color={colors.yellow[600]} />
          <Text style={styles.statNumber}>15</Text>
          <Text style={styles.statLabel}>達成目標</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.white} />
        <Text style={styles.logoutText}>ログアウト</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: layout.screenPadding,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.screenTitle,
    color: colors.purple[700],
  },
  editButton: {
    backgroundColor: colors.purple[500],
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.mint[500],
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.purple[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.purple[500],
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  email: {
    ...typography.body,
    color: colors.gray[600],
  },
  fieldsContainer: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
  },
  fieldContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    ...typography.small,
    color: colors.gray[700],
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  fieldValue: {
    ...typography.body,
    color: colors.gray[900],
  },
  input: {
    ...typography.body,
    color: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.cardTitle,
    color: colors.gray[900],
    fontWeight: 'bold',
    fontSize: 24,
    marginVertical: spacing.xs,
  },
  statLabel: {
    ...typography.small,
    color: colors.gray[600],
  },
  logoutButton: {
    backgroundColor: colors.gray[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  logoutText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});