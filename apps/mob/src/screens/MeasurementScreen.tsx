import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  SafeAreaView,
  Keyboard,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { ChartSection } from "../components/ChartSection";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { colors } from "../constants/colors";
import { icons } from "../constants/icons";
import { theme } from "../constants/theme";
import { useI18n } from "../hooks/useI18n";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { MeasurementStackParamList } from "../navigation/MeasurementStackNavigator";
import {
  commonStyles,
  spacing,
  typography,
  layout,
  borderRadius,
  shadows,
} from "../constants/styles";

interface Measurement {
  id: string;
  measurement_date: string;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  bmi?: number;
  measurements?: {
    systolic_bp?: number;
    diastolic_bp?: number;
    [key: string]: any;
  };
  notes?: string;
}

// Helper interface for display
interface MeasurementDisplay {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscle?: number;
  systolicBP?: number;
  diastolicBP?: number;
}

type MeasurementNavigationProp = StackNavigationProp<
  MeasurementStackParamList,
  'MeasurementMain'
>;

export default function MeasurementScreen() {
  const { t } = useI18n();
  const { session } = useAuth();
  const user = session?.user;
  const navigation = useNavigation<MeasurementNavigationProp>();
  const weightInputRef = useRef<TextInput>(null);
  const bodyFatInputRef = useRef<TextInput>(null);
  const muscleInputRef = useRef<TextInput>(null);
  const systolicBPInputRef = useRef<TextInput>(null);
  const diastolicBPInputRef = useRef<TextInput>(null);
  const [measurements, setMeasurements] = useState<MeasurementDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscle, setMuscle] = useState("");
  const [systolicBP, setSystolicBP] = useState("");
  const [diastolicBP, setDiastolicBP] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      fetchMeasurements();
    }, [user])
  );

  const fetchMeasurements = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("measurements")
        .select("*")
        .eq("user_id", user.id)
        .order("measurement_date", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Map database format to display format
      const displayMeasurements: MeasurementDisplay[] = (data || []).map(m => ({
        id: m.id,
        date: m.measurement_date,
        weight: m.weight || undefined,
        bodyFat: m.body_fat_percentage || undefined,
        muscle: m.muscle_mass || undefined,
        systolicBP: m.measurements?.systolic_bp || undefined,
        diastolicBP: m.measurements?.diastolic_bp || undefined
      }));
      setMeasurements(displayMeasurements);
    } catch (error) {
      console.error("Error fetching measurements:", error);
      Alert.alert("エラー", "測定データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };
  const [weightPeriod, setWeightPeriod] = useState<
    "1month" | "3month" | "6month" | "1year"
  >("1month");
  const [bpPeriod, setBpPeriod] = useState<
    "1month" | "3month" | "6month" | "1year"
  >("1month");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<
    "weight" | "bloodPressure" | "bodyFat" | "muscle"
  >("weight");

  // モーダルが開かれたときに最初の入力フィールドにフォーカス
  useEffect(() => {
    if (modalVisible && weightInputRef.current) {
      // 少し遅延してからフォーカスを設定
      const timeout = setTimeout(() => {
        weightInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [modalVisible]);

  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];

  const weightChange =
    latestMeasurement && previousMeasurement
      ? (latestMeasurement.weight || 0) - (previousMeasurement.weight || 0)
      : 0;

  const bpChange =
    latestMeasurement &&
    previousMeasurement &&
    latestMeasurement.systolicBP &&
    previousMeasurement.systolicBP
      ? latestMeasurement.systolicBP - previousMeasurement.systolicBP
      : 0;

  const handleSave = () => {
    // キーボードを閉じる
    Keyboard.dismiss();
    // ここで新しい測定データを保存
    setModalVisible(false);
    setWeight("");
    setBodyFat("");
    setMuscle("");
    setSystolicBP("");
    setDiastolicBP("");
  };

  const handleCancel = () => {
    // キーボードを閉じる
    Keyboard.dismiss();
    setModalVisible(false);
  };

  const handleCardPress = (
    metric: "weight" | "bloodPressure" | "bodyFat" | "muscle"
  ) => {
    setSelectedMetric(metric);
    setDetailModalVisible(true);
  };

  // 体重グラフデータ
  const weightData = {
    "1month": {
      labels: ["1", "2", "3", "4", "5"],
      datasets: [
        {
          data: [72, 71.5, 71, 70.8, 70.5],
          color: (opacity = 1) => colors.primary,
          strokeWidth: 2,
        },
      ],
    },
    "3month": {
      labels: [
        "'22/11月",
        "'23/2月",
        "'23/5月",
        "'23/8月",
        "'23/11月",
        "'24/2月",
      ],
      datasets: [
        {
          data: [74, 73.5, 73, 72.5, 72, 71.5],
          color: (opacity = 1) => colors.primary,
          strokeWidth: 2,
        },
      ],
    },
    "6month": {
      labels: [
        "'22/5月",
        "'22/11月",
        "'23/5月",
        "'23/11月",
        "'24/5月",
        "'24/11月",
      ],
      datasets: [
        {
          data: [75, 74, 73, 72, 71, 70.2],
          color: (opacity = 1) => colors.primary,
          strokeWidth: 2,
        },
      ],
    },
    "1year": {
      labels: [
        "'19/5月",
        "'20/5月",
        "'21/5月",
        "'22/5月",
        "'23/5月",
        "'24/5月",
      ],
      datasets: [
        {
          data: [76, 75.5, 75, 74.5, 74, 73.5],
          color: (opacity = 1) => colors.primary,
          strokeWidth: 2,
        },
      ],
    },
  };

  // 血圧グラフデータ
  const bpData = {
    "1month": {
      labels: ["1", "2", "3", "4", "5"],
      datasets: [
        {
          data: [125, 122, 120, 118, 120],
          color: (opacity = 1) => colors.pink[500],
          strokeWidth: 2,
        },
        {
          data: [82, 80, 78, 76, 80],
          color: (opacity = 1) => colors.mint[500],
          strokeWidth: 2,
        },
      ],
    },
    "3month": {
      labels: [
        "'22/11月",
        "'23/2月",
        "'23/5月",
        "'23/8月",
        "'23/11月",
        "'24/2月",
      ],
      datasets: [
        {
          data: [130, 128, 125, 122, 120, 118],
          color: (opacity = 1) => colors.pink[500],
          strokeWidth: 2,
        },
        {
          data: [85, 83, 82, 80, 78, 76],
          color: (opacity = 1) => colors.mint[500],
          strokeWidth: 2,
        },
      ],
    },
    "6month": {
      labels: [
        "'22/5月",
        "'22/11月",
        "'23/5月",
        "'23/11月",
        "'24/5月",
        "'24/11月",
      ],
      datasets: [
        {
          data: [135, 130, 125, 120, 115, 110],
          color: (opacity = 1) => colors.pink[500],
          strokeWidth: 2,
        },
        {
          data: [88, 85, 82, 78, 75, 70],
          color: (opacity = 1) => colors.mint[500],
          strokeWidth: 2,
        },
      ],
    },
    "1year": {
      labels: [
        "'19/5月",
        "'20/5月",
        "'21/5月",
        "'22/5月",
        "'23/5月",
        "'24/5月",
      ],
      datasets: [
        {
          data: [140, 138, 135, 133, 130, 125],
          color: (opacity = 1) => colors.pink[500],
          strokeWidth: 2,
        },
        {
          data: [92, 90, 88, 86, 85, 82],
          color: (opacity = 1) => colors.mint[500],
          strokeWidth: 2,
        },
      ],
    },
  };

  const weightPeriods = [
    { key: "1month", label: "1ヶ月" },
    { key: "3month", label: "3ヶ月" },
  ];

  const modalWeightPeriods = [
    { key: "1month", label: "1ヶ月" },
    { key: "3month", label: "3ヶ月" },
    { key: "6month", label: "6ヶ月" },
    { key: "1year", label: "1年" },
  ];

  const bpPeriods = [
    { key: "1month", label: "1ヶ月" },
    { key: "3month", label: "3ヶ月" },
  ];

  const modalBpPeriods = [
    { key: "1month", label: "1ヶ月" },
    { key: "3month", label: "3ヶ月" },
    { key: "6month", label: "6ヶ月" },
    { key: "1year", label: "1年" },
  ];

  // 体脂肪率グラフデータ
  const bodyFatData = {
    "1month": {
      labels: ["1", "2", "3", "4", "5"],
      datasets: [
        {
          data: [23.5, 23.2, 22.8, 22.5, 22.3],
          color: (opacity = 1) => colors.purple[500],
          strokeWidth: 2,
        },
      ],
    },
    "3month": {
      labels: [
        "'22/11月",
        "'23/2月",
        "'23/5月",
        "'23/8月",
        "'23/11月",
        "'24/2月",
      ],
      datasets: [
        {
          data: [25.0, 24.5, 24.0, 23.5, 23.2, 22.8],
          color: (opacity = 1) => colors.purple[500],
          strokeWidth: 2,
        },
      ],
    },
    "6month": {
      labels: [
        "'22/5月",
        "'22/11月",
        "'23/5月",
        "'23/11月",
        "'24/5月",
        "'24/11月",
      ],
      datasets: [
        {
          data: [26.0, 25.0, 24.0, 23.2, 22.5, 22.0],
          color: (opacity = 1) => colors.purple[500],
          strokeWidth: 2,
        },
      ],
    },
    "1year": {
      labels: [
        "'19/5月",
        "'20/5月",
        "'21/5月",
        "'22/5月",
        "'23/5月",
        "'24/5月",
      ],
      datasets: [
        {
          data: [27.0, 26.5, 26.0, 25.5, 25.0, 24.0],
          color: (opacity = 1) => colors.purple[500],
          strokeWidth: 2,
        },
      ],
    },
  };

  // 筋肉量グラフデータ
  const muscleData = {
    "1month": {
      labels: ["1", "2", "3", "4", "5"],
      datasets: [
        {
          data: [34.8, 35.0, 35.2, 35.4, 35.2],
          color: (opacity = 1) => colors.mint[500],
          strokeWidth: 2,
        },
      ],
    },
    "3month": {
      labels: [
        "'22/11月",
        "'23/2月",
        "'23/5月",
        "'23/8月",
        "'23/11月",
        "'24/2月",
      ],
      datasets: [
        {
          data: [34.0, 34.2, 34.5, 34.8, 35.0, 35.2],
          color: (opacity = 1) => colors.mint[500],
          strokeWidth: 2,
        },
      ],
    },
    "6month": {
      labels: [
        "'22/5月",
        "'22/11月",
        "'23/5月",
        "'23/11月",
        "'24/5月",
        "'24/11月",
      ],
      datasets: [
        {
          data: [33.5, 34.0, 34.5, 35.0, 35.4, 35.6],
          color: (opacity = 1) => colors.mint[500],
          strokeWidth: 2,
        },
      ],
    },
    "1year": {
      labels: [
        "'19/5月",
        "'20/5月",
        "'21/5月",
        "'22/5月",
        "'23/5月",
        "'24/5月",
      ],
      datasets: [
        {
          data: [33.0, 33.2, 33.5, 33.8, 34.0, 34.5],
          color: (opacity = 1) => colors.mint[500],
          strokeWidth: 2,
        },
      ],
    },
  };

  return (
    <View style={styles.container}>
      <ScreenWrapper
        backgroundColor={theme.colors.background.tertiary}
        scrollable
      >
        {latestMeasurement && (
          <View style={styles.currentStats}>
            <View style={styles.mainStatsRow}>
              <TouchableOpacity
                style={styles.mainStat}
                onPress={() => handleCardPress("weight")}
              >
                <Text style={styles.mainStatLabel}>
                  {t("measurement.weight")}
                </Text>
                <Text style={styles.mainStatValue}>
                  {latestMeasurement.weight} kg
                </Text>
                <View style={styles.changeIndicator}>
                  <Ionicons
                    name={weightChange >= 0 ? "arrow-up" : "arrow-down"}
                    size={16}
                    color={
                      weightChange >= 0 ? colors.pink[500] : colors.mint[500]
                    }
                  />
                  <Text
                    style={[
                      styles.changeText,
                      {
                        color:
                          weightChange >= 0
                            ? colors.pink[500]
                            : colors.mint[500],
                      },
                    ]}
                  >
                    {Math.abs(weightChange).toFixed(1)} kg
                  </Text>
                </View>
              </TouchableOpacity>

              {latestMeasurement.systolicBP &&
                latestMeasurement.diastolicBP && (
                  <TouchableOpacity
                    style={styles.mainStat}
                    onPress={() => handleCardPress("bloodPressure")}
                  >
                    <Text style={styles.mainStatLabel}>
                      {t("measurement.bloodPressure")}
                    </Text>
                    <Text style={styles.mainStatValue}>
                      {latestMeasurement.systolicBP}/
                      {latestMeasurement.diastolicBP}
                    </Text>
                    <View style={styles.changeIndicator}>
                      <Ionicons
                        name={bpChange >= 0 ? "arrow-up" : "arrow-down"}
                        size={16}
                        color={
                          bpChange >= 0 ? colors.pink[500] : colors.mint[500]
                        }
                      />
                      <Text
                        style={[
                          styles.changeText,
                          {
                            color:
                              bpChange >= 0
                                ? colors.pink[500]
                                : colors.mint[500],
                          },
                        ]}
                      >
                        {Math.abs(bpChange).toFixed(0)} mmHg
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
            </View>

            <View style={styles.subStats}>
              {latestMeasurement.bodyFat && (
                <TouchableOpacity
                  style={styles.subStat}
                  onPress={() => handleCardPress("bodyFat")}
                >
                  <LinearGradient
                    colors={theme.colors.gradient.aurora}
                    style={styles.subStatGradient}
                  >
                    <Ionicons
                      name={icons.facility.pool}
                      size={24}
                      color={theme.colors.text.inverse}
                    />
                    <Text style={styles.subStatLabel}>
                      {t("measurement.bodyFat")}
                    </Text>
                    <Text style={styles.subStatValue}>
                      {latestMeasurement.bodyFat}%
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {latestMeasurement.muscle && (
                <TouchableOpacity
                  style={styles.subStat}
                  onPress={() => handleCardPress("muscle")}
                >
                  <LinearGradient
                    colors={theme.colors.gradient.mint}
                    style={styles.subStatGradient}
                  >
                    <Ionicons
                      name={icons.navigation.workoutOutline}
                      size={24}
                      color={theme.colors.text.inverse}
                    />
                    <Text style={styles.subStatLabel}>
                      {t("measurement.muscleMass")}
                    </Text>
                    <Text style={styles.subStatValue}>
                      {latestMeasurement.muscle} kg
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <ChartSection
          title={t("measurement.weight")}
          unit={t("measurement.kg")}
          data={weightData}
          chartType="line"
          currentPeriod={weightPeriod}
          periods={weightPeriods}
          onPeriodChange={(period) =>
            setWeightPeriod(period as "1month" | "3month")
          }
          icon="scale-outline"
        />

        <ChartSection
          title={t("measurement.bloodPressure")}
          unit="mmHg"
          data={bpData}
          chartType="line"
          currentPeriod={bpPeriod}
          periods={bpPeriods}
          onPeriodChange={(period) =>
            setBpPeriod(period as "1month" | "3month")
          }
          icon="heart-outline"
        />

        <View style={styles.historySection}>
          <View style={styles.historySectionHeader}>
            <Ionicons
              name="time-outline"
              size={20}
              color={theme.colors.text.primary}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>{t("measurement.history")}</Text>
          </View>
          {measurements.map((measurement) => (
            <TouchableOpacity 
              key={measurement.id} 
              style={styles.historyItem}
              onPress={() => navigation.navigate('MeasurementInput', { 
                editMode: true, 
                measurementId: measurement.id,
                measurementData: {
                  weight: measurement.weight?.toString() || '',
                  bodyFat: measurement.bodyFat?.toString() || '',
                  muscle: measurement.muscle?.toString() || '',
                  systolicBP: measurement.systolicBP?.toString() || '',
                  diastolicBP: measurement.diastolicBP?.toString() || '',
                  date: measurement.date
                }
              })}
            >
              <View style={styles.historyContent}>
                <Text style={styles.historyDate}>{measurement.date}</Text>
                <View style={styles.historyStats}>
                  <Text style={styles.historyWeight}>
                    {measurement.weight} kg
                  </Text>
                  {measurement.bodyFat && (
                    <Text style={styles.historySubStat}>
                      {t("measurement.bodyFat")} {measurement.bodyFat}%
                    </Text>
                  )}
                  {measurement.systolicBP && measurement.diastolicBP && (
                    <Text style={styles.historySubStat}>
                      {t("measurement.bloodPressure")} {measurement.systolicBP}/
                      {measurement.diastolicBP}
                    </Text>
                  )}
                </View>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={colors.gray[400]} 
              />
            </TouchableOpacity>
          ))}
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          statusBarTranslucent={true}
          presentationStyle="overFullScreen"
        >
          <SafeAreaView style={styles.safeAreaModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t("measurement.record")}</Text>
                  <TouchableOpacity onPress={handleCancel}>
                    <Ionicons name="close" size={24} color={colors.gray[600]} />
                  </TouchableOpacity>
                </View>

                <KeyboardAwareScrollView
                  style={styles.scrollContainer}
                  contentContainerStyle={{ flexGrow: 1 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="always"
                  keyboardDismissMode="none"
                  extraScrollHeight={100}
                  enableOnAndroid={true}
                  enableAutomaticScroll={true}
                  keyboardOpeningTime={0}
                  enableResetScrollToCoords={false}
                >
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {t("measurement.weight")} ({t("measurement.kg")})
                  </Text>
                  <TextInput
                    ref={weightInputRef}
                    style={styles.input}
                    placeholder="70.5"
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    returnKeyType="next"
                    onSubmitEditing={() => bodyFatInputRef.current?.focus()}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {t("measurement.bodyFat")} ({t("measurement.percent")})
                  </Text>
                  <TextInput
                    ref={bodyFatInputRef}
                    style={styles.input}
                    placeholder="22.5"
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={bodyFat}
                    onChangeText={setBodyFat}
                    keyboardType="numeric"
                    returnKeyType="next"
                    onSubmitEditing={() => muscleInputRef.current?.focus()}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {t("measurement.muscleMass")} ({t("measurement.kg")})
                  </Text>
                  <TextInput
                    ref={muscleInputRef}
                    style={styles.input}
                    placeholder="35.0"
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={muscle}
                    onChangeText={setMuscle}
                    keyboardType="numeric"
                    returnKeyType="next"
                    onSubmitEditing={() => systolicBPInputRef.current?.focus()}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {t("measurement.bloodPressure")} (mmHg)
                  </Text>
                  <View style={styles.bloodPressureRow}>
                    <TextInput
                      ref={systolicBPInputRef}
                      style={[styles.input, styles.bloodPressureInput]}
                      placeholder="120"
                      placeholderTextColor={theme.colors.text.tertiary}
                      value={systolicBP}
                      onChangeText={setSystolicBP}
                      keyboardType="numeric"
                      returnKeyType="next"
                      onSubmitEditing={() => diastolicBPInputRef.current?.focus()}
                    />
                    <Text style={styles.bloodPressureSeparator}>/</Text>
                    <TextInput
                      ref={diastolicBPInputRef}
                      style={[styles.input, styles.bloodPressureInput]}
                      placeholder="80"
                      placeholderTextColor={theme.colors.text.tertiary}
                      value={diastolicBP}
                      onChangeText={setDiastolicBP}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                  </View>
                </View>
                </KeyboardAwareScrollView>

                <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>{t("common.save")}</Text>
                </TouchableOpacity>
              </View>
            </View>
            </View>
          </SafeAreaView>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={detailModalVisible}
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.detailModalContainer}>
            <View style={styles.detailModalContent}>
              <View style={styles.detailModalHeader}>
                <Text style={styles.detailModalTitle}>
                  {selectedMetric === "weight" && t("measurement.weight")}
                  {selectedMetric === "bloodPressure" &&
                    t("measurement.bloodPressure")}
                  {selectedMetric === "bodyFat" && t("measurement.bodyFat")}
                  {selectedMetric === "muscle" && t("measurement.muscleMass")}
                </Text>
                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.gray[600]} />
                </TouchableOpacity>
              </View>
              {(selectedMetric === "weight" ||
                selectedMetric === "bloodPressure") && (
                <ChartSection
                  title={
                    selectedMetric === "weight"
                      ? t("measurement.weight")
                      : t("measurement.bloodPressure")
                  }
                  unit={
                    selectedMetric === "weight" ? t("measurement.kg") : "mmHg"
                  }
                  data={selectedMetric === "weight" ? weightData : bpData}
                  chartType="line"
                  currentPeriod={
                    selectedMetric === "weight" ? weightPeriod : bpPeriod
                  }
                  periods={
                    selectedMetric === "weight"
                      ? modalWeightPeriods
                      : modalBpPeriods
                  }
                  onPeriodChange={(period) => {
                    if (selectedMetric === "weight") {
                      setWeightPeriod(
                        period as "1month" | "3month" | "6month" | "1year"
                      );
                    } else {
                      setBpPeriod(
                        period as "1month" | "3month" | "6month" | "1year"
                      );
                    }
                  }}
                  isModal={true}
                />
              )}
              {selectedMetric === "bodyFat" && (
                <ChartSection
                  title={t("measurement.bodyFat")}
                  unit={t("measurement.percent")}
                  data={bodyFatData}
                  chartType="line"
                  currentPeriod={weightPeriod}
                  periods={modalWeightPeriods}
                  onPeriodChange={(period) =>
                    setWeightPeriod(
                      period as "1month" | "3month" | "6month" | "1year"
                    )
                  }
                  isModal={true}
                />
              )}
              {selectedMetric === "muscle" && (
                <ChartSection
                  title={t("measurement.muscleMass")}
                  unit={t("measurement.kg")}
                  data={muscleData}
                  chartType="line"
                  currentPeriod={weightPeriod}
                  periods={modalWeightPeriods}
                  onPeriodChange={(period) =>
                    setWeightPeriod(
                      period as "1month" | "3month" | "6month" | "1year"
                    )
                  }
                  isModal={true}
                />
              )}
              <View style={styles.detailHistorySection}>
                <Text style={styles.detailHistoryTitle}>
                  {t("measurement.history")}
                </Text>
                <View style={styles.detailHistoryList}>
                  {measurements.map((measurement) => (
                    <View key={measurement.id} style={styles.detailHistoryItem}>
                      <Text style={styles.detailHistoryDate}>
                        {measurement.date}
                      </Text>
                      <Text style={styles.detailHistoryValue}>
                        {selectedMetric === "weight" &&
                          `${measurement.weight} kg`}
                        {selectedMetric === "bloodPressure" &&
                          measurement.systolicBP &&
                          measurement.diastolicBP &&
                          `${measurement.systolicBP}/${measurement.diastolicBP} mmHg`}
                        {selectedMetric === "bodyFat" &&
                          measurement.bodyFat &&
                          `${measurement.bodyFat}%`}
                        {selectedMetric === "muscle" &&
                          measurement.muscle &&
                          `${measurement.muscle} kg`}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </ScreenWrapper>

      <FloatingActionButton
        onPress={() => navigation.navigate('MeasurementInput')}
        text={t("measurement.record")}
        icon="add"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 0, // タブナビゲーションに近づける
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    zIndex: 1000,
    elevation: 1000,
  },
  floatingButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    ...theme.shadows.lg,
  },
  floatingButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  floatingButtonText: {
    ...typography.body,
    color: theme.colors.text.inverse,
    fontWeight: theme.fontWeight.semibold,
  },
  currentStats: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: theme.spacing.xl,
  },
  mainStatsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  mainStat: {
    backgroundColor: theme.colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: "center",
    flex: 1,
  },
  mainStatLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: spacing.sm,
    fontWeight: theme.fontWeight.medium,
  },
  mainStatValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.gray[900],
  },
  changeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  changeText: {
    ...typography.body,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  subStats: {
    flexDirection: "row",
    gap: spacing.md,
  },
  subStat: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    marginBottom: 0,
  },
  subStatGradient: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  subStatLabel: {
    fontSize: 14,
    color: theme.colors.text.inverse,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  subStatValue: {
    fontSize: 20,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
    fontFamily: theme.fontFamily.bold,
  },
  historySection: {
    marginTop: spacing.xl,
    marginHorizontal: layout.screenPadding,
    marginBottom: 100,
  },
  historySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionIcon: {
    marginRight: theme.spacing.sm,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  historyItem: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
  },
  historyContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyDate: {
    ...typography.body,
    color: colors.gray[600],
  },
  historyStats: {
    alignItems: "flex-end",
  },
  historyWeight: {
    ...typography.cardTitle,
    color: colors.gray[900],
  },
  historySubStat: {
    ...typography.small,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  safeAreaModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: layout.screenPadding,
    paddingBottom: spacing.xxxl + spacing.sm,
    maxHeight: "85%",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  modalTitle: {
    ...typography.sectionTitle,
    color: colors.gray[900],
  },
  inputGroup: {
    marginBottom: layout.screenPadding,
  },
  inputLabel: {
    ...typography.body,
    fontWeight: "600",
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    ...typography.body,
    color: colors.gray[900],
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.gray[700],
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: colors.mint[500],
  },
  saveButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  bloodPressureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  bloodPressureInput: {
    flex: 1,
  },
  bloodPressureSeparator: {
    ...typography.body,
    color: colors.gray[700],
    fontWeight: "bold",
    fontSize: 18,
  },
  detailModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: layout.screenPadding,
    width: "90%",
    maxHeight: "80%",
  },
  detailModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  detailModalTitle: {
    ...typography.sectionTitle,
    color: colors.gray[900],
  },
  detailHistorySection: {
    marginTop: spacing.lg,
  },
  detailHistoryTitle: {
    ...typography.cardTitle,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  detailHistoryList: {
    maxHeight: 200,
  },
  detailHistoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  detailHistoryDate: {
    ...typography.body,
    color: colors.gray[600],
  },
  detailHistoryValue: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: "600",
  },
});
