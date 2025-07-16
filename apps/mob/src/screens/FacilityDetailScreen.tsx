import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { RootDrawerParamList } from "../types/navigation";
import { KeyboardAvoidingWrapper } from "../components/KeyboardAvoidingWrapper";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { colors } from "../constants/colors";
import {
  spacing,
  typography,
  layout,
  borderRadius,
  shadows,
} from "../constants/styles";
import { supabase } from "../lib/supabase";
import { useI18n } from "../hooks/useI18n";

// 施設詳細データの型定義
interface FacilityDetail {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  facility_type: string;
  opening_hours: any;
  features: any;
  company_id: string;
  qr_code: string | null;
  latitude: number | null;
  longitude: number | null;
  companies?: {
    name: string;
    code: string;
  };
  activity_types?: Array<{
    id: string;
    name: string;
    category: string;
    description: string | null;
    duration_minutes: number | null;
    calories_per_hour: number | null;
  }>;
}

type Props = DrawerScreenProps<RootDrawerParamList, "FacilityDetail">;

export default function FacilityDetailScreen({ route }: Props) {
  const { facility } = route.params;
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState<FacilityDetail | null>(null);

  useEffect(() => {
    fetchFacilityDetails();
  }, [facility.id]);

  const fetchFacilityDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch facility with related data
      const { data: facilityData, error: facilityError } = await supabase
        .from("facilities")
        .select(`
          *,
          companies (
            name,
            code
          ),
          activity_types (
            id,
            name,
            category,
            description,
            duration_minutes,
            calories_per_hour
          )
        `)
        .eq("id", facility.id)
        .single();

      if (facilityError) throw facilityError;

      if (facilityData) {
        setDetailData(facilityData as FacilityDetail);
      }
    } catch (error) {
      console.error("Error fetching facility details:", error);
      Alert.alert(t("common.error"), t("common.dataLoadError"));
    } finally {
      setLoading(false);
    }
  };

  const getFacilityIcon = (facilityType: string) => {
    switch (facilityType) {
      case "gym":
        return "barbell";
      case "pool":
        return "water";
      case "yoga_studio":
        return "flower";
      default:
        return "business";
    }
  };

  const getFacilityTypeLabel = (facilityType: string) => {
    switch (facilityType) {
      case "gym":
        return "ジム";
      case "pool":
        return "プール";
      case "yoga_studio":
        return "ヨガスタジオ";
      default:
        return "フィットネス";
    }
  };

  const getOpeningHours = (openingHours: any) => {
    if (!openingHours || typeof openingHours !== "object") {
      return "営業時間不明";
    }

    const days = ["月", "火", "水", "木", "金", "土", "日"];
    const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

    return days
      .map((day, index) => {
        const hours = openingHours[dayKeys[index]];
        return `${day}: ${hours === "closed" ? "休業" : hours || "不明"}`;
      })
      .join("\n");
  };

  const getFeaturesList = (features: any) => {
    if (!features || typeof features !== "object") {
      return [];
    }

    const featureLabels: { [key: string]: string } = {
      pool: "プール",
      sauna: "サウナ",
      parking: "駐車場",
      gym: "ジム",
      basketball: "バスケットボール",
      badminton: "バドミントン",
      volleyball: "バレーボール",
      shower: "シャワー",
      yoga_room: "ヨガルーム",
      studio: "スタジオ",
      cafe: "カフェ",
      wheelchair_accessible: "バリアフリー",
      conference_room: "会議室",
      kids_pool: "子供用プール",
      personal_training: "パーソナルトレーニング",
      locker: "ロッカー",
      shower_room: "シャワールーム",
    };

    return Object.entries(features)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => featureLabels[key] || key);
  };

  const handleCall = () => {
    if (detailData?.phone) {
      Linking.openURL(`tel:${detailData.phone}`);
    }
  };

  const handleEmail = () => {
    if (detailData?.email) {
      Linking.openURL(`mailto:${detailData.email}`);
    }
  };

  const handleQRCode = () => {
    // TODO: Implement QR code display
    Alert.alert("QRコード", `QRコード: ${detailData?.qr_code || '未設定'}`);
  };

  const handleReservation = () => {
    // TODO: Implement reservation
    Alert.alert("予約", "予約機能は準備中です");
  };

  if (loading) {
    return (
      <KeyboardAvoidingWrapper>
        <ScreenWrapper backgroundColor={colors.purple[50]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{t("common.loading")}</Text>
          </View>
        </ScreenWrapper>
      </KeyboardAvoidingWrapper>
    );
  }

  if (!detailData) {
    return (
      <KeyboardAvoidingWrapper>
        <ScreenWrapper backgroundColor={colors.purple[50]}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t("common.noData")}</Text>
          </View>
        </ScreenWrapper>
      </KeyboardAvoidingWrapper>
    );
  }

  return (
    <KeyboardAvoidingWrapper>
      <ScreenWrapper backgroundColor={colors.purple[50]} scrollable keyboardAvoiding={false} dismissKeyboardOnTap={false}>
      <View>
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
              <Text style={styles.facilityType}>
                {getFacilityTypeLabel(detailData.facility_type)}
              </Text>
              <Text style={styles.companyName}>
                {detailData.companies?.name}
              </Text>
            </View>
          </View>

          {detailData.features?.description && (
            <Text style={styles.description}>{detailData.features.description}</Text>
          )}

          <View style={styles.contactActions}>
            {detailData.phone && (
              <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                <Ionicons name="call" size={20} color={colors.white} />
                <Text style={styles.contactButtonText}>電話</Text>
              </TouchableOpacity>
            )}
            {detailData.email && (
              <TouchableOpacity
                style={[styles.contactButton, styles.emailButton]}
                onPress={handleEmail}
              >
                <Ionicons name="mail" size={20} color={colors.white} />
                <Text style={styles.contactButtonText}>メール</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 施設情報 */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>施設情報</Text>
          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.gray[600]}
            />
            <Text style={styles.infoText}>{detailData.address || "住所不明"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={colors.gray[600]} />
            <Text style={styles.infoText}>{detailData.phone || "電話番号不明"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={colors.gray[600]} />
            <Text style={styles.infoText}>{detailData.email || "メールアドレス不明"}</Text>
          </View>
        </View>

        {/* 営業時間 */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>営業時間</Text>
          <Text style={styles.hoursText}>
            {getOpeningHours(detailData.opening_hours)}
          </Text>
        </View>

        {/* 料金設定 - 将来的に料金テーブルから取得 */}
        {detailData.features?.pricing && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>料金設定</Text>
            <View style={styles.pricingContainer}>
              <Text style={styles.pricingLabel}>
                料金情報は施設にお問い合わせください
              </Text>
            </View>
          </View>
        )}

        {/* 設備・機器 */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>設備・サービス</Text>
          <View style={styles.featuresList}>
            {getFeaturesList(detailData.features).map((feature, index) => (
              <View key={index} style={styles.featureTag}>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* アクティビティタイプ */}
        {detailData.activity_types && detailData.activity_types.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>利用可能なアクティビティ</Text>
            {detailData.activity_types.map((activity) => (
              <View key={activity.id} style={styles.classItem}>
                <Text style={styles.className}>{activity.name}</Text>
                {activity.description && (
                  <Text style={styles.classSchedule}>{activity.description}</Text>
                )}
                <View style={styles.activityDetails}>
                  {activity.duration_minutes && (
                    <Text style={styles.classCapacity}>
                      所要時間: {activity.duration_minutes}分
                    </Text>
                  )}
                  {activity.calories_per_hour && (
                    <Text style={styles.classCapacity}>
                      消費カロリー: {activity.calories_per_hour}kcal/時間
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 予約・問い合わせボタン */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.reservationButton} onPress={handleReservation}>
            <Ionicons name="calendar-outline" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>予約・見学申込</Text>
          </TouchableOpacity>
          {detailData.qr_code && (
            <TouchableOpacity style={styles.qrButton} onPress={handleQRCode}>
              <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
              <Text style={styles.qrButtonText}>QRコード</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 20 }} />
      </View>
      </ScreenWrapper>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  facilityCard: {
    backgroundColor: colors.white,
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.md,
  },
  facilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  facilityIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "600",
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
    flexDirection: "row",
    gap: spacing.md,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "600",
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
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontWeight: "600",
  },
  discountContainer: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  discountText: {
    ...typography.small,
    color: colors.mint[600],
    fontWeight: "500",
  },
  featuresList: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontWeight: "500",
  },
  equipmentContainer: {
    marginTop: spacing.md,
  },
  equipmentTitle: {
    ...typography.body,
    color: colors.gray[700],
    fontWeight: "600",
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
    fontWeight: "600",
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
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  reservationButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  qrButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary + "20",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  qrButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.gray[600],
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: layout.screenPadding,
  },
  errorText: {
    ...typography.body,
    color: colors.gray[600],
    textAlign: "center",
  },
  activityDetails: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
});
