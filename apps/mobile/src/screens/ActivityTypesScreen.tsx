import React, { useState, useEffect } from 'react'
import { View, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity, Modal, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, Card, Button, Input } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface ActivityType {
  id: string
  name: string
  code: string
  category: string
  description: string | null
  duration_minutes: number | null
  calories_per_hour: number | null
  equipment_required: any
  is_active: boolean
  facility: {
    id: string
    name: string
    facility_type: string
    company: {
      name: string
    }
  }
}

interface Facility {
  id: string
  name: string
  facility_type: string
  company: {
    name: string
  }
}

export const ActivityTypesScreen = () => {
  const { user } = useAuth()
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedFacilityForAdd, setSelectedFacilityForAdd] = useState<Facility | null>(null)
  const [saving, setSaving] = useState(false)
  
  // フォームフィールド
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [category, setCategory] = useState('training')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [calories, setCalories] = useState('')
  const [equipment, setEquipment] = useState('')

  const categories = [
    { value: 'training', label: 'トレーニング', icon: 'dumbbell' },
    { value: 'swimming', label: 'スイミング', icon: 'pool' },
    { value: 'yoga', label: 'ヨガ', icon: 'yoga' },
    { value: 'dance', label: 'ダンス', icon: 'dance-ballroom' },
    { value: 'martial_arts', label: '格闘技', icon: 'karate' },
    { value: 'cardio', label: '有酸素運動', icon: 'heart-pulse' },
    { value: 'group_fitness', label: 'グループフィットネス', icon: 'account-group' },
    { value: 'rehabilitation', label: 'リハビリテーション', icon: 'medical-bag' },
    { value: 'other', label: 'その他', icon: 'help-circle' },
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!user) return

    try {
      // 施設一覧を取得
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from('facilities')
        .select(`
          id,
          name,
          facility_type,
          company:companies(name)
        `)
        .eq('is_active', true)
        .order('name')

      if (facilitiesError) throw facilitiesError
      setFacilities(facilitiesData || [])

      // 初期選択
      if (facilitiesData && facilitiesData.length > 0 && !selectedFacility) {
        setSelectedFacility(facilitiesData[0].id)
      }

      // アクティビティタイプを取得
      loadActivityTypes(selectedFacility || facilitiesData?.[0]?.id)

    } catch (error: any) {
      console.error('データ読み込みエラー:', error)
      Alert.alert('エラー', 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadActivityTypes = async (facilityId?: string) => {
    if (!facilityId) return

    try {
      const { data, error } = await supabase
        .from('activity_types')
        .select(`
          *,
          facility:facilities(
            id,
            name,
            facility_type,
            company:companies(name)
          )
        `)
        .eq('facility_id', facilityId)
        .order('name')

      if (error) throw error
      setActivityTypes(data || [])
    } catch (error: any) {
      console.error('アクティビティタイプ読み込みエラー:', error)
    }
  }

  useEffect(() => {
    if (selectedFacility) {
      loadActivityTypes(selectedFacility)
    }
  }, [selectedFacility])

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleAddActivity = async () => {
    if (!selectedFacilityForAdd || !name || !code) {
      Alert.alert('エラー', '必要な情報を入力してください')
      return
    }

    setSaving(true)
    try {
      const equipmentData = equipment ? equipment.split(',').map(item => item.trim()) : []
      
      const { error } = await supabase
        .from('activity_types')
        .insert({
          facility_id: selectedFacilityForAdd.id,
          name,
          code,
          category,
          description: description || null,
          duration_minutes: duration ? parseInt(duration) : null,
          calories_per_hour: calories ? parseInt(calories) : null,
          equipment_required: equipmentData.length > 0 ? equipmentData : null,
          is_active: true
        })

      if (error) throw error

      Alert.alert('成功', 'アクティビティタイプを追加しました')
      setShowAddModal(false)
      resetForm()
      loadActivityTypes(selectedFacility!)
    } catch (error: any) {
      console.error('アクティビティタイプ追加エラー:', error)
      Alert.alert('エラー', 'アクティビティタイプの追加に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActivity = async (activity: ActivityType) => {
    try {
      const { error } = await supabase
        .from('activity_types')
        .update({ is_active: !activity.is_active })
        .eq('id', activity.id)

      if (error) throw error

      Alert.alert('成功', `アクティビティタイプを${!activity.is_active ? '有効' : '無効'}にしました`)
      loadActivityTypes(selectedFacility!)
    } catch (error: any) {
      console.error('アクティビティタイプ更新エラー:', error)
      Alert.alert('エラー', 'アクティビティタイプの更新に失敗しました')
    }
  }

  const resetForm = () => {
    setSelectedFacilityForAdd(null)
    setName('')
    setCode('')
    setCategory('training')
    setDescription('')
    setDuration('')
    setCalories('')
    setEquipment('')
  }

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0]
  }

  const renderActivityType = ({ item }: { item: ActivityType }) => {
    const categoryInfo = getCategoryInfo(item.category)
    
    return (
      <Card style={[styles.activityCard, !item.is_active && styles.inactiveCard]}>
        <View style={styles.activityHeader}>
          <View style={styles.activityIcon}>
            <MaterialCommunityIcons 
              name={categoryInfo.icon as any} 
              size={24} 
              color={item.is_active ? colors.primary : colors.gray[400]} 
            />
          </View>
          <View style={styles.activityInfo}>
            <Text variant="body" weight="semibold" style={!item.is_active && styles.inactiveText}>
              {item.name}
            </Text>
            <Text variant="caption" color="gray">
              {categoryInfo.label} • コード: {item.code}
            </Text>
            {item.description && (
              <Text variant="caption" color="gray" style={styles.description}>
                {item.description}
              </Text>
            )}
          </View>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.is_active ? colors.green[100] : colors.gray[100] }
            ]}>
              <Text style={[
                styles.statusText,
                { color: item.is_active ? colors.green[700] : colors.gray[500] }
              ]}>
                {item.is_active ? '有効' : '無効'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.activityDetails}>
          {item.duration_minutes && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock" size={16} color={colors.gray[500]} />
              <Text variant="caption" color="gray">
                {item.duration_minutes}分
              </Text>
            </View>
          )}
          {item.calories_per_hour && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="fire" size={16} color={colors.orange[500]} />
              <Text variant="caption" color="gray">
                {item.calories_per_hour}kcal/h
              </Text>
            </View>
          )}
          {item.equipment_required && Array.isArray(item.equipment_required) && (
            <View style={styles.equipmentContainer}>
              <MaterialCommunityIcons name="dumbbell" size={16} color={colors.gray[500]} />
              <Text variant="caption" color="gray">
                {item.equipment_required.join(', ')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.activityActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.toggleButton]}
            onPress={() => handleToggleActivity(item)}
          >
            <MaterialCommunityIcons 
              name={item.is_active ? 'pause' : 'play'} 
              size={16} 
              color={colors.blue[500]} 
            />
            <Text style={styles.actionButtonText}>
              {item.is_active ? '無効化' : '有効化'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    )
  }

  const renderFacilitySelector = () => (
    <View style={styles.facilitySelector}>
      <Text variant="body" weight="semibold" style={styles.selectorTitle}>
        施設を選択
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {facilities.map((facility) => (
          <TouchableOpacity
            key={facility.id}
            style={[
              styles.facilityOption,
              selectedFacility === facility.id && styles.selectedFacilityOption
            ]}
            onPress={() => setSelectedFacility(facility.id)}
          >
            <Text style={[
              styles.facilityOptionText,
              selectedFacility === facility.id && styles.selectedFacilityOptionText
            ]}>
              {facility.name}
            </Text>
            <Text style={[
              styles.facilityCompanyText,
              selectedFacility === facility.id && styles.selectedFacilityCompanyText
            ]}>
              {facility.company.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  const renderAddModal = () => (
    <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <Text style={styles.modalCancelText}>キャンセル</Text>
          </TouchableOpacity>
          <Text variant="body" weight="semibold">アクティビティタイプ追加</Text>
          <TouchableOpacity onPress={handleAddActivity} disabled={saving}>
            <Text style={[styles.modalSaveText, saving && styles.disabledText]}>
              {saving ? '保存中...' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.modalContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputContainer}>
            <Text variant="body" weight="medium">施設選択 *</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.facilitySelector}
              keyboardShouldPersistTaps="handled"
            >
              {facilities.map((facility) => (
                <TouchableOpacity
                  key={facility.id}
                  style={[
                    styles.facilityOption,
                    selectedFacilityForAdd?.id === facility.id && styles.selectedFacilityOption
                  ]}
                  onPress={() => setSelectedFacilityForAdd(facility)}
                >
                  <Text style={[
                    styles.facilityOptionText,
                    selectedFacilityForAdd?.id === facility.id && styles.selectedFacilityOptionText
                  ]}>
                    {facility.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <Text variant="body" weight="medium">アクティビティ名 *</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="例: ベンチプレス"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text variant="body" weight="medium">コード *</Text>
            <Input
              value={code}
              onChangeText={setCode}
              placeholder="例: BP001"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text variant="body" weight="medium">カテゴリー</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.categorySelector}
              keyboardShouldPersistTaps="handled"
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryOption,
                    category === cat.value && styles.selectedCategoryOption
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <MaterialCommunityIcons 
                    name={cat.icon as any} 
                    size={20} 
                    color={category === cat.value ? colors.white : colors.gray[600]} 
                  />
                  <Text style={[
                    styles.categoryOptionText,
                    category === cat.value && styles.selectedCategoryOptionText
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <Text variant="body" weight="medium">説明</Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="アクティビティの説明"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text variant="body" weight="medium">標準時間（分）</Text>
            <Input
              value={duration}
              onChangeText={setDuration}
              placeholder="例: 60"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text variant="body" weight="medium">時間あたり消費カロリー</Text>
            <Input
              value={calories}
              onChangeText={setCalories}
              placeholder="例: 300"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text variant="body" weight="medium">必要な器具（カンマ区切り）</Text>
            <Input
              value={equipment}
              onChangeText={setEquipment}
              placeholder="例: バーベル, ダンベル, ベンチ"
              style={styles.input}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>読み込み中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading2" weight="bold">アクティビティタイプ</Text>
        <Button
          title="追加"
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
        />
      </View>

      {renderFacilitySelector()}

      <FlatList
        data={activityTypes}
        renderItem={renderActivityType}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="play-circle" 
              size={48} 
              color={colors.gray[400]} 
            />
            <Text variant="body" color="gray" style={styles.emptyText}>
              アクティビティタイプがありません
            </Text>
            <Text variant="caption" color="gray" style={styles.emptySubtext}>
              施設で利用可能なアクティビティを追加してください
            </Text>
          </View>
        }
      />

      {renderAddModal()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  addButton: {
    paddingHorizontal: spacing.lg,
  },
  facilitySelector: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  selectorTitle: {
    marginBottom: spacing.sm,
  },
  facilityOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  selectedFacilityOption: {
    backgroundColor: colors.primary,
  },
  facilityOptionText: {
    color: colors.gray[700],
    fontSize: 14,
    fontWeight: '600',
  },
  selectedFacilityOptionText: {
    color: colors.white,
  },
  facilityCompanyText: {
    color: colors.gray[500],
    fontSize: 12,
  },
  selectedFacilityCompanyText: {
    color: colors.white,
    opacity: 0.8,
  },
  listContainer: {
    padding: spacing.md,
  },
  activityCard: {
    marginBottom: spacing.md,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  activityInfo: {
    flex: 1,
  },
  inactiveText: {
    color: colors.gray[500],
  },
  description: {
    marginTop: spacing.xs,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  activityActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  toggleButton: {
    backgroundColor: colors.blue[100],
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.blue[700],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalCancelText: {
    color: colors.gray[600],
    fontSize: 16,
  },
  modalSaveText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: colors.gray[400],
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    marginTop: spacing.sm,
  },
  categorySelector: {
    marginTop: spacing.sm,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    gap: spacing.xs,
  },
  selectedCategoryOption: {
    backgroundColor: colors.primary,
  },
  categoryOptionText: {
    color: colors.gray[700],
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryOptionText: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
})