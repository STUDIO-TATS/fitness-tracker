import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getCurrentUser, supabase } from '../lib/supabase'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Picker } from '@react-native-picker/picker'

interface Goal {
  id: string
  title: string
  description?: string
  target_value: number
  current_value: number
  unit: string
  target_date?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  created_at: string
  updated_at: string
}

interface GoalFormData {
  title: string
  description: string
  target_value: string
  current_value: string
  unit: string
  target_date: string
  category: string
}

const GOAL_CATEGORIES = [
  { value: 'weight', label: '体重', unit: 'kg', icon: 'scale-bathroom' },
  { value: 'body_fat', label: '体脂肪率', unit: '%', icon: 'percent' },
  { value: 'muscle_mass', label: '筋肉量', unit: 'kg', icon: 'arm-flex' },
  { value: 'bench_press', label: 'ベンチプレス', unit: 'kg', icon: 'dumbbell' },
  { value: 'squat', label: 'スクワット', unit: 'kg', icon: 'dumbbell' },
  { value: 'deadlift', label: 'デッドリフト', unit: 'kg', icon: 'dumbbell' },
  { value: 'running', label: 'ランニング', unit: 'km', icon: 'run' },
  { value: 'push_ups', label: '腕立て伏せ', unit: '回', icon: 'human-handsup' },
  { value: 'custom', label: 'その他', unit: '', icon: 'flag' },
]

export function GoalScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    target_value: '',
    current_value: '0',
    unit: 'kg',
    target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3ヶ月後
    category: 'weight',
  })

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user])

  const loadUser = async () => {
    try {
      const { user: userData, error } = await getCurrentUser()
      if (error) throw error
      setUser(userData)
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error)
    }
  }

  const loadGoals = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('目標取得エラー:', error)
    }
  }

  const handleCategoryChange = (category: string) => {
    const selectedCategory = GOAL_CATEGORIES.find(c => c.value === category)
    if (selectedCategory && category !== 'custom') {
      setFormData(prev => ({
        ...prev,
        category,
        title: selectedCategory.label,
        unit: selectedCategory.unit,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        category,
        title: '',
        unit: '',
      }))
    }
  }

  const openCreateModal = () => {
    setEditingGoal(null)
    setFormData({
      title: '体重',
      description: '',
      target_value: '',
      current_value: '0',
      unit: 'kg',
      target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'weight',
    })
    setModalVisible(true)
  }

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal)
    const category = GOAL_CATEGORIES.find(c => c.label === goal.title)?.value || 'custom'
    setFormData({
      title: goal.title,
      description: goal.description || '',
      target_value: goal.target_value.toString(),
      current_value: goal.current_value.toString(),
      unit: goal.unit,
      target_date: goal.target_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category,
    })
    setModalVisible(true)
  }

  const saveGoal = async () => {
    if (!user || !formData.title || !formData.target_value) {
      Alert.alert('エラー', '必須項目を入力してください')
      return
    }

    setLoading(true)
    try {
      const goalData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        target_value: parseFloat(formData.target_value),
        current_value: parseFloat(formData.current_value || '0'),
        unit: formData.unit,
        target_date: formData.target_date || null,
        status: 'active' as const,
      }

      if (editingGoal) {
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', editingGoal.id)

        if (error) throw error
        Alert.alert('成功', '目標を更新しました')
      } else {
        const { error } = await supabase
          .from('goals')
          .insert(goalData)

        if (error) throw error
        Alert.alert('成功', '目標を作成しました')
      }

      setModalVisible(false)
      loadGoals()
    } catch (error) {
      console.error('保存エラー:', error)
      Alert.alert('エラー', '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ current_value: newValue })
        .eq('id', goalId)

      if (error) throw error
      loadGoals()
    } catch (error) {
      console.error('進捗更新エラー:', error)
      Alert.alert('エラー', '進捗の更新に失敗しました')
    }
  }

  const updateGoalStatus = async (goalId: string, status: Goal['status']) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ status })
        .eq('id', goalId)

      if (error) throw error
      loadGoals()
    } catch (error) {
      console.error('ステータス更新エラー:', error)
      Alert.alert('エラー', 'ステータスの更新に失敗しました')
    }
  }

  const deleteGoal = async (goalId: string) => {
    Alert.alert(
      '確認',
      'この目標を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', goalId)

              if (error) throw error
              loadGoals()
            } catch (error) {
              console.error('削除エラー:', error)
              Alert.alert('エラー', '削除に失敗しました')
            }
          },
        },
      ]
    )
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active': return '#2563EB'
      case 'completed': return '#10B981'
      case 'paused': return '#F59E0B'
      case 'cancelled': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getStatusText = (status: Goal['status']) => {
    switch (status) {
      case 'active': return '進行中'
      case 'completed': return '達成'
      case 'paused': return '一時停止'
      case 'cancelled': return 'キャンセル'
      default: return status
    }
  }

  const renderGoalCard = ({ item }: { item: Goal }) => {
    const progress = calculateProgress(item.current_value, item.target_value)
    const categoryIcon = GOAL_CATEGORIES.find(c => c.label === item.title)?.icon || 'flag'

    return (
      <TouchableOpacity
        style={styles.goalCard}
        onPress={() => openEditModal(item)}
      >
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleRow}>
            <MaterialCommunityIcons name={categoryIcon} size={24} color="#2563EB" />
            <Text style={styles.goalTitle}>{item.title}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.goalDescription}>{item.description}</Text>
        )}

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { 
                  width: `${progress}%`,
                  backgroundColor: progress >= 100 ? '#10B981' : '#2563EB'
                }
              ]}
            />
          </View>
          <View style={styles.progressDetails}>
            <Text style={styles.progressText}>
              {item.current_value} / {item.target_value} {item.unit}
            </Text>
            <Text style={styles.progressPercent}>{progress.toFixed(1)}%</Text>
          </View>
        </View>

        {item.target_date && (
          <Text style={styles.targetDate}>
            目標期限: {new Date(item.target_date).toLocaleDateString('ja-JP')}
          </Text>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.prompt(
                '進捗更新',
                `現在の値を入力してください (${item.unit})`,
                [
                  { text: 'キャンセル', style: 'cancel' },
                  {
                    text: '更新',
                    onPress: (value) => {
                      if (value) {
                        const numValue = parseFloat(value)
                        if (!isNaN(numValue)) {
                          updateGoalProgress(item.id, numValue)
                        }
                      }
                    },
                  },
                ],
                'plain-text',
                item.current_value.toString()
              )
            }}
          >
            <MaterialIcons name="edit" size={20} color="#2563EB" />
            <Text style={styles.actionButtonText}>進捗更新</Text>
          </TouchableOpacity>

          {item.status === 'active' && progress >= 100 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => updateGoalStatus(item.id, 'completed')}
            >
              <MaterialIcons name="check-circle" size={20} color="#10B981" />
              <Text style={[styles.actionButtonText, { color: '#10B981' }]}>達成</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteGoal(item.id)}
          >
            <MaterialIcons name="delete" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>目標設定</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openCreateModal}
        >
          <MaterialIcons name="add" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={renderGoalCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="flag" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>まだ目標が設定されていません</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={openCreateModal}
            >
              <Text style={styles.createButtonText}>目標を作成</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* 目標作成/編集モーダル */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingGoal ? '目標を編集' : '新しい目標'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>カテゴリー</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    {GOAL_CATEGORIES.map((category) => (
                      <Picker.Item
                        key={category.value}
                        label={category.label}
                        value={category.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {formData.category === 'custom' && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>目標名</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                    placeholder="目標の名前を入力"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>説明（任意）</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="目標の詳細を入力"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>現在の値</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.current_value}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, current_value: text }))}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>目標値</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.target_value}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, target_value: text }))}
                    placeholder="100"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                  />
                </View>

                {formData.category === 'custom' && (
                  <View style={[styles.formGroup, { flex: 0.8 }]}>
                    <Text style={styles.formLabel}>単位</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.unit}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, unit: text }))}
                      placeholder="kg"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>目標期限</Text>
                <View style={styles.dateInput}>
                  <MaterialIcons name="calendar-today" size={20} color="#6B7280" />
                  <Text style={styles.dateText}>{formData.target_date}</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveGoal}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? '保存中...' : '保存'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  goalDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  targetDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#ECFDF5',
  },
  deleteButton: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  pickerContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#1E293B',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2563EB',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})