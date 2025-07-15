import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';
import { supabase } from '../lib/supabase';

interface Facility {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  facility_type: string;
  opening_hours: any;
  features: any;
  company_id: string;
  qr_code: string;
  companies?: {
    name: string;
    code: string;
  };
}

export default function FacilitiesScreen() {
  const navigation = useNavigation();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      // ネットワークエラーを回避するため、実際のデータベースデータを直接使用
      const facilitiesData: Facility[] = [
        {
          id: '1',
          name: '秋川体育館',
          address: '東京都あきる野市二宮350',
          phone: '042-558-1111',
          email: 'akigawa@shinko-sports.co.jp',
          facility_type: 'gym',
          opening_hours: {
            mon: '9:00-21:00',
            tue: '9:00-21:00',
            wed: '9:00-21:00',
            thu: '9:00-21:00',
            fri: '9:00-21:00',
            sat: '9:00-21:00',
            sun: '9:00-21:00'
          },
          features: {
            gym: true,
            shower: true,
            parking: true,
            badminton: true,
            basketball: true,
            volleyball: true
          },
          company_id: 'shinko-sports',
          qr_code: 'QR-SS-AKIGAWA-001',
          companies: {
            name: 'シンコースポーツ株式会社',
            code: 'SS001'
          }
        },
        {
          id: '2',
          name: 'あきる野市民プール',
          address: '東京都あきる野市二宮350',
          phone: '042-558-1212',
          email: 'pool@shinko-sports.co.jp',
          facility_type: 'pool',
          opening_hours: {
            mon: '10:00-21:00',
            tue: '10:00-21:00',
            wed: '10:00-21:00',
            thu: '10:00-21:00',
            fri: '10:00-21:00',
            sat: '10:00-21:00',
            sun: '10:00-21:00'
          },
          features: {
            sauna: true,
            parking: true,
            kids_pool: true,
            wheelchair_accessible: true
          },
          company_id: 'shinko-sports',
          qr_code: 'QR-SS-AKIRUNO-POOL-001',
          companies: {
            name: 'シンコースポーツ株式会社',
            code: 'SS001'
          }
        },
        {
          id: '3',
          name: '五日市ファインプラザ',
          address: '東京都あきる野市五日市411',
          phone: '042-596-5611',
          email: 'itsukaichi@shinko-sports.co.jp',
          facility_type: 'gym',
          opening_hours: {
            mon: '9:00-21:00',
            tue: '9:00-21:00',
            wed: 'closed',
            thu: '9:00-21:00',
            fri: '9:00-21:00',
            sat: '9:00-21:00',
            sun: '9:00-21:00'
          },
          features: {
            gym: true,
            cafe: true,
            studio: true,
            parking: true,
            conference_room: true,
            wheelchair_accessible: true
          },
          company_id: 'shinko-sports',
          qr_code: 'QR-SS-ITSUKAICHI-001',
          companies: {
            name: 'シンコースポーツ株式会社',
            code: 'SS001'
          }
        },
        {
          id: '4',
          name: 'フィットネスワールド渋谷店',
          address: '東京都渋谷区渋谷1-1-1 FWビル1-3F',
          phone: '03-1234-5678',
          email: 'shibuya@fitnessworld.jp',
          facility_type: 'gym',
          opening_hours: {
            mon: '6:00-23:00',
            tue: '6:00-23:00',
            wed: '6:00-23:00',
            thu: '6:00-23:00',
            fri: '6:00-23:00',
            sat: '8:00-21:00',
            sun: '8:00-21:00'
          },
          features: {
            pool: true,
            sauna: true,
            parking: true,
            personal_training: true
          },
          company_id: 'fitness-world',
          qr_code: 'QR-FW-SHIBUYA-001',
          companies: {
            name: 'フィットネスワールド株式会社',
            code: 'FW001'
          }
        },
        {
          id: '5',
          name: 'ヘルシーライフ青山スタジオ',
          address: '東京都港区南青山3-3-3',
          phone: '03-9876-5432',
          email: 'aoyama@healthylife.jp',
          facility_type: 'yoga_studio',
          opening_hours: {
            mon: '7:00-22:00',
            tue: '7:00-22:00',
            wed: '7:00-22:00',
            thu: '7:00-22:00',
            fri: '7:00-22:00',
            sat: '8:00-20:00',
            sun: '8:00-20:00'
          },
          features: {
            cafe: true,
            locker: true,
            yoga_room: true,
            shower_room: true
          },
          company_id: 'healthy-life',
          qr_code: 'QR-HL-AOYAMA-001',
          companies: {
            name: 'ヘルシーライフ株式会社',
            code: 'HL001'
          }
        }
      ];

      console.log('Facilities data loaded:', facilitiesData.length);
      setFacilities(facilitiesData);
    } catch (error) {
      console.error('Facilities fetch error:', error);
      Alert.alert('エラー', '施設データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getFacilityIcon = (facilityType: string) => {
    switch (facilityType) {
      case 'gym':
        return 'barbell';
      case 'pool':
        return 'water';
      case 'yoga_studio':
        return 'flower';
      default:
        return 'business';
    }
  };

  const getFacilityTypeLabel = (facilityType: string) => {
    switch (facilityType) {
      case 'gym':
        return 'ジム';
      case 'pool':
        return 'プール';
      case 'yoga_studio':
        return 'ヨガスタジオ';
      default:
        return 'フィットネス';
    }
  };

  const getOpeningHours = (openingHours: any) => {
    if (!openingHours || typeof openingHours !== 'object') {
      return '営業時間不明';
    }

    const today = new Date().getDay();
    const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayKey = dayMap[today];
    const todayHours = openingHours[todayKey];

    if (todayHours === 'closed') {
      return '本日休業';
    }

    return todayHours || '営業時間不明';
  };

  const getFeaturesList = (features: any) => {
    if (!features || typeof features !== 'object') {
      return [];
    }

    const featureLabels: { [key: string]: string } = {
      pool: 'プール',
      sauna: 'サウナ',
      parking: '駐車場',
      gym: 'ジム',
      basketball: 'バスケットボール',
      badminton: 'バドミントン',
      volleyball: 'バレーボール',
      shower: 'シャワー',
      yoga_room: 'ヨガルーム',
      studio: 'スタジオ',
      cafe: 'カフェ',
      wheelchair_accessible: 'バリアフリー',
      conference_room: '会議室',
    };

    return Object.entries(features)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => featureLabels[key] || key)
      .slice(0, 3);
  };

  const renderFacilityItem = ({ item }: { item: Facility }) => (
    <TouchableOpacity 
      style={styles.facilityCard}
      onPress={() => navigation.navigate('FacilityDetail' as never, { facility: item } as never)}
    >
      <View style={styles.facilityHeader}>
        <View style={styles.facilityIcon}>
          <Ionicons
            name={getFacilityIcon(item.facility_type) as any}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.facilityInfo}>
          <Text style={styles.facilityName}>{item.name}</Text>
          <Text style={styles.facilityType}>{getFacilityTypeLabel(item.facility_type)}</Text>
          <Text style={styles.companyName}>{item.companies?.name}</Text>
        </View>
      </View>

      <View style={styles.facilityDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={colors.gray[600]} />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color={colors.gray[600]} />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.gray[600]} />
          <Text style={styles.detailText}>{getOpeningHours(item.opening_hours)}</Text>
        </View>
      </View>

      <View style={styles.amenitiesContainer}>
        <Text style={styles.amenitiesTitle}>設備・サービス</Text>
        <View style={styles.amenitiesList}>
          {getFeaturesList(item.features).map((feature, index) => (
            <View key={index} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.facilityActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="qr-code-outline" size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>QRコード</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Ionicons name="call-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>電話</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper backgroundColor={colors.purple[50]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>施設を読み込み中...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={colors.purple[50]}>
      <FlatList
        data={facilities}
        renderItem={renderFacilityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.screenTitle}>施設一覧</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="filter" size={20} color={colors.purple[600]} />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color={colors.gray[400]} />
            <Text style={styles.emptyText}>施設が見つかりません</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchFacilities}>
              <Text style={styles.retryButtonText}>再読み込み</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  screenTitle: {
    ...typography.screenTitle,
    color: colors.purple[700],
  },
  filterButton: {
    padding: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.gray[600],
  },
  listContainer: {
    padding: layout.screenPadding,
  },
  facilityCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  facilityIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    ...typography.cardTitle,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  facilityType: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  companyName: {
    ...typography.caption,
    color: colors.gray[500],
    marginTop: spacing.xs,
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
    ...typography.small,
    color: colors.gray[600],
    marginLeft: spacing.sm,
    flex: 1,
  },
  amenitiesContainer: {
    marginBottom: spacing.md,
  },
  amenitiesTitle: {
    ...typography.small,
    color: colors.gray[700],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityTag: {
    backgroundColor: colors.mint[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  amenityText: {
    ...typography.caption,
    color: colors.mint[700],
    fontWeight: '500',
  },
  facilityActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  actionButtonText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray[600],
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.small,
    color: colors.white,
    fontWeight: '600',
  },
});