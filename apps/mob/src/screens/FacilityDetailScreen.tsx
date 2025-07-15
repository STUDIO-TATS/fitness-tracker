import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

// 施設詳細データの型定義
interface FacilityDetail {
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
  pricing?: {
    membership_monthly: number;
    membership_yearly: number;
    day_pass: number;
    student_discount: number;
    senior_discount: number;
  };
  equipment?: string[];
  classes?: Array<{
    name: string;
    schedule: string;
    instructor: string;
    capacity: number;
  }>;
  description?: string;
}

type RootStackParamList = {
  FacilityDetail: { facility: FacilityDetail };
};

type FacilityDetailScreenRouteProp = RouteProp<RootStackParamList, 'FacilityDetail'>;
type FacilityDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FacilityDetail'>;

interface Props {
  route: FacilityDetailScreenRouteProp;
  navigation: FacilityDetailScreenNavigationProp;
}

export default function FacilityDetailScreen({ route, navigation }: Props) {
  const { facility } = route.params;

  // 施設詳細データ（実際のデータベースデータを模擬）
  const detailData: FacilityDetail = {
    ...facility,
    pricing: {
      membership_monthly: facility.name === '秋川体育館' ? 6800 : 
                         facility.name === 'あきる野市民プール' ? 4500 :
                         facility.name === '五日市ファインプラザ' ? 7200 :
                         facility.name === 'フィットネスワールド渋谷店' ? 12800 : 9800,
      membership_yearly: facility.name === '秋川体育館' ? 68000 : 
                        facility.name === 'あきる野市民プール' ? 45000 :
                        facility.name === '五日市ファインプラザ' ? 72000 :
                        facility.name === 'フィットネスワールド渋谷店' ? 128000 : 98000,
      day_pass: facility.name === '秋川体育館' ? 800 : 
               facility.name === 'あきる野市民プール' ? 500 :
               facility.name === '五日市ファインプラザ' ? 900 :
               facility.name === 'フィットネスワールド渋谷店' ? 1500 : 1200,
      student_discount: 20,
      senior_discount: 15,
    },
    equipment: facility.facility_type === 'gym' ? 
      ['トレッドミル', 'エアロバイク', 'ダンベル', 'バーベル', 'ケーブルマシン', 'レッグプレス', 'ベンチプレス'] :
      facility.facility_type === 'pool' ?
      ['25mプール', '子供用プール', 'ジャグジー', 'サウナ', 'シャワールーム'] :
      ['ヨガマット', 'ブロック', 'ストラップ', '瞑想クッション', 'アロマディフューザー'],
    classes: facility.facility_type === 'gym' ? [
      { name: '筋力トレーニング基礎', schedule: '月・水・金 19:00-20:00', instructor: '田中コーチ', capacity: 15 },
      { name: 'エアロビクス', schedule: '火・木 18:30-19:30', instructor: '佐藤インストラクター', capacity: 20 },
      { name: '初心者向け筋トレ', schedule: '土 10:00-11:00', instructor: '山田トレーナー', capacity: 12 },
    ] : facility.facility_type === 'pool' ? [
      { name: '水中ウォーキング', schedule: '毎日 10:00-11:00', instructor: '鈴木コーチ', capacity: 25 },
      { name: '競泳指導', schedule: '月・水・金 19:00-20:00', instructor: '高橋コーチ', capacity: 10 },
      { name: 'アクアビクス', schedule: '火・木・土 14:00-15:00', instructor: '中村インストラクター', capacity: 15 },
    ] : [
      { name: 'ベーシックヨガ', schedule: '毎日 10:00-11:00', instructor: '田中先生', capacity: 20 },
      { name: 'パワーヨガ', schedule: '月・水・金 19:00-20:00', instructor: '山田先生', capacity: 15 },
      { name: 'リラックスヨガ', schedule: '火・木・土 14:00-15:00', instructor: '佐藤先生', capacity: 18 },
    ],
    description: facility.name === '秋川体育館' ? 
      'あきる野市の中心部にある総合体育館。バスケットボール、バドミントン、卓球など様々なスポーツを楽しめる施設です。地域住民の健康づくりをサポートしています。' :
      facility.name === 'あきる野市民プール' ?
      '25mプールを完備した市民プール。水泳教室やアクアビクスなど水中運動プログラムが充実しています。サウナやジャグジーもご利用いただけます。' :
      facility.name === '五日市ファインプラザ' ?
      '多目的ホールとトレーニングジムを併設した複合施設。会議室もあり、地域のイベントやセミナーにもご利用いただけます。' :
      facility.name === 'フィットネスワールド渋谷店' ?
      '渋谷駅から徒歩5分のアクセス抜群なフィットネスクラブ。最新マシンを完備し、プールやサウナも楽しめる総合フィットネス施設です。' :
      'ヨガとピラティスに特化したスタジオ。経験豊富なインストラクターが、初心者から上級者まで丁寧に指導いたします。'
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

    const days = ['月', '火', '水', '木', '金', '土', '日'];
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    
    return days.map((day, index) => {
      const hours = openingHours[dayKeys[index]];
      return `${day}: ${hours === 'closed' ? '休業' : hours || '不明'}`;
    }).join('\n');
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
      kids_pool: '子供用プール',
      personal_training: 'パーソナルトレーニング',
      locker: 'ロッカー',
      shower_room: 'シャワールーム',
    };

    return Object.entries(features)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => featureLabels[key] || key);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${detailData.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${detailData.email}`);
  };

  return (
    <ScreenWrapper backgroundColor={colors.purple[50]} scrollable>
      <View>
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.purple[600]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>施設詳細</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 施設基本情報 */}
        <View style={styles.facilityCard}>
          <View style={styles.facilityHeader}>
            <View style={styles.facilityIcon}>
              <Ionicons
                name={getFacilityIcon(detailData.facility_type) as any}
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.facilityInfo}>
              <Text style={styles.facilityName}>{detailData.name}</Text>
              <Text style={styles.facilityType}>{getFacilityTypeLabel(detailData.facility_type)}</Text>
              <Text style={styles.companyName}>{detailData.companies?.name}</Text>
            </View>
          </View>

          <Text style={styles.description}>{detailData.description}</Text>

          <View style={styles.contactActions}>
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color={colors.white} />
              <Text style={styles.contactButtonText}>電話</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.contactButton, styles.emailButton]} onPress={handleEmail}>
              <Ionicons name="mail" size={20} color={colors.white} />
              <Text style={styles.contactButtonText}>メール</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 施設情報 */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>施設情報</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={colors.gray[600]} />
            <Text style={styles.infoText}>{detailData.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={colors.gray[600]} />
            <Text style={styles.infoText}>{detailData.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={colors.gray[600]} />
            <Text style={styles.infoText}>{detailData.email}</Text>
          </View>
        </View>

        {/* 営業時間 */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>営業時間</Text>
          <Text style={styles.hoursText}>{getOpeningHours(detailData.opening_hours)}</Text>
        </View>

        {/* 料金設定 */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>料金設定</Text>
          <View style={styles.pricingContainer}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>月会費</Text>
              <Text style={styles.pricingValue}>¥{detailData.pricing?.membership_monthly.toLocaleString()}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>年会費</Text>
              <Text style={styles.pricingValue}>¥{detailData.pricing?.membership_yearly.toLocaleString()}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>1日利用券</Text>
              <Text style={styles.pricingValue}>¥{detailData.pricing?.day_pass.toLocaleString()}</Text>
            </View>
            <View style={styles.discountContainer}>
              <Text style={styles.discountText}>学生割引: {detailData.pricing?.student_discount}% OFF</Text>
              <Text style={styles.discountText}>シニア割引: {detailData.pricing?.senior_discount}% OFF</Text>
            </View>
          </View>
        </View>

        {/* 設備・機器 */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>設備・機器</Text>
          <View style={styles.featuresList}>
            {getFeaturesList(detailData.features).map((feature, index) => (
              <View key={index} style={styles.featureTag}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          {detailData.equipment && (
            <View style={styles.equipmentContainer}>
              <Text style={styles.equipmentTitle}>利用可能機器</Text>
              {detailData.equipment.map((item, index) => (
                <Text key={index} style={styles.equipmentItem}>• {item}</Text>
              ))}
            </View>
          )}
        </View>

        {/* クラス・プログラム */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>クラス・プログラム</Text>
          {detailData.classes?.map((classItem, index) => (
            <View key={index} style={styles.classItem}>
              <Text style={styles.className}>{classItem.name}</Text>
              <Text style={styles.classSchedule}>{classItem.schedule}</Text>
              <Text style={styles.classInstructor}>講師: {classItem.instructor}</Text>
              <Text style={styles.classCapacity}>定員: {classItem.capacity}名</Text>
            </View>
          ))}
        </View>

        {/* 予約・問い合わせボタン */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.reservationButton}>
            <Ionicons name="calendar-outline" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>予約・見学申込</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qrButton}>
            <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
            <Text style={styles.qrButtonText}>QRコード</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: layout.screenPadding,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  headerTitle: {
    ...typography.screenTitle,
    color: colors.purple[700],
  },
  placeholder: {
    width: 40,
  },
  facilityCard: {
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.md,
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  facilityIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    ...typography.screenTitle,
    color: colors.gray[900],
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  facilityType: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  companyName: {
    ...typography.small,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.gray[700],
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  contactActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  emailButton: {
    backgroundColor: colors.mint[500],
  },
  contactButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.md,
  },
  cardTitle: {
    ...typography.sectionTitle,
    color: colors.gray[900],
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.body,
    color: colors.gray[700],
    marginLeft: spacing.md,
    flex: 1,
  },
  hoursText: {
    ...typography.body,
    color: colors.gray[700],
    lineHeight: 24,
  },
  pricingContainer: {
    gap: spacing.md,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  pricingLabel: {
    ...typography.body,
    color: colors.gray[700],
  },
  pricingValue: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: '600',
  },
  discountContainer: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  discountText: {
    ...typography.small,
    color: colors.mint[600],
    fontWeight: '500',
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureTag: {
    backgroundColor: colors.mint[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  featureText: {
    ...typography.small,
    color: colors.mint[700],
    fontWeight: '500',
  },
  equipmentContainer: {
    marginTop: spacing.md,
  },
  equipmentTitle: {
    ...typography.body,
    color: colors.gray[700],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  equipmentItem: {
    ...typography.small,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  classItem: {
    backgroundColor: colors.purple[50],
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  className: {
    ...typography.body,
    color: colors.purple[700],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  classSchedule: {
    ...typography.small,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  classInstructor: {
    ...typography.small,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  classCapacity: {
    ...typography.small,
    color: colors.gray[600],
  },
  actionContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  reservationButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  qrButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '20',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  qrButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});