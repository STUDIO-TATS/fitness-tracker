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

export default function GoalsInputScreen() {
  const { t } = useI18n();
  const navigation = useNavigation();
  const { session } = useAuth();
  const user = session?.user;
  const titleInputRef = useRef<TextInput>(null);
  const targetInputRef = useRef<TextInput>(null);
  const currentInputRef = useRef<TextInput>(null);
  const totalInputRef = useRef<TextInput>(null);
  
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [total, setTotal] = useState("");
  const [unit, setUnit] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors.primary);
  const [saving, setSaving] = useState(false);

  const colorOptions = [
    colors.primary,
    colors.purple[500],
    colors.mint[500],
    colors.pink[500],
    theme.colors.action.secondary,
  ];

  // 画面が開かれたときに最初のフィールドにフォーカス
  useEffect(() => {
    const timeout = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const handleSave = async () => {
    if (!user) {
      Alert.alert("エラー", "ログインが必要です");
      return;
    }

    if (!title.trim() || !total.trim() || !unit.trim()) {
      Alert.alert("エラー", "必須フィールドを入力してください");
      return;
    }

    setSaving(true);
    Keyboard.dismiss();

    try {
      const { error } = await supabase
        .from("goals")
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            description: target.trim(),
            target_value: parseFloat(total) || 0,
            current_value: parseFloat(current) || 0,
            unit: unit.trim(),
            category: "general",
            color: selectedColor,
            status: "active",
          },
        ]);

      if (error) {
        console.error("Goal save error:", error);
        Alert.alert("エラー", "目標の保存に失敗しました");
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Goal save error:", error);
      Alert.alert("エラー", "目標の保存に失敗しました");
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
          <Text style={styles.title}>新しい{t("goals.title")}</Text>
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
              <Text style={styles.inputLabel}>目標のタイトル</Text>
              <TextInput
                ref={titleInputRef}
                style={styles.input}
                placeholder="例: 週3回のワークアウト"
                placeholderTextColor={theme.colors.text.tertiary}
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
                onSubmitEditing={() => targetInputRef.current?.focus()}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>期間</Text>
              <TextInput
                ref={targetInputRef}
                style={styles.input}
                placeholder="例: 今週、今月"
                placeholderTextColor={theme.colors.text.tertiary}
                value={target}
                onChangeText={setTarget}
                returnKeyType="next"
                onSubmitEditing={() => currentInputRef.current?.focus()}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>現在値</Text>
                <TextInput
                  ref={currentInputRef}
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={current}
                  onChangeText={setCurrent}
                  keyboardType="numeric"
                  returnKeyType="next"
                  onSubmitEditing={() => totalInputRef.current?.focus()}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>目標値</Text>
                <TextInput
                  ref={totalInputRef}
                  style={styles.input}
                  placeholder="3"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={total}
                  onChangeText={setTotal}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>単位</Text>
              <TextInput
                style={styles.input}
                placeholder="例: 回、kg、分"
                placeholderTextColor={theme.colors.text.tertiary}
                value={unit}
                onChangeText={setUnit}
                returnKeyType="done"
              />
            </View>

            <View style={styles.colorSection}>
              <Text style={styles.inputLabel}>色を選択</Text>
              <View style={styles.colorOptions}>
                {colorOptions.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={20} color={colors.white} />
                    )}
                  </TouchableOpacity>
                ))}
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
  rowInputs: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  colorSection: {
    marginTop: spacing.lg,
  },
  colorOptions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.sm,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: colors.gray[300],
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
    backgroundColor: colors.purple[500],
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