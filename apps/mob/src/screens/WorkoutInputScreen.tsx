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

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
}

export default function WorkoutInputScreen() {
  const { t } = useI18n();
  const navigation = useNavigation();
  const { session } = useAuth();
  const user = session?.user;
  const nameInputRef = useRef<TextInput>(null);
  const durationInputRef = useRef<TextInput>(null);
  
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: "", reps: "", weight: "" }
  ]);
  const [saving, setSaving] = useState(false);

  // 画面が開かれたときに最初のフィールドにフォーカス
  useEffect(() => {
    const timeout = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const handleSave = async () => {
    if (!user) {
      Alert.alert("エラー", "ログインが必要です");
      return;
    }

    if (!workoutName.trim() || !duration.trim()) {
      Alert.alert("エラー", "ワークアウト名と時間を入力してください");
      return;
    }

    setSaving(true);
    Keyboard.dismiss();

    try {
      // First, create the workout
      const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .insert([
          {
            user_id: user.id,
            name: workoutName.trim(),
            date: new Date().toISOString().split('T')[0],
            duration_minutes: parseInt(duration) || 0,
            notes: `ワークアウト記録 - ${new Date().toLocaleDateString('ja-JP')}`,
          },
        ])
        .select()
        .single();

      if (workoutError) {
        console.error("Workout save error:", workoutError);
        Alert.alert("エラー", "ワークアウトの保存に失敗しました");
        return;
      }

      // Then, save exercises if any have data
      const validExercises = exercises.filter(ex => ex.name.trim());
      if (validExercises.length > 0) {
        const exerciseData = validExercises.map((exercise, index) => ({
          workout_id: workoutData.id,
          exercise_name: exercise.name.trim(),
          sets: parseInt(exercise.sets) || 1,
          reps: parseInt(exercise.reps) || 1,
          weight: exercise.weight.trim() ? parseFloat(exercise.weight) : null,
          order_index: index + 1,
        }));

        const { error: exerciseError } = await supabase
          .from("workout_exercises")
          .insert(exerciseData);

        if (exerciseError) {
          console.error("Exercise save error:", exerciseError);
          Alert.alert("警告", "ワークアウトは保存されましたが、エクササイズの保存に失敗しました");
        }
      }

      navigation.goBack();
    } catch (error) {
      console.error("Workout save error:", error);
      Alert.alert("エラー", "ワークアウトの保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // キーボードを閉じる
    Keyboard.dismiss();
    navigation.goBack();
  };

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", weight: "" }]);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      const newExercises = exercises.filter((_, i) => i !== index);
      setExercises(newExercises);
    }
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
          <Text style={styles.title}>{t("workout.title")}を記録</Text>
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
              <Text style={styles.inputLabel}>ワークアウト名</Text>
              <TextInput
                ref={nameInputRef}
                style={styles.input}
                placeholder="例: 上半身トレーニング"
                placeholderTextColor={theme.colors.text.tertiary}
                value={workoutName}
                onChangeText={setWorkoutName}
                returnKeyType="next"
                onSubmitEditing={() => durationInputRef.current?.focus()}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>時間（分）</Text>
              <TextInput
                ref={durationInputRef}
                style={styles.input}
                placeholder="45"
                placeholderTextColor={theme.colors.text.tertiary}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>

            <View style={styles.exercisesSection}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.sectionTitle}>エクササイズ</Text>
                <TouchableOpacity onPress={addExercise} style={styles.addButton}>
                  <Ionicons name="add-circle" size={24} color={theme.colors.action.secondary} />
                </TouchableOpacity>
              </View>

              {exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseCard}>
                  <View style={styles.exerciseCardHeader}>
                    <Text style={styles.exerciseNumber}>エクササイズ {index + 1}</Text>
                    {exercises.length > 1 && (
                      <TouchableOpacity onPress={() => removeExercise(index)}>
                        <Ionicons name="trash-outline" size={20} color={colors.pink[500]} />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <TextInput
                    style={[styles.input, styles.exerciseInput]}
                    placeholder="エクササイズ名"
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={exercise.name}
                    onChangeText={(value) => updateExercise(index, "name", value)}
                  />
                  
                  <View style={styles.exerciseRow}>
                    <View style={styles.exerciseField}>
                      <Text style={styles.exerciseLabel}>セット数</Text>
                      <TextInput
                        style={[styles.input, styles.smallInput]}
                        placeholder="3"
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={exercise.sets}
                        onChangeText={(value) => updateExercise(index, "sets", value)}
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <View style={styles.exerciseField}>
                      <Text style={styles.exerciseLabel}>回数</Text>
                      <TextInput
                        style={[styles.input, styles.smallInput]}
                        placeholder="10"
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={exercise.reps}
                        onChangeText={(value) => updateExercise(index, "reps", value)}
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <View style={styles.exerciseField}>
                      <Text style={styles.exerciseLabel}>重量(kg)</Text>
                      <TextInput
                        style={[styles.input, styles.smallInput]}
                        placeholder="60"
                        placeholderTextColor={theme.colors.text.tertiary}
                        value={exercise.weight}
                        onChangeText={(value) => updateExercise(index, "weight", value)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              ))}
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
  exercisesSection: {
    marginTop: spacing.xl,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.gray[900],
  },
  addButton: {
    padding: spacing.xs,
  },
  exerciseCard: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  exerciseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  exerciseNumber: {
    ...typography.body,
    fontWeight: "600",
    color: colors.gray[700],
  },
  exerciseInput: {
    marginBottom: spacing.md,
  },
  exerciseRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  exerciseField: {
    flex: 1,
  },
  exerciseLabel: {
    ...typography.small,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  smallInput: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
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
    backgroundColor: theme.colors.action.secondary,
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