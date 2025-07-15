import React, { useState, useEffect } from 'react'
import { View, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity, Modal, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, Card, Button, Input } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface UserMembership {
  id: string
  membership_number: string
  membership_type: string
  start_date: string
  end_date: string | null
  is_active: boolean
  company: {
    id: string
    name: string
    code: string
    logo_url: string | null
  }
}

interface Company {
  id: string
  name: string
  code: string
  logo_url: string | null
}

export const UserMembershipsScreen = () => {
  const { user } = useAuth()
  const [memberships, setMemberships] = useState<UserMembership[]>([])
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [membershipNumber, setMembershipNumber] = useState('')
  const [membershipType, setMembershipType] = useState('regular')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)

  const membershipTypes = [
    { value: 'regular', label: 'レギュラー' },
    { value: 'premium', label: 'プレミアム' },
    { value: 'vip', label: 'VIP' },
    { value: 'trial', label: 'トライアル' },
    { value: 'student', label: '学生' },
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!user) return

    try {
      // ユーザーのメンバーシップを取得
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('user_memberships')
        .select(`
          *,
          company:companies(id, name, code, logo_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (membershipsError) throw membershipsError
      setMemberships(membershipsData || [])

      // 利用可能な会社を取得（まだメンバーシップがない会社）
      const membershipCompanyIds = (membershipsData || []).map(m => m.company.id)
      
      let companiesQuery = supabase
        .from('companies')
        .select('id, name, code, logo_url')
        .eq('is_active', true)
        .order('name')

      if (membershipCompanyIds.length > 0) {
        companiesQuery = companiesQuery.not('id', 'in', `(${membershipCompanyIds.join(',')})`)
      }

      const { data: companiesData, error: companiesError } = await companiesQuery

      if (companiesError) throw companiesError
      setAvailableCompanies(companiesData || [])

    } catch (error: any) {
      console.error('データ読み込みエラー:', error)
      Alert.alert('エラー', 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleAddMembership = async () => {
    if (!user || !selectedCompany || !membershipNumber) {
      Alert.alert('エラー', '必要な情報を入力してください')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_memberships')
        .insert({
          user_id: user.id,
          company_id: selectedCompany.id,
          membership_number: membershipNumber,
          membership_type: membershipType,
          start_date: startDate,
          end_date: endDate || null,
          is_active: true
        })

      if (error) throw error

      Alert.alert('成功', 'メンバーシップを追加しました')
      setShowAddModal(false)
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('メンバーシップ追加エラー:', error)
      Alert.alert('エラー', 'メンバーシップの追加に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleMembership = async (membership: UserMembership) => {
    try {
      const { error } = await supabase
        .from('user_memberships')
        .update({ is_active: !membership.is_active })
        .eq('id', membership.id)

      if (error) throw error

      Alert.alert('成功', `メンバーシップを${!membership.is_active ? '有効' : '無効'}にしました`)
      loadData()
    } catch (error: any) {
      console.error('メンバーシップ更新エラー:', error)
      Alert.alert('エラー', 'メンバーシップの更新に失敗しました')
    }
  }

  const handleDeleteMembership = async (membership: UserMembership) => {
    Alert.alert(
      '確認',
      `${membership.company.name}のメンバーシップを削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_memberships')
                .delete()
                .eq('id', membership.id)

              if (error) throw error

              Alert.alert('成功', 'メンバーシップを削除しました')
              loadData()
            } catch (error: any) {
              console.error('メンバーシップ削除エラー:', error)
              Alert.alert('エラー', 'メンバーシップの削除に失敗しました')
            }
          }
        }
      ]
    )
  }

  const resetForm = () => {
    setSelectedCompany(null)
    setMembershipNumber('')
    setMembershipType('regular')
    setStartDate(new Date().toISOString().split('T')[0])
    setEndDate('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const getMembershipTypeLabel = (type: string) => {
    const typeObj = membershipTypes.find(t => t.value === type)
    return typeObj ? typeObj.label : type
  }

  const getMembershipStatusColor = (membership: UserMembership) => {
    if (!membership.is_active) return colors.gray[500]
    
    if (membership.end_date) {
      const endDate = new Date(membership.end_date)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry < 0) return colors.red[500]
      if (daysUntilExpiry < 30) return colors.orange[500]
    }
    
    return colors.green[500]
  }

  const getMembershipStatusText = (membership: UserMembership) => {
    if (!membership.is_active) return '無効'
    
    if (membership.end_date) {
      const endDate = new Date(membership.end_date)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry < 0) return '期限切れ'
      if (daysUntilExpiry < 30) return `${daysUntilExpiry}日後期限切れ`
    }
    
    return '有効'
  }

  const renderMembership = ({ item }: { item: UserMembership }) => (
    <Card style={styles.membershipCard}>
      <View style={styles.membershipHeader}>
        <View style={styles.companyIcon}>
          <MaterialCommunityIcons 
            name="office-building" 
            size={24} 
            color={colors.primary} 
          />
        </View>
        <View style={styles.membershipInfo}>
          <Text variant="body" weight="semibold">{item.company.name}</Text>
          <Text variant="caption" color="gray">
            メンバーシップ番号: {item.membership_number}
          </Text>
          <Text variant="caption" color="gray">
            種類: {getMembershipTypeLabel(item.membership_type)}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getMembershipStatusColor(item) + '20' }]}>
            <Text style={[styles.statusText, { color: getMembershipStatusColor(item) }]}>
              {getMembershipStatusText(item)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.membershipDetails}>
        <View style={styles.dateInfo}>
          <Text variant="caption" color="gray">開始日: {formatDate(item.start_date)}</Text>
          {item.end_date && (
            <Text variant="caption" color="gray">
              終了日: {formatDate(item.end_date)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.membershipActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => handleToggleMembership(item)}
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
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteMembership(item)}
        >
          <MaterialCommunityIcons 
            name="delete" 
            size={16} 
            color={colors.red[500]} 
          />
          <Text style={styles.actionButtonText}>削除</Text>
        </TouchableOpacity>
      </View>
    </Card>
  )

  const renderAddModal = () => (
    <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <Text style={styles.modalCancelText}>キャンセル</Text>
          </TouchableOpacity>
          <Text variant="body" weight="semibold">メンバーシップ追加</Text>
          <TouchableOpacity onPress={handleAddMembership} disabled={saving}>
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
            <Text variant="body" weight="medium">会社選択 *</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.companySelector}
              keyboardShouldPersistTaps="handled"
            >
              {availableCompanies.map((company) => (
                <TouchableOpacity
                  key={company.id}
                  style={[
                    styles.companyOption,
                    selectedCompany?.id === company.id && styles.selectedCompanyOption
                  ]}
                  onPress={() => setSelectedCompany(company)}
                >
                  <Text style={[
                    styles.companyOptionText,
                    selectedCompany?.id === company.id && styles.selectedCompanyOptionText
                  ]}>
                    {company.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <Text variant="body" weight="medium">メンバーシップ番号 *</Text>
            <Input
              value={membershipNumber}
              onChangeText={setMembershipNumber}
              placeholder="例: MB001234"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text variant="body" weight="medium">メンバーシップ種類</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.typeSelector}
              keyboardShouldPersistTaps="handled"
            >
              {membershipTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    membershipType === type.value && styles.selectedTypeOption
                  ]}
                  onPress={() => setMembershipType(type.value)}
                >
                  <Text style={[
                    styles.typeOptionText,
                    membershipType === type.value && styles.selectedTypeOptionText
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <Text variant="body" weight="medium">開始日</Text>
            <Input
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text variant="body" weight="medium">終了日（任意）</Text>
            <Input
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
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
        <Text variant="heading2" weight="bold">メンバーシップ</Text>
        <Button
          title="追加"
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
          disabled={availableCompanies.length === 0}
        />
      </View>

      <FlatList
        data={memberships}
        renderItem={renderMembership}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="card-account-details" 
              size={48} 
              color={colors.gray[400]} 
            />
            <Text variant="body" color="gray" style={styles.emptyText}>
              メンバーシップがありません
            </Text>
            <Text variant="caption" color="gray" style={styles.emptySubtext}>
              会社のメンバーシップを追加してください
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
  listContainer: {
    padding: spacing.md,
  },
  membershipCard: {
    marginBottom: spacing.md,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  companyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  membershipInfo: {
    flex: 1,
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
  membershipDetails: {
    marginBottom: spacing.md,
  },
  dateInfo: {
    gap: spacing.xs,
  },
  membershipActions: {
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
  deleteButton: {
    backgroundColor: colors.red[100],
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
  companySelector: {
    marginTop: spacing.sm,
  },
  companyOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  selectedCompanyOption: {
    backgroundColor: colors.primary,
  },
  companyOptionText: {
    color: colors.gray[700],
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCompanyOptionText: {
    color: colors.white,
  },
  typeSelector: {
    marginTop: spacing.sm,
  },
  typeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  selectedTypeOption: {
    backgroundColor: colors.primary,
  },
  typeOptionText: {
    color: colors.gray[700],
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTypeOptionText: {
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