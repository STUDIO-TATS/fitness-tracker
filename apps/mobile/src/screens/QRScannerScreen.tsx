import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface FacilityInfo {
  facility_id: string
  facility_name: string
  company_name: string
  branch_name: string | null
  facility_type: string
  available_activities: any[]
}

export const QRScannerScreen = () => {
  const { user } = useAuth()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [scannedData, setScannedData] = useState<string>('')
  const [facilityInfo, setFacilityInfo] = useState<FacilityInfo | null>(null)
  const [showFacilityModal, setShowFacilityModal] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return
    
    setScanned(true)
    setScannedData(data)
    
    try {
      // QRコードから施設情報を取得
      const { data: facilityData, error } = await supabase
        .rpc('get_facility_by_qr_code', { qr_code_input: data })
      
      if (error) throw error
      
      if (facilityData && facilityData.length > 0) {
        setFacilityInfo(facilityData[0])
        setShowFacilityModal(true)
      } else {
        Alert.alert('エラー', '有効な施設のQRコードではありません')
        setScanned(false)
      }
    } catch (error: any) {
      console.error('QRコードスキャンエラー:', error)
      Alert.alert('エラー', 'QRコードの読み取りに失敗しました')
      setScanned(false)
    }
  }

  const resetScanner = () => {
    setScanned(false)
    setScannedData('')
    setFacilityInfo(null)
    setShowFacilityModal(false)
  }

  const handleCheckIn = async () => {
    if (!user || !facilityInfo) return
    
    setCheckingIn(true)
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          company_id: facilityInfo.facility_id, // 本来はcompany_idを取得すべき
          facility_id: facilityInfo.facility_id,
          check_in_time: new Date().toISOString(),
          notes: 'QRコードでチェックイン'
        })
      
      if (error) throw error
      
      Alert.alert('成功', `${facilityInfo.facility_name}にチェックインしました`)
      setShowFacilityModal(false)
      setScanned(false)
    } catch (error: any) {
      console.error('チェックインエラー:', error)
      Alert.alert('エラー', 'チェックインに失敗しました')
    } finally {
      setCheckingIn(false)
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

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>カメラ権限を確認中...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>カメラへのアクセスが許可されていません</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>カメラを許可</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>QRコードスキャナー</Text>
          <Text style={styles.subtitle}>QRコードをカメラに向けてください</Text>
        </View>

        {!scanned ? (
          <View style={styles.scannerContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "pdf417"],
              }}
            />
            <View style={styles.overlay}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.successText}>読み取り成功！</Text>
            <View style={styles.dataContainer}>
              <Text style={styles.dataLabel}>読み取ったデータ:</Text>
              <Text style={styles.dataText}>{scannedData}</Text>
            </View>
            <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
              <Text style={styles.resetButtonText}>もう一度スキャンする</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 施設情報モーダル */}
        <Modal
          visible={showFacilityModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>施設情報</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowFacilityModal(false)
                  setScanned(false)
                }}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.facilityCard}>
                <View style={styles.facilityHeader}>
                  <MaterialCommunityIcons 
                    name="office-building" 
                    size={32} 
                    color="#2563EB" 
                    style={styles.facilityIcon}
                  />
                  <View style={styles.facilityInfo}>
                    <Text style={styles.facilityName}>
                      {facilityInfo?.facility_name}
                    </Text>
                    <Text style={styles.companyName}>
                      {facilityInfo?.company_name}
                    </Text>
                    {facilityInfo?.branch_name && (
                      <Text style={styles.branchName}>
                        {facilityInfo.branch_name}
                      </Text>
                    )}
                    <Text style={styles.facilityType}>
                      {getFacilityTypeLabel(facilityInfo?.facility_type || '')}
                    </Text>
                  </View>
                </View>

                {facilityInfo?.available_activities && facilityInfo.available_activities.length > 0 && (
                  <View style={styles.activitiesSection}>
                    <Text style={styles.sectionTitle}>
                      利用可能なアクティビティ
                    </Text>
                    {facilityInfo.available_activities.map((activity: any, index: number) => (
                      <View key={index} style={styles.activityItem}>
                        <MaterialCommunityIcons name="play-circle" size={16} color="#10B981" />
                        <Text style={styles.activityText}>
                          {activity.name}
                        </Text>
                        <Text style={styles.activityCategory}>
                          {activity.category}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.checkInButton}
                  onPress={handleCheckIn}
                  disabled={checkingIn}
                >
                  <Text style={styles.checkInButtonText}>
                    {checkingIn ? 'チェックイン中...' : 'チェックイン'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowFacilityModal(false)
                    setScanned(false)
                  }}
                >
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B7280',
  },
  scannerContainer: {
    height: 300,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#2563EB',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  resultContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 30,
  },
  dataContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dataLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  dataText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  resetButton: {
    marginTop: 30,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionButton: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // モーダルスタイル
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  facilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  facilityIcon: {
    marginRight: 16,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 2,
  },
  branchName: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  facilityType: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  activitiesSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  activityCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    gap: 12,
  },
  checkInButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
})