import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ActivityIndicator, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { spacing, typography, layout, borderRadius, shadows } from '../constants/styles';
import { TextRefreshControl } from '../components/TextRefreshControl';

interface ProfileData {
  display_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  preferences: {
    height?: number;
    weight?: number;
    goal?: string;
    location?: string;
  };
}

export default function ProfileScreen() {
  const { session } = useAuth();
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState<ProfileData | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    preferences: {
      height: undefined,
      weight: undefined,
      goal: '',
      location: '',
    },
  });

  const genderOptions = [
    { value: 'male', label: t('profile.gender.male') },
    { value: 'female', label: t('profile.gender.female') },
    { value: 'other', label: t('profile.gender.other') },
    { value: 'prefer_not_to_say', label: t('profile.gender.preferNotToSay') },
  ];

  useEffect(() => {
    loadProfile();
  }, [session]);

  const loadProfile = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const formattedData: ProfileData = {
          display_name: data.display_name || '',
          phone: data.phone || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          preferences: data.preferences || {
            height: undefined,
            weight: undefined,
            goal: '',
            location: '',
          },
        };
        setProfileData(formattedData);
        setOriginalData(formattedData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('エラー', 'プロフィールの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            user_id: session.user.id,
            display_name: profileData.display_name,
            phone: profileData.phone,
            date_of_birth: profileData.date_of_birth || null,
            gender: profileData.gender,
            preferences: profileData.preferences,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) throw error;

      setOriginalData(profileData);
      setIsEditing(false);
      Alert.alert('成功', 'プロフィールを保存しました');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('エラー', 'プロフィールの保存に失敗しました');
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setProfileData(originalData);
    }
    setIsEditing(false);
  };

  const updateField = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => {
        const parentValue = prev[parent as keyof ProfileData];
        const existingObject = typeof parentValue === 'object' && parentValue !== null ? parentValue : {};
        
        return {
          ...prev,
          [parent]: {
            ...existingObject as any,
            [child]: value === '' ? undefined : isNaN(Number(value)) ? value : Number(value),
          },
        };
      });
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProfile();
    } catch (error) {
      Alert.alert('エラー', 'データの更新に失敗しました');
    } finally {
      setRefreshing(false);
    }
  };

  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      updateField('date_of_birth', selectedDate.toISOString().split('T')[0]);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getGenderLabel = (value: string): string => {
    const option = genderOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const renderField = (label: string, field: string, icon: string, multiline: boolean = false, keyboardType: 'default' | 'numeric' | 'phone-pad' = 'default', inputType: 'text' | 'date' | 'gender' = 'text') => {
    let value = '';
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentData = profileData[parent as keyof ProfileData];
      if (typeof parentData === 'object' && parentData !== null) {
        value = (parentData as any)[child]?.toString() || '';
      }
    } else {
      const fieldValue = profileData[field as keyof ProfileData];
      if (typeof fieldValue === 'string') {
        value = fieldValue;
      }
    }

    // Special handling for date field
    if (field === 'date_of_birth' && inputType === 'date') {
      return (
        <View style={styles.fieldContainer}>
          <View style={styles.fieldHeader}>
            <Ionicons name={icon as any} size={20} color={colors.purple[600]} />
            <Text style={styles.fieldLabel}>{label}</Text>
          </View>
          {isEditing ? (
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, !value && styles.placeholderText]}>
                {value ? formatDate(value) : '日付を選択'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={colors.gray[500]} />
            </TouchableOpacity>
          ) : (
            <Text style={styles.fieldValue}>
              {value ? formatDate(value) : '-'}
            </Text>
          )}
        </View>
      );
    }

    // Special handling for gender field
    if (field === 'gender' && inputType === 'gender') {
      return (
        <View style={styles.fieldContainer}>
          <View style={styles.fieldHeader}>
            <Ionicons name={icon as any} size={20} color={colors.purple[600]} />
            <Text style={styles.fieldLabel}>{label}</Text>
          </View>
          {isEditing ? (
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowGenderPicker(true)}
            >
              <Text style={[styles.dateText, !value && styles.placeholderText]}>
                {value ? getGenderLabel(value) : '性別を選択'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.gray[500]} />
            </TouchableOpacity>
          ) : (
            <Text style={styles.fieldValue}>
              {value ? getGenderLabel(value) : '-'}
            </Text>
          )}
        </View>
      );
    }

    // Default text input
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Ionicons name={icon as any} size={20} color={colors.purple[600]} />
          <Text style={styles.fieldLabel}>{label}</Text>
        </View>
        {isEditing ? (
          <TextInput
            style={[styles.input, multiline && styles.multilineInput]}
            value={value}
            onChangeText={(text) => updateField(field, text)}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            keyboardType={keyboardType}
          />
        ) : (
          <Text style={styles.fieldValue}>
            {value || '-'}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.purple[600]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenWrapper 
        backgroundColor={colors.purple[50]} 
        scrollable 
        keyboardAvoiding={false} 
        dismissKeyboardOnTap={false} 
        style={styles.scrollContent}
        refreshControl={
          <TextRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            pullDownText="引っ張って更新"
            releaseText="離して更新"
            refreshingText="プロフィールを更新中..."
            titleColor={colors.purple[600]}
          />
        }
      >

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
        {renderField(t('profile.displayName'), 'display_name', 'person-outline')}
        {renderField(t('profile.phone'), 'phone', 'call-outline', false, 'phone-pad')}
        {renderField(t('profile.birthDate'), 'date_of_birth', 'calendar-outline', false, 'default', 'date')}
        {renderField(t('profile.gender.label'), 'gender', 'male-female-outline', false, 'default', 'gender')}
        {renderField(t('profile.height'), 'preferences.height', 'resize-outline', false, 'numeric')}
        {renderField(t('profile.weight'), 'preferences.weight', 'barbell-outline', false, 'numeric')}
        {renderField(t('profile.goal'), 'preferences.goal', 'trophy-outline')}
        {renderField(t('profile.location'), 'preferences.location', 'location-outline')}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="person" size={24} color={colors.mint[600]} />
          <Text style={styles.statNumber}>{calculateAge(profileData.date_of_birth) || '-'}</Text>
          <Text style={styles.statLabel}>年齢</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="body" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>
            {profileData.preferences?.height ? 
              (profileData.preferences.weight && profileData.preferences.height ? 
                (profileData.preferences.weight / Math.pow(profileData.preferences.height / 100, 2)).toFixed(1) 
                : '-'
              ) : '-'
            }
          </Text>
          <Text style={styles.statLabel}>BMI</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={24} color={colors.yellow[600]} />
          <Text style={styles.statNumber}>{profileData.preferences?.goal ? '設定済' : '未設定'}</Text>
          <Text style={styles.statLabel}>目標</Text>
        </View>
      </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.white} />
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </ScreenWrapper>

      <View style={styles.bottomActions}>
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={20} color={colors.white} />
            <Text style={styles.editButtonText}>編集</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Date Picker */}
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
                <Text style={styles.modalTitle}>{t('profile.birthDate')}</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={24} color={colors.gray[600]} />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={profileData.date_of_birth ? new Date(profileData.date_of_birth) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.modalButtonText}>{t('common.done')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Gender Picker */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showGenderPicker}
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.gender.label')}</Text>
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Ionicons name="close" size={24} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>
            <View style={styles.genderOptions}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genderOption,
                    profileData.gender === option.value && styles.genderOptionSelected,
                  ]}
                  onPress={() => {
                    updateField('gender', option.value);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      profileData.gender === option.value && styles.genderOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {profileData.gender === option.value && (
                    <Ionicons name="checkmark" size={20} color={colors.purple[600]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.purple[50],
  },
  scrollContent: {
    flex: 1,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: layout.screenPadding,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    ...shadows.sm,
  },
  editButton: {
    backgroundColor: colors.purple[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  editButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.gray[700],
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.mint[500],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.xl,
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
    marginBottom: 100, // Space for fixed bottom buttons
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  logoutText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
  },
  dateText: {
    ...typography.body,
    color: colors.gray[900],
  },
  placeholderText: {
    color: colors.gray[400],
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    ...typography.sectionTitle,
    color: colors.gray[900],
  },
  modalButton: {
    backgroundColor: colors.purple[500],
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  genderOptions: {
    paddingVertical: spacing.md,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  genderOptionSelected: {
    backgroundColor: colors.purple[50],
  },
  genderOptionText: {
    ...typography.body,
    color: colors.gray[700],
  },
  genderOptionTextSelected: {
    color: colors.purple[700],
    fontWeight: '600',
  },
});