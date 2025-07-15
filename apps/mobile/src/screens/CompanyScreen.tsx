import React, { useState, useEffect } from 'react'
import { View, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity, ScrollView } from 'react-native'
import { Text, Card, Button } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface Company {
  id: string
  name: string
  code: string
  logo_url: string | null
  description: string | null
  is_active: boolean
  facilities_count: number
  branches_count: number
  active_users: number
  total_activities: number
}

interface CompanyStats {
  total_activities: number
  unique_users: number
  total_duration_hours: number
  total_calories: number
  avg_session_duration: number
  total_points_awarded: number
  active_members: number
}

interface FacilityRanking {
  facility_id: string
  facility_name: string
  total_visits: number
  unique_visitors: number
  total_duration_minutes: number
  avg_duration_minutes: number
}

export const CompanyScreen = () => {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null)
  const [facilityRankings, setFacilityRankings] = useState<FacilityRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userMemberships, setUserMemberships] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!user) return

    try {
      // ユーザーのメンバーシップを取得
      const { data: memberships, error: membershipsError } = await supabase
        .from('user_memberships')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (membershipsError) throw membershipsError
      setUserMemberships(memberships || [])

      // 会社一覧を取得（統計情報付き）
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select(`
          *,
          facilities:facilities(count),
          branches:branches(count)
        `)
        .eq('is_active', true)
        .order('name')

      if (companiesError) throw companiesError

      // 会社ごとの統計を追加
      const companiesWithStats = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { data: stats } = await supabase
            .rpc('get_company_stats', { company_id_input: company.id })
          
          return {
            ...company,
            facilities_count: company.facilities?.length || 0,
            branches_count: company.branches?.length || 0,
            active_users: stats?.[0]?.unique_users || 0,
            total_activities: stats?.[0]?.total_activities || 0
          }
        })
      )

      setCompanies(companiesWithStats)
      
      // 初期選択（ユーザーがメンバーの会社があれば優先）
      if (memberships && memberships.length > 0) {
        setSelectedCompany(memberships[0].company)
        loadCompanyDetails(memberships[0].company.id)
      } else if (companiesWithStats.length > 0) {
        setSelectedCompany(companiesWithStats[0])
        loadCompanyDetails(companiesWithStats[0].id)
      }

    } catch (error: any) {
      console.error('データ読み込みエラー:', error)
      Alert.alert('エラー', 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadCompanyDetails = async (companyId: string) => {
    try {
      // 会社の詳細統計を取得
      const { data: stats, error: statsError } = await supabase
        .rpc('get_company_stats', { company_id_input: companyId })
      
      if (statsError) throw statsError
      setCompanyStats(stats?.[0] || null)

      // 施設ランキングを取得
      const { data: rankings, error: rankingsError } = await supabase
        .rpc('get_facility_ranking', { company_id_input: companyId })
      
      if (rankingsError) throw rankingsError
      setFacilityRankings(rankings || [])

    } catch (error: any) {
      console.error('会社詳細読み込みエラー:', error)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company)
    loadCompanyDetails(company.id)
  }

  const isUserMember = (companyId: string) => {
    return userMemberships.some(membership => membership.company_id === companyId)
  }

  const renderCompanyCard = ({ item }: { item: Company }) => (
    <Card 
      style={[
        styles.companyCard,
        selectedCompany?.id === item.id && styles.selectedCard
      ]}
    >
      <TouchableOpacity onPress={() => handleCompanySelect(item)}>
        <View style={styles.companyHeader}>
          <View style={styles.companyIcon}>
            <MaterialCommunityIcons 
              name="office-building" 
              size={24} 
              color={colors.primary} 
            />
          </View>
          <View style={styles.companyInfo}>
            <Text variant="body" weight="semibold">{item.name}</Text>
            <Text variant="caption" color="gray">コード: {item.code}</Text>
            {isUserMember(item.id) && (
              <View style={styles.memberBadge}>
                <Text variant="caption" style={styles.memberText}>メンバー</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.companyStats}>
          <View style={styles.statItem}>
            <Text variant="caption" color="gray">施設数</Text>
            <Text variant="body" weight="semibold">{item.facilities_count}</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="caption" color="gray">支店数</Text>
            <Text variant="body" weight="semibold">{item.branches_count}</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="caption" color="gray">アクティブユーザー</Text>
            <Text variant="body" weight="semibold">{item.active_users}</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="caption" color="gray">総アクティビティ</Text>
            <Text variant="body" weight="semibold">{item.total_activities}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  )

  const renderCompanyDetails = () => {
    if (!selectedCompany) return null

    return (
      <ScrollView style={styles.detailsContainer}>
        <Card style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <MaterialCommunityIcons 
              name="office-building" 
              size={32} 
              color={colors.primary} 
            />
            <View style={styles.detailsInfo}>
              <Text variant="heading3" weight="bold">{selectedCompany.name}</Text>
              <Text variant="body" color="gray">{selectedCompany.code}</Text>
              {selectedCompany.description && (
                <Text variant="caption" color="gray" style={styles.description}>
                  {selectedCompany.description}
                </Text>
              )}
            </View>
          </View>

          {companyStats && (
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text variant="heading2" weight="bold" color="primary">
                  {companyStats.total_activities}
                </Text>
                <Text variant="caption" color="gray">総アクティビティ</Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="heading2" weight="bold" color="primary">
                  {companyStats.unique_users}
                </Text>
                <Text variant="caption" color="gray">利用者数</Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="heading2" weight="bold" color="primary">
                  {Math.round(companyStats.total_duration_hours)}
                </Text>
                <Text variant="caption" color="gray">総利用時間</Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="heading2" weight="bold" color="primary">
                  {companyStats.total_calories}
                </Text>
                <Text variant="caption" color="gray">消費カロリー</Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="heading2" weight="bold" color="primary">
                  {Math.round(companyStats.avg_session_duration)}
                </Text>
                <Text variant="caption" color="gray">平均セッション時間</Text>
              </View>
              <View style={styles.statBox}>
                <Text variant="heading2" weight="bold" color="primary">
                  {companyStats.total_points_awarded}
                </Text>
                <Text variant="caption" color="gray">付与ポイント</Text>
              </View>
            </View>
          )}
        </Card>

        {facilityRankings.length > 0 && (
          <Card style={styles.rankingCard}>
            <Text variant="heading3" weight="bold" style={styles.rankingTitle}>
              施設利用ランキング
            </Text>
            {facilityRankings.map((facility, index) => (
              <View key={facility.facility_id} style={styles.rankingItem}>
                <View style={styles.rankingRank}>
                  <Text variant="body" weight="bold" color="primary">
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.rankingInfo}>
                  <Text variant="body" weight="semibold">
                    {facility.facility_name}
                  </Text>
                  <Text variant="caption" color="gray">
                    {facility.total_visits}回利用 • {facility.unique_visitors}人 • 
                    平均{Math.round(facility.avg_duration_minutes)}分
                  </Text>
                </View>
                <MaterialCommunityIcons 
                  name="trophy" 
                  size={20} 
                  color={index === 0 ? colors.yellow[500] : 
                         index === 1 ? colors.gray[400] : 
                         index === 2 ? colors.orange[500] : colors.gray[300]} 
                />
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    )
  }

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
        <Text variant="heading2" weight="bold">会社情報</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.companiesSection}>
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>
            会社一覧
          </Text>
          <FlatList
            data={companies}
            renderItem={renderCompanyCard}
            keyExtractor={(item) => item.id}
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
                  会社が見つかりません
                </Text>
              </View>
            }
          />
        </View>

        <View style={styles.detailsSection}>
          {renderCompanyDetails()}
        </View>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  companiesSection: {
    flex: 1,
    padding: spacing.md,
  },
  detailsSection: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  companyCard: {
    marginBottom: spacing.md,
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  companyHeader: {
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
  companyInfo: {
    flex: 1,
  },
  memberBadge: {
    backgroundColor: colors.green[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  memberText: {
    color: colors.green[700],
    fontSize: 12,
    fontWeight: '600',
  },
  companyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  detailsCard: {
    marginBottom: spacing.lg,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  detailsInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  description: {
    marginTop: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '30%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rankingCard: {
    marginBottom: spacing.lg,
  },
  rankingTitle: {
    marginBottom: spacing.md,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  rankingRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  rankingInfo: {
    flex: 1,
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
})