import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { colors } from "../constants/colors";
import { theme } from "../constants/theme";
import { useI18n } from "../hooks/useI18n";
import {
  commonStyles,
  spacing,
  typography,
  layout,
  borderRadius,
} from "../constants/styles";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface RouteParams {
  editMode?: boolean;
  measurementId?: string;
  measurementData?: {
    weight: string;
    bodyFat: string;
    muscle: string;
    systolicBP: string;
    diastolicBP: string;
    date: string;
  };
}

export default function MeasurementInputScreen() {
  const { t } = useI18n();
  const navigation = useNavigation();
  const route = useRoute();
  const { session } = useAuth();
  const user = session?.user;

  const params = route.params as RouteParams;
  const isEditMode = params?.editMode || false;
  const measurementId = params?.measurementId;
  const existingData = params?.measurementData;

  const weightInputRef = useRef<TextInput>(null);
  const bodyFatInputRef = useRef<TextInput>(null);
  const muscleInputRef = useRef<TextInput>(null);
  const systolicBPInputRef = useRef<TextInput>(null);
  const diastolicBPInputRef = useRef<TextInput>(null);

  const [weight, setWeight] = useState(existingData?.weight || "");
  const [bodyFat, setBodyFat] = useState(existingData?.bodyFat || "");
  const [muscle, setMuscle] = useState(existingData?.muscle || "");
  const [systolicBP, setSystolicBP] = useState(existingData?.systolicBP || "");
  const [diastolicBP, setDiastolicBP] = useState(
    existingData?.diastolicBP || ""
  );
  const [saving, setSaving] = useState(false);

  // 画面が開かれたときに最初のフィールドにフォーカス
  useEffect(() => {
    const timeout = setTimeout(() => {
      weightInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const handleSave = async () => {
    if (!user) {
      Alert.alert("エラー", "ログインが必要です");
      return;
    }

    if (!weight.trim() && !bodyFat.trim() && !muscle.trim()) {
      Alert.alert("エラー", "少なくとも1つの測定値を入力してください");
      return;
    }

    setSaving(true);
    Keyboard.dismiss();

    try {
      const measurementData: any = {
        user_id: user.id,
        measurement_date:
          isEditMode && existingData?.date
            ? existingData.date
            : new Date().toISOString().split("T")[0], // YYYY-MM-DD
        weight: weight.trim() ? parseFloat(weight) : null,
        body_fat_percentage: bodyFat.trim() ? parseFloat(bodyFat) : null,
        muscle_mass: muscle.trim() ? parseFloat(muscle) : null,
        notes: isEditMode
          ? `測定記録更新 - ${new Date().toLocaleDateString("ja-JP")}`
          : `測定記録 - ${new Date().toLocaleDateString("ja-JP")}`,
      };

      // Add blood pressure data if provided
      if (systolicBP.trim() || diastolicBP.trim()) {
        measurementData.measurements = {
          systolic_bp: systolicBP.trim() ? parseInt(systolicBP) : null,
          diastolic_bp: diastolicBP.trim() ? parseInt(diastolicBP) : null,
        };
      }

      let error;
      if (isEditMode && measurementId) {
        // 更新の場合
        const { error: updateError } = await supabase
          .from("measurements")
          .update(measurementData)
          .eq("id", measurementId);
        error = updateError;
      } else {
        // 新規作成の場合
        console.log("Creating new measurement");
        const { error: insertError } = await supabase
          .from("measurements")
          .insert([measurementData]);
        error = insertError;
      }

      if (error) {
        console.error("Measurement save error:", error);
        Alert.alert(
          "エラー",
          isEditMode
            ? "測定記録の更新に失敗しました"
            : "測定記録の保存に失敗しました"
        );
      } else {
        Alert.alert(
          "成功",
          isEditMode ? "測定記録を更新しました" : "測定記録を保存しました",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error("Measurement save error:", error);
      Alert.alert(
        "エラー",
        isEditMode
          ? "測定記録の更新に失敗しました"
          : "測定記録の保存に失敗しました"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // キーボードを閉じる
    Keyboard.dismiss();
    navigation.goBack();
  };

  const handleDelete = async () => {
    if (!isEditMode || !measurementId) return;

    Alert.alert(
      "測定記録を削除",
      "この測定記録を削除しますか？この操作は元に戻せません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("measurements")
                .delete()
                .eq("id", measurementId);

              if (error) {
                Alert.alert("エラー", "測定記録の削除に失敗しました");
              } else {
                Alert.alert("成功", "測定記録を削除しました", [
                  { text: "OK", onPress: () => navigation.goBack() },
                ]);
              }
            } catch (error) {
              Alert.alert("エラー", "測定記録の削除に失敗しました");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.gray[600]} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditMode ? "測定記録を編集" : t("measurement.record")}
        </Text>
        {isEditMode ? (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color={colors.red[600]} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <KeyboardAwareScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={0}
        extraHeight={0}
        keyboardOpeningTime={0}
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEnabled={true}
        viewIsInsideTabBar={false}
      >
        <View style={styles.formContainer}>
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
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving
                ? isEditMode
                  ? "更新中..."
                  : "保存中..."
                : isEditMode
                ? "更新"
                : t("common.save")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.gray[900],
  },
  placeholder: {
    width: 40,
  },
  deleteButton: {
    padding: spacing.sm,
    width: 40,
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  formContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    minHeight: 500, // 最低高さを設定してスクロールを保証
  },
  inputGroup: {
    marginBottom: spacing.lg,
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...typography.body,
    color: colors.gray[900],
    height: 48,
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
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    padding: layout.screenPadding,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: spacing.lg,
  },
  button: {
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
  disabledButton: {
    opacity: 0.6,
  },
});
