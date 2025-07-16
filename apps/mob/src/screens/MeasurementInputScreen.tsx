import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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

export default function MeasurementInputScreen() {
  const { t } = useI18n();
  const navigation = useNavigation();
  const { session } = useAuth();
  const user = session?.user;
  const weightInputRef = useRef<TextInput>(null);
  const bodyFatInputRef = useRef<TextInput>(null);
  const muscleInputRef = useRef<TextInput>(null);
  const systolicBPInputRef = useRef<TextInput>(null);
  const diastolicBPInputRef = useRef<TextInput>(null);
  
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscle, setMuscle] = useState("");
  const [systolicBP, setSystolicBP] = useState("");
  const [diastolicBP, setDiastolicBP] = useState("");
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
        measurement_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        weight: weight.trim() ? parseFloat(weight) : null,
        body_fat_percentage: bodyFat.trim() ? parseFloat(bodyFat) : null,
        muscle_mass: muscle.trim() ? parseFloat(muscle) : null,
        notes: `測定記録 - ${new Date().toLocaleDateString('ja-JP')}`,
      };
      
      // Add blood pressure data if provided
      if (systolicBP.trim() || diastolicBP.trim()) {
        measurementData.measurements = {
          systolic_bp: systolicBP.trim() ? parseInt(systolicBP) : null,
          diastolic_bp: diastolicBP.trim() ? parseInt(diastolicBP) : null,
        };
      }

      const { error } = await supabase
        .from("measurements")
        .insert([measurementData]);

      if (error) {
        console.error("Measurement save error:", error);
        Alert.alert("エラー", "測定記録の保存に失敗しました");
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Measurement save error:", error);
      Alert.alert("エラー", "測定記録の保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // キーボードを閉じる
    Keyboard.dismiss();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.gray[600]} />
          </TouchableOpacity>
          <Text style={styles.title}>{t("measurement.record")}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
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
        </ScrollView>

        <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>
            {t("common.cancel")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "保存中..." : t("common.save")}
          </Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 0,
    paddingBottom: spacing.xl,
  },
  formContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
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