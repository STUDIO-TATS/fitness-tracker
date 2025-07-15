import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native'
import { Text, Card, Button } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useNavigation } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { LineChart } from 'react-native-chart-kit'
import { Dimensions } from 'react-native'
import { ScreenWrapper } from '../components/shared'

const screenWidth = Dimensions.get('window').width

interface MeasurementData {
  weight?: string
  body_fat_percentage?: string
  muscle_mass?: string
  chest?: string
  waist?: string
  hips?: string
  biceps_left?: string
  biceps_right?: string
  thigh_left?: string
  thigh_right?: string
  calf_left?: string
  calf_right?: string
  systolic_pressure?: string
  diastolic_pressure?: string
  heart_rate?: string
  notes?: string
}

interface MeasurementRecord {
  id: string
  date: string
  weight?: number
  body_fat_percentage?: number
  muscle_mass?: number
  chest?: number
  waist?: number
  systolic_pressure?: number
  diastolic_pressure?: number
  heart_rate?: number
  notes?: string
}

export const MeasurementScreen = () => {
  const { user } = useAuth()
  const navigation = useNavigation()
  const [measurementData, setMeasurementData] = useState<MeasurementData>({})
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [activeTab, setActiveTab] = useState<'record' | 'history' | 'graph'>('record')
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([])
  const [graphPeriod, setGraphPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user && (activeTab === 'history' || activeTab === 'graph')) {
      loadMeasurements()
    }
  }, [user, activeTab])

  const loadMeasurements = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(50)

      if (error) throw error
      setMeasurements(data || [])
    } catch (error) {
      console.error('測定履歴取得エラー:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadMeasurements()
  }

  const graphData = useMemo(() => {
    // 期間に応じてデータをフィルタリング
    const now = new Date()
    let startDate = new Date()
    
    switch (graphPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const filteredData = measurements
      .filter(m => new Date(m.date) >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const labels = filteredData.map(m => {
      const date = new Date(m.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    })

    const weightData = filteredData
      .filter(m => m.weight)
      .map(m => m.weight || 0)

    const bodyFatData = filteredData
      .filter(m => m.body_fat_percentage)
      .map(m => m.body_fat_percentage || 0)

    const systolicData = filteredData
      .filter(m => m.systolic_pressure)
      .map(m => m.systolic_pressure || 0)

    const diastolicData = filteredData
      .filter(m => m.diastolic_pressure)
      .map(m => m.diastolic_pressure || 0)

    return {
      labels: labels.length > 0 ? labels : ['データなし'],
      weightData: weightData.length > 0 ? weightData : [0],
      bodyFatData: bodyFatData.length > 0 ? bodyFatData : [0],
      systolicData: systolicData.length > 0 ? systolicData : [0],
      diastolicData: diastolicData.length > 0 ? diastolicData : [0],
      hasData: filteredData.length > 0,
      hasBloodPressure: systolicData.length > 0 && diastolicData.length > 0
    }
  }, [measurements, graphPeriod])

  const updateMeasurement = (field: keyof MeasurementData, value: string) => {
    setMeasurementData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveMeasurement = async () => {
    if (!user) {
      Alert.alert('エラー', 'ユーザー情報が取得できません')
      return
    }

    // 少なくとも1つの測定値が入力されているかチェック
    const hasData = Object.entries(measurementData).some(([key, value]) => 
      key !== 'notes' && value && value.trim() !== ''
    )

    if (!hasData) {
      Alert.alert('エラー', '少なくとも1つの測定値を入力してください')
      return
    }

    setLoading(true)
    try {
      // 数値フィールドを変換
      const numericData: any = { user_id: user.id, date }
      
      Object.entries(measurementData).forEach(([key, value]) => {
        if (key === 'notes') {
          numericData[key] = value
        } else if (value && value.trim() !== '') {
          const numValue = parseFloat(value)
          if (!isNaN(numValue)) {
            numericData[key] = numValue
          }
        }
      })

      const { error } = await supabase
        .from('body_measurements')
        .insert(numericData)

      if (error) {
        throw error
      }

      Alert.alert(
        '保存完了', 
        '体測定データが保存されました',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      )
    } catch (error) {
      console.error('保存エラー:', error)
      Alert.alert('エラー', '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const MeasurementInput = ({ 
    label, 
    field, 
    unit, 
    placeholder,
    icon 
  }: {
    label: string
    field: keyof MeasurementData
    unit: string
    placeholder: string
    icon: string
  }) => (
    <View style={styles.inputGroup}>
      <View style={styles.inputHeader}>
        <MaterialCommunityIcons name={icon} size={16} color={colors.gray[600]} />
        <Text style={styles.inputLabel}>{label}</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={measurementData[field] || ''}
          onChangeText={(value) => updateMeasurement(field, value)}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          keyboardType="decimal-pad"
        />
        <Text style={styles.inputUnit}>{unit}</Text>
      </View>
    </View>
  )

  return (
    <ScreenWrapper keyboardAvoiding={true}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>体測定</Text>
          <View style={styles.headerRight} />
        </View>

        {/* タブバー */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'record' && styles.activeTab]}
            onPress={() => setActiveTab('record')}
          >
            <MaterialIcons 
              name="edit" 
              size={20} 
              color={activeTab === 'record' ? colors.purple[500] : colors.gray[600]} 
            />
            <Text style={[styles.tabText, activeTab === 'record' && styles.activeTabText]}>
              記録
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <MaterialIcons 
              name="history" 
              size={20} 
              color={activeTab === 'history' ? colors.purple[500] : colors.gray[600]} 
            />
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              履歴
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'graph' && styles.activeTab]}
            onPress={() => setActiveTab('graph')}
          >
            <MaterialIcons 
              name="show-chart" 
              size={20} 
              color={activeTab === 'graph' ? colors.purple[500] : colors.gray[600]} 
            />
            <Text style={[styles.tabText, activeTab === 'graph' && styles.activeTabText]}>
              グラフ
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'record' ? (
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
          {/* 日付選択 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>測定日</Text>
            <View style={styles.dateContainer}>
              <MaterialIcons name="calendar-today" size={20} color={colors.gray[600]} />
              <Text style={styles.dateText}>{date}</Text>
            </View>
          </View>

          {/* 基本測定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>基本測定</Text>
            <View style={styles.inputGrid}>
              <MeasurementInput
                label="体重"
                field="weight"
                unit="kg"
                placeholder="70.0"
                icon="scale"
              />
              <MeasurementInput
                label="体脂肪率"
                field="body_fat_percentage"
                unit="%"
                placeholder="15.0"
                icon="percent"
              />
              <MeasurementInput
                label="筋肉量"
                field="muscle_mass"
                unit="kg"
                placeholder="45.0"
                icon="arm-flex"
              />
            </View>
          </View>

          {/* 血圧・心拍数測定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>血圧・心拍数</Text>
            <View style={styles.inputGrid}>
              <MeasurementInput
                label="最高血圧"
                field="systolic_pressure"
                unit="mmHg"
                placeholder="120"
                icon="heart"
              />
              <MeasurementInput
                label="最低血圧"
                field="diastolic_pressure"
                unit="mmHg"
                placeholder="80"
                icon="heart"
              />
              <MeasurementInput
                label="心拍数"
                field="heart_rate"
                unit="bpm"
                placeholder="70"
                icon="heart-pulse"
              />
            </View>
          </View>

          {/* 部位別測定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>部位別測定</Text>
            <View style={styles.inputGrid}>
              <MeasurementInput
                label="胸囲"
                field="chest"
                unit="cm"
                placeholder="95.0"
                icon="human-male"
              />
              <MeasurementInput
                label="ウエスト"
                field="waist"
                unit="cm"
                placeholder="80.0"
                icon="tape-measure"
              />
              <MeasurementInput
                label="ヒップ"
                field="hips"
                unit="cm"
                placeholder="90.0"
                icon="human-male"
              />
            </View>
          </View>

          {/* 腕・脚測定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>腕・脚測定</Text>
            <View style={styles.inputGrid}>
              <MeasurementInput
                label="上腕（左）"
                field="biceps_left"
                unit="cm"
                placeholder="30.0"
                icon="arm-flex"
              />
              <MeasurementInput
                label="上腕（右）"
                field="biceps_right"
                unit="cm"
                placeholder="30.0"
                icon="arm-flex"
              />
              <MeasurementInput
                label="太もも（左）"
                field="thigh_left"
                unit="cm"
                placeholder="50.0"
                icon="human-male"
              />
              <MeasurementInput
                label="太もも（右）"
                field="thigh_right"
                unit="cm"
                placeholder="50.0"
                icon="human-male"
              />
              <MeasurementInput
                label="ふくらはぎ（左）"
                field="calf_left"
                unit="cm"
                placeholder="35.0"
                icon="human-male"
              />
              <MeasurementInput
                label="ふくらはぎ（右）"
                field="calf_right"
                unit="cm"
                placeholder="35.0"
                icon="human-male"
              />
            </View>
          </View>

          {/* メモ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>メモ</Text>
            <TextInput
              style={styles.notesInput}
              value={measurementData.notes || ''}
              onChangeText={(value) => updateMeasurement('notes', value)}
              placeholder="測定時の状況や感想を記録..."
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>
        ) : activeTab === 'history' ? (
          <FlatList
            style={styles.scrollView}
            data={measurements}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            renderItem={({ item }) => (
              <View style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  {item.notes && (
                    <MaterialIcons name="note" size={16} color={colors.gray[600]} />
                  )}
                </View>
                <View style={styles.historyData}>
                  {item.weight && (
                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>体重</Text>
                      <Text style={styles.historyValue}>{item.weight} kg</Text>
                    </View>
                  )}
                  {item.body_fat_percentage && (
                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>体脂肪率</Text>
                      <Text style={styles.historyValue}>{item.body_fat_percentage}%</Text>
                    </View>
                  )}
                  {item.muscle_mass && (
                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>筋肉量</Text>
                      <Text style={styles.historyValue}>{item.muscle_mass} kg</Text>
                    </View>
                  )}
                  {item.chest && (
                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>胸囲</Text>
                      <Text style={styles.historyValue}>{item.chest} cm</Text>
                    </View>
                  )}
                  {item.waist && (
                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>ウエスト</Text>
                      <Text style={styles.historyValue}>{item.waist} cm</Text>
                    </View>
                  )}
                  {item.systolic_pressure && item.diastolic_pressure && (
                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>血圧</Text>
                      <Text style={styles.historyValue}>{item.systolic_pressure}/{item.diastolic_pressure}</Text>
                    </View>
                  )}
                  {item.heart_rate && (
                    <View style={styles.historyItem}>
                      <Text style={styles.historyLabel}>心拍数</Text>
                      <Text style={styles.historyValue}>{item.heart_rate} bpm</Text>
                    </View>
                  )}
                </View>
                {item.notes && (
                  <Text style={styles.historyNotes}>{item.notes}</Text>
                )}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyHistory}>
                <MaterialIcons name="history" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyText}>まだ測定記録がありません</Text>
              </View>
            }
            contentContainerStyle={styles.scrollContent}
          />
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            {/* 期間選択 */}
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[styles.periodButton, graphPeriod === 'week' && styles.activePeriod]}
                onPress={() => setGraphPeriod('week')}
              >
                <Text style={[styles.periodText, graphPeriod === 'week' && styles.activePeriodText]}>
                  1週間
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, graphPeriod === 'month' && styles.activePeriod]}
                onPress={() => setGraphPeriod('month')}
              >
                <Text style={[styles.periodText, graphPeriod === 'month' && styles.activePeriodText]}>
                  1ヶ月
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, graphPeriod === 'year' && styles.activePeriod]}
                onPress={() => setGraphPeriod('year')}
              >
                <Text style={[styles.periodText, graphPeriod === 'year' && styles.activePeriodText]}>
                  1年
                </Text>
              </TouchableOpacity>
            </View>

            {/* 体重グラフ */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>体重の推移</Text>
              {graphData.hasData ? (
                <LineChart
                  data={{
                    labels: graphData.labels,
                    datasets: [{
                      data: graphData.weightData
                    }]
                  }}
                  width={screenWidth - 40}
                  height={220}
                  yAxisSuffix=" kg"
                  chartConfig={{
                    backgroundColor: '#FFFFFF',
                    backgroundGradientFrom: '#FFFFFF',
                    backgroundGradientTo: '#FFFFFF',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: colors.purple[500]
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <MaterialIcons name="insert-chart" size={48} color={colors.gray[300]} />
                  <Text style={styles.noDataText}>データがありません</Text>
                </View>
              )}
            </View>

            {/* 体脂肪率グラフ */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>体脂肪率の推移</Text>
              {graphData.bodyFatData.length > 0 && graphData.bodyFatData[0] !== 0 ? (
                <LineChart
                  data={{
                    labels: graphData.labels,
                    datasets: [{
                      data: graphData.bodyFatData
                    }]
                  }}
                  width={screenWidth - 40}
                  height={220}
                  yAxisSuffix="%"
                  chartConfig={{
                    backgroundColor: '#FFFFFF',
                    backgroundGradientFrom: '#FFFFFF',
                    backgroundGradientTo: '#FFFFFF',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2',
                      stroke: colors.mint[500]
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <MaterialIcons name="insert-chart" size={48} color={colors.gray[300]} />
                  <Text style={styles.noDataText}>データがありません</Text>
                </View>
              )}
            </View>

            {/* 血圧グラフ */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>血圧の推移</Text>
              {graphData.hasBloodPressure ? (
                <LineChart
                  data={{
                    labels: graphData.labels,
                    datasets: [
                      {
                        data: graphData.systolicData,
                        color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`, // ピンク（最高血圧）
                        strokeWidth: 2
                      },
                      {
                        data: graphData.diastolicData,
                        color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`, // 紫（最低血圧）
                        strokeWidth: 2
                      }
                    ],
                    legend: ['最高血圧', '最低血圧']
                  }}
                  width={screenWidth - 40}
                  height={220}
                  yAxisSuffix=" mmHg"
                  chartConfig={{
                    backgroundColor: '#FFFFFF',
                    backgroundGradientFrom: '#FFFFFF',
                    backgroundGradientTo: '#FFFFFF',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '2'
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <MaterialIcons name="insert-chart" size={48} color={colors.gray[300]} />
                  <Text style={styles.noDataText}>データがありません</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {/* 保存ボタン（記録タブのみ） */}
        {activeTab === 'record' && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={saveMeasurement}
              disabled={loading}
            >
              <MaterialIcons 
                name="save" 
                size={20} 
                color={colors.white} 
                style={styles.saveIcon} 
              />
              <Text style={styles.saveButtonText}>
                {loading ? '保存中...' : '測定データを保存'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    height: 70,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pink[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    color: colors.gray[900],
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  inputGrid: {
    gap: spacing.md,
  },
  inputGroup: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginLeft: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[900],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.pink[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  inputUnit: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[200],
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  saveButton: {
    backgroundColor: colors.purple[500],
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  saveIcon: {
    marginRight: spacing.sm,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.purple[500],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[600],
  },
  activeTabText: {
    color: colors.purple[500],
  },
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  historyData: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  historyItem: {
    flex: 1,
    minWidth: '45%',
  },
  historyLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 2,
  },
  historyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  historyNotes: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  emptyHistory: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: spacing.md,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  activePeriod: {
    backgroundColor: colors.purple[100],
    borderColor: colors.purple[500],
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[600],
  },
  activePeriodText: {
    color: colors.purple[500],
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  noDataContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: spacing.sm,
  },
})