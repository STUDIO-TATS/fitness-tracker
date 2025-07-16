import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { RootDrawerParamList } from "../types/navigation";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { colors } from "../constants/colors";
import { icons } from "../constants/icons";
import { theme } from "../constants/theme";
import { useI18n } from "../hooks/useI18n";
import {
  commonStyles,
  spacing,
  typography,
  layout,
  borderRadius,
  shadows,
} from "../constants/styles";
import { supabase } from "../lib/supabase";
import type { FacilityWithCompany } from "../types/database";
import { facilityFeatureLabels } from "../types/facilityFeatures";

type FacilitiesScreenNavigationProp = DrawerNavigationProp<
  RootDrawerParamList,
  "Facilities"
>;

export default function FacilitiesScreen() {
  const navigation = useNavigation<FacilitiesScreenNavigationProp>();
  const { t } = useI18n();
  const [facilities, setFacilities] = useState<FacilityWithCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select(`
          *,
          companies (
            name,
            code
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      if (data) {
        console.log("Facilities data loaded:", data.length);
        setFacilities(data as FacilityWithCompany[]);
      } else {
        setFacilities([]);
      }
    } catch (error) {
      console.error("Facilities fetch error:", error);
      Alert.alert(t("common.error"), t("common.facilityDataError"));
    } finally {
      setLoading(false);
    }
  };

  const getFacilityIcon = (facilityType: string) => {
    switch (facilityType) {
      case "gym":
        return icons.facility.gym;
      case "pool":
        return icons.facility.pool;
      case "yoga_studio":
        return icons.facility.studio;
      default:
        return icons.facility.business;
    }
  };

  const getFacilityTypeLabel = (facilityType: string) => {
    switch (facilityType) {
      case "gym":
        return t("facilities.gym");
      case "pool":
        return t("facilities.pool");
      case "yoga_studio":
        return t("facilities.yogaStudio");
      default:
        return t("facilities.title");
    }
  };

  const getOpeningHours = (openingHours: any) => {
    if (!openingHours || typeof openingHours !== "object") {
      return "営業時間不明";
    }

    const today = new Date().getDay();
    const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const todayKey = dayMap[today];
    const todayHours = openingHours[todayKey];

    if (todayHours === "closed") {
      return "本日休業";
    }

    return todayHours || "営業時間不明";
  };

  const getFeaturesList = (features: any) => {
    if (!features || typeof features !== "object") {
      return [];
    }

    return Object.entries(features)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => facilityFeatureLabels[key] || key)
      .slice(0, 3);
  };

  const renderFacilityItem = ({ item }: { item: FacilityWithCompany }) => (
    <TouchableOpacity
      style={styles.facilityCard}
      onPress={() => navigation.navigate("FacilityDetail", { facility: item })}
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
          <Text style={styles.facilityType}>
            {getFacilityTypeLabel(item.facility_type)}
          </Text>
          <Text style={styles.companyName}>{item.companies?.name}</Text>
        </View>
        <Ionicons
          name={icons.navigation.forward}
          size={20}
          color={theme.colors.text.tertiary}
        />
      </View>

      <View style={styles.facilityDetails}>
        <View style={styles.detailRow}>
          <Ionicons
            name={icons.activity.locationOutline}
            size={16}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name={icons.facility.phoneOutline}
            size={16}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name={icons.activity.time}
            size={16}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.detailText}>
            {getOpeningHours(item.opening_hours)}
          </Text>
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
            <Ionicons
              name={icons.scanning.qrCodeOutline}
              size={20}
              color={theme.colors.text.inverse}
            />
            <Text style={styles.actionButtonText}>QR{t("common.code")}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons
            name={icons.facility.phoneOutline}
            size={20}
            color={theme.colors.action.primary}
          />
          <Text style={styles.secondaryButtonText}>{t("facilities.call")}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper backgroundColor={theme.colors.background.tertiary}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
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
            <Text style={styles.screenTitle}>{t("facilities.title")}</Text>
            <TouchableOpacity style={styles.filterButton}>
              <LinearGradient
                colors={theme.colors.gradient.primary}
                style={styles.filterButtonGradient}
              >
                <Ionicons
                  name={icons.facility.filter}
                  size={20}
                  color={theme.colors.text.inverse}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={icons.facility.businessOutline}
              size={64}
              color={theme.colors.text.tertiary}
            />
            <Text style={styles.emptyText}>{t("common.noData")}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchFacilities}
            >
              <LinearGradient
                colors={theme.colors.gradient.primary}
                style={styles.retryButtonGradient}
              >
                <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: layout.screenPadding,
    paddingBottom: theme.spacing.md,
  },
  screenTitle: {
    ...typography.screenTitle,
    color: theme.colors.text.primary,
  },
  filterButton: {
    borderRadius: theme.borderRadius.full,
    overflow: "hidden",
  },
  filterButtonGradient: {
    padding: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  facilityIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
    overflow: "hidden",
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
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  amenitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    justifyContent: "center",
    alignItems: "center",
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
    overflow: "hidden",
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
