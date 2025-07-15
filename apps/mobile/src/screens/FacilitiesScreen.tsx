import React, { useState, useEffect } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, Card, Button } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface Facility {
  id: string
  name: string
  code: string
  facility_type: string
  address: string
  phone: string
  email: string
  qr_code: string
  opening_hours: any
  features: any
  company: {
    name: string
    code: string
  }
  branch?: {
    name: string
  }
}

interface Company {
  id: string
  name: string
  code: string
  logo_url: string
  description: string
}

export const FacilitiesScreen = () => {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const { user } = useAuth()

  const loadData = async () => {
    if (!user) return

    try {
      // 会社一覧の取得
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (companiesError) throw companiesError

      // 施設一覧の取得
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from('facilities')
        .select(`
          *,
          company:companies(name, code),
          branch:branches(name)
        `)
        .eq('is_active', true)
        .order('name')

      if (facilitiesError) throw facilitiesError

      setCompanies(companiesData || [])
      setFacilities(facilitiesData || [])
      
      // 初期選択
      if (companiesData && companiesData.length > 0 && !selectedCompany) {
        setSelectedCompany(companiesData[0].id)
      }
    } catch (error: any) {
      console.error('データ読み込みエラー:', error)
      Alert.alert('エラー', 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'gym':
        return 'dumbbell'
      case 'pool':
        return 'pool'
      case 'yoga_studio':
        return 'yoga'
      case 'exercise_studio':
        return 'run'
      default:
        return 'office-building'
    }
  }

  const getFacilityTypeLabel = (type: string) => {
    switch (type) {
      case 'gym':
        return 'ジム'
      case 'pool':
        return 'プール'
      case 'yoga_studio':
        return 'ヨガスタジオ'
      case 'exercise_studio':
        return 'エクササイズスタジオ'
      default:
        return type
    }
  }

  const formatOpeningHours = (hours: any) => {
    if (!hours) return '営業時間：未設定'
    
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    const dayLabels = ['月', '火', '水', '木', '金', '土', '日']
    
    const hoursText = days.map((day, index) => {
      const time = hours[day]
      return time ? `${dayLabels[index]}: ${time}` : null
    }).filter(Boolean).join(' ')
    
    return hoursText || '営業時間：未設定'
  }

  const renderFacility = ({ item }: { item: Facility }) => (
    <Card style={styles.facilityCard}>
      <View style={styles.facilityHeader}>
        <View style={styles.facilityIcon}>
          <MaterialCommunityIcons 
            name={getFacilityIcon(item.facility_type) as any} 
            size={24} 
            color={colors.primary} 
          />
        </View>
        <View style={styles.facilityInfo}>
          <Text variant="body" weight="semibold">{item.name}</Text>
          <Text variant="caption" color="gray">
            {getFacilityTypeLabel(item.facility_type)} • {item.company.name}
          </Text>
          {item.branch && (
            <Text variant="caption" color="gray">{item.branch.name}</Text>
          )}
        </View>
      </View>

      <View style={styles.facilityDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color={colors.gray[600]} />
          <Text variant="caption" color="gray" style={styles.detailText}>
            {item.address || '住所未設定'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="phone" size={16} color={colors.gray[600]} />
          <Text variant="caption" color="gray" style={styles.detailText}>
            {item.phone || '電話番号未設定'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock" size={16} color={colors.gray[600]} />
          <Text variant="caption" color="gray" style={styles.detailText}>
            {formatOpeningHours(item.opening_hours)}
          </Text>
        </View>

        {item.features && Object.keys(item.features).length > 0 && (
          <View style={styles.featuresContainer}>
            <Text variant="caption" weight="medium" color="gray">設備：</Text>
            <View style={styles.features}>
              {Object.entries(item.features).map(([key, value]) => (
                value && (
                  <View key={key} style={styles.featureTag}>
                    <Text variant="caption" color="primary">{key}</Text>
                  </View>
                )
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.facilityActions}>
        <Button
          title="QRコード"
          variant="secondary"
          onPress={() => {
            // QRコード表示機能
            Alert.alert('QRコード', `施設コード: ${item.qr_code}`)
          }}
          style={styles.actionButton}
        />
        <Button
          title="詳細"
          onPress={() => {
            // 詳細画面に遷移
            Alert.alert('詳細', '詳細画面を実装予定')
          }}
          style={styles.actionButton}
        />
      </View>
    </Card>
  )

  const filteredFacilities = selectedCompany
    ? facilities.filter(f => f.company.id === selectedCompany)
    : facilities

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
        <Text variant="heading2" weight="bold">施設一覧</Text>
        
        {/* 会社選択 */}
        <View style={styles.companySelector}>
          <FlatList
            data={companies}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.companyTab,
                  selectedCompany === item.id && styles.selectedCompanyTab
                ]}
                onPress={() => setSelectedCompany(item.id)}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  color={selectedCompany === item.id ? 'white' : 'gray'}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      <FlatList
        data={filteredFacilities}
        keyExtractor={(item) => item.id}
        renderItem={renderFacility}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="office-building" 
              size={48} 
              color={colors.gray[400]} 
            />
            <Text variant="body" color="gray" style={styles.emptyText}>
              施設が見つかりません
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  companySelector: {
    marginTop: spacing.md,
  },
  companyTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  selectedCompanyTab: {
    backgroundColor: colors.primary,
  },
  listContainer: {
    padding: spacing.md,
  },
  facilityCard: {
    marginBottom: spacing.md,
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  facilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  featuresContainer: {
    marginTop: spacing.sm,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  featureTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
  },
  facilityActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
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
  },
})