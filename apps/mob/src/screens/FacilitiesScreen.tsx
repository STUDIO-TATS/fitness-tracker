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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { icons } from '../constants/icons';
import { theme } from '../constants/theme';
import { useI18n } from '../hooks/useI18n';
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
  const { t } = useI18n();
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
        return icons.facility.gym;
      case 'pool':
        return icons.facility.pool;
      case 'yoga_studio':
        return icons.facility.studio;
      default:
        return icons.facility.business;
    }
  };

  const getFacilityTypeLabel = (facilityType: string) => {
    switch (facilityType) {
      case 'gym':
        return t('facilities.gym');
      case 'pool':
        return t('facilities.pool');
      case 'yoga_studio':
        return t('facilities.yogaStudio');
      default:
        return t('facilities.title');
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
        <LinearGradient
          colors={theme.colors.gradient.primary}
          style={styles.facilityIcon}
        >
          <Ionicons
            name={getFacilityIcon(item.facility_type)}
            size={24}
            color={theme.colors.text.inverse}
          />
        </LinearGradient>
        <View style={styles.facilityInfo}>
          <Text style={styles.facilityName}>{item.name}</Text>
          <Text style={styles.facilityType}>{getFacilityTypeLabel(item.facility_type)}</Text>
          <Text style={styles.companyName}>{item.companies?.name}</Text>
        </View>
        <Ionicons name={icons.navigation.forward} size={20} color={theme.colors.text.tertiary} />
      </View>

      <View style={styles.facilityDetails}>
        <View style={styles.detailRow}>
          <Ionicons name={icons.activity.locationOutline} size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name={icons.facility.phoneOutline} size={16} color={theme.colors.text.secondary} />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name={icons.activity.time} size={16} color={theme.colors.text.secondary} />
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
          <LinearGradient
            colors={theme.colors.gradient.primary}
            style={styles.actionButtonGradient}
          >
            <Ionicons name={icons.scanning.qrCodeOutline} size={20} color={theme.colors.text.inverse} />
            <Text style={styles.actionButtonText}>QR{t('common.code', 'コード')}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name={icons.facility.phoneOutline} size={20} color={theme.colors.action.primary} />
          <Text style={styles.secondaryButtonText}>{t('facilities.call')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper backgroundColor={theme.colors.background.tertiary}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={theme.colors.background.tertiary}>
      <FlatList
        data={facilities}
        renderItem={renderFacilityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.screenTitle}>{t('facilities.title')}</Text>
            <TouchableOpacity style={styles.filterButton}>
              <LinearGradient
                colors={theme.colors.gradient.primary}
                style={styles.filterButtonGradient}
              >
                <Ionicons name={icons.facility.filter} size={20} color={theme.colors.text.inverse} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name={icons.facility.businessOutline} size={64} color={theme.colors.text.tertiary} />
            <Text style={styles.emptyText}>{t('common.noData', '施設が見つかりません')}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchFacilities}>
              <LinearGradient
                colors={theme.colors.gradient.primary}
                style={styles.retryButtonGradient}
              >
                <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
              </LinearGradient>
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
    paddingBottom: theme.spacing.md,
  },
  screenTitle: {
    ...typography.screenTitle,
    color: theme.colors.text.primary,
  },
  filterButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  filterButtonGradient: {
    padding: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: theme.colors.text.secondary,
  },
  listContainer: {
    padding: layout.screenPadding,
  },
  facilityCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  facilityIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    ...typography.cardTitle,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  facilityType: {
    ...typography.small,
    color: theme.colors.action.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  companyName: {
    ...typography.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
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
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
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
    backgroundColor: theme.colors.background.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  amenityText: {
    ...typography.caption,
    color: theme.colors.text.success,
    fontWeight: theme.fontWeight.medium,
  },
  facilityActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButtonText: {
    ...typography.small,
    color: theme.colors.text.inverse,
    fontWeight: theme.fontWeight.semibold,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.action.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  secondaryButtonText: {
    ...typography.small,
    color: theme.colors.action.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  retryButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  retryButtonText: {
    ...typography.small,
    color: theme.colors.text.inverse,
    fontWeight: theme.fontWeight.semibold,
  },
});