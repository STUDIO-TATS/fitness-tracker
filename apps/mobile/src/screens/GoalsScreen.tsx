import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, Button, Input } from "@fitness-tracker/ui";
import { colors, spacing } from "@fitness-tracker/ui";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
} from "../lib/supabase";
import type { Goal, CreateGoalInput } from "@fitness-tracker/types";
import { useAuth } from "../hooks/useAuth";
import {
  ScreenWrapper,
  LoadingScreen,
  EmptyState,
  ProgressBar,
} from "../components/shared";

export const GoalsScreen = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Create goal form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [creating, setCreating] = useState(false);

  // Progress update
  const [progressValue, setProgressValue] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      loadGoals();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await getGoals(user.id);
      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      Alert.alert("エラー", "目標の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!title || !user) {
      Alert.alert("エラー", "タイトルを入力してください");
      return;
    }

    setCreating(true);
    try {
      const goalData: CreateGoalInput = {
        title,
        description: description || undefined,
        target_value: targetValue ? parseFloat(targetValue) : undefined,
        unit: unit || undefined,
        target_date: targetDate || undefined,
      };

      const { error } = await createGoal(user.id, goalData);
      if (error) throw error;

      Alert.alert("成功", "目標を作成しました");
      setShowCreateModal(false);
      resetForm();
      loadGoals();
    } catch (error: any) {
      Alert.alert("エラー", error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedGoal || !progressValue) {
      Alert.alert("エラー", "進捗値を入力してください");
      return;
    }

    setUpdating(true);
    try {
      const newValue = parseFloat(progressValue);
      const { data, error } = await updateGoalProgress(
        selectedGoal.id,
        newValue
      );
      if (error) throw error;

      if (data && data.status === "completed") {
        Alert.alert("おめでとうございます！", "目標を達成しました！🎉");
      } else {
        Alert.alert("成功", "進捗を更新しました");
      }

      setShowProgressModal(false);
      setSelectedGoal(null);
      setProgressValue("");
      loadGoals();
    } catch (error: any) {
      Alert.alert("エラー", error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    Alert.alert("確認", "この目標を削除してもよろしいですか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await deleteGoal(goalId);
            if (error) throw error;
            loadGoals();
          } catch (error: any) {
            Alert.alert("エラー", error.message);
          }
        },
      },
    ]);
  };

  const handleStatusChange = async (goalId: string, status: Goal["status"]) => {
    try {
      const { error } = await updateGoal(goalId, { status });
      if (error) throw error;
      loadGoals();
    } catch (error: any) {
      Alert.alert("エラー", error.message);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTargetValue("");
    setUnit("");
    setTargetDate("");
  };

  const getStatusColor = (status: Goal["status"]) => {
    switch (status) {
      case "active":
        return colors.success;
      case "completed":
        return colors.primary;
      case "paused":
        return colors.warning;
      case "cancelled":
        return colors.gray[500];
    }
  };

  const getStatusText = (status: Goal["status"]) => {
    switch (status) {
      case "active":
        return "アクティブ";
      case "completed":
        return "完了";
      case "paused":
        return "一時停止";
      case "cancelled":
        return "キャンセル";
    }
  };

  if (loading) {
    return <LoadingScreen message="目標を読み込み中..." />;
  }

  return (
    <ScreenWrapper scrollable>
      <View style={styles.header}>
        <Button
          title="新しい目標を作成"
          onPress={() => setShowCreateModal(true)}
          style={styles.createButton}
        />
      </View>

      {goals.length === 0 ? (
        <EmptyState
          icon="target"
          title="目標がありません"
          description="最初の目標を設定しましょう！"
          actionText="目標を作成"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        goals.map((goal) => (
          <Card key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleContainer}>
                <Text variant="heading3" weight="semibold">
                  {goal.title}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(goal.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(goal.status)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteGoal(goal.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>削除</Text>
              </TouchableOpacity>
            </View>

            {goal.description && (
              <Text variant="body" color="gray" style={styles.description}>
                {goal.description}
              </Text>
            )}

            {goal.target_value && (
              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <Text variant="body" weight="semibold">
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </Text>
                  <Text variant="caption" color="gray">
                    {Math.round((goal.current_value / goal.target_value) * 100)}
                    % 完了
                  </Text>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          (goal.current_value / goal.target_value) * 100,
                          100
                        )}%`,
                        backgroundColor: getStatusColor(goal.status),
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {goal.target_date && (
              <Text variant="caption" color="gray" style={styles.targetDate}>
                目標日: {new Date(goal.target_date).toLocaleDateString("ja-JP")}
              </Text>
            )}

            <View style={styles.goalActions}>
              {goal.status === "active" && goal.target_value && (
                <Button
                  title="進捗を更新"
                  onPress={() => {
                    setSelectedGoal(goal);
                    setProgressValue(goal.current_value.toString());
                    setShowProgressModal(true);
                  }}
                  variant="secondary"
                  size="small"
                  style={styles.actionButton}
                />
              )}

              {goal.status === "active" && (
                <Button
                  title="一時停止"
                  onPress={() => handleStatusChange(goal.id, "paused")}
                  variant="secondary"
                  size="small"
                  style={styles.actionButton}
                />
              )}

              {goal.status === "paused" && (
                <Button
                  title="再開"
                  onPress={() => handleStatusChange(goal.id, "active")}
                  variant="secondary"
                  size="small"
                  style={styles.actionButton}
                />
              )}

              {(goal.status === "active" || goal.status === "paused") && (
                <Button
                  title="完了"
                  onPress={() => handleStatusChange(goal.id, "completed")}
                  size="small"
                  style={styles.actionButton}
                />
              )}
            </View>
          </Card>
        ))
      )}

      {/* Create Goal Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text variant="heading2" weight="semibold">
              新しい目標
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Input
              label="目標タイトル *"
              value={title}
              onChangeText={setTitle}
              placeholder="例：体重を10kg減らす"
            />

            <Input
              label="説明"
              value={description}
              onChangeText={setDescription}
              placeholder="目標の詳細について..."
              multiline
              numberOfLines={3}
            />

            <View style={styles.row}>
              <Input
                label="目標値"
                value={targetValue}
                onChangeText={setTargetValue}
                placeholder="10"
                keyboardType="numeric"
                style={styles.halfInput}
              />

              <Input
                label="単位"
                value={unit}
                onChangeText={setUnit}
                placeholder="kg"
                style={styles.halfInput}
              />
            </View>

            <Input
              label="目標日"
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="YYYY-MM-DD"
            />

            <Button
              title="目標を作成"
              onPress={handleCreateGoal}
              loading={creating}
              style={styles.createModalButton}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Update Progress Modal */}
      <Modal
        visible={showProgressModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text variant="heading2" weight="semibold">
              進捗を更新
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowProgressModal(false);
                setSelectedGoal(null);
                setProgressValue("");
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {selectedGoal && (
              <>
                <Text
                  variant="heading3"
                  weight="semibold"
                  style={styles.modalGoalTitle}
                >
                  {selectedGoal.title}
                </Text>

                <Text
                  variant="body"
                  color="gray"
                  style={styles.currentProgress}
                >
                  現在の進捗: {selectedGoal.current_value} /{" "}
                  {selectedGoal.target_value} {selectedGoal.unit}
                </Text>

                <Input
                  label="新しい値"
                  value={progressValue}
                  onChangeText={setProgressValue}
                  placeholder={selectedGoal.target_value?.toString()}
                  keyboardType="numeric"
                />

                <Button
                  title="更新"
                  onPress={handleUpdateProgress}
                  loading={updating}
                  style={styles.updateButton}
                />
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  createButton: {
    marginBottom: spacing.md,
  },
  goalCard: {
    marginBottom: spacing.md,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  goalTitleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginTop: spacing.xs,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  description: {
    marginBottom: spacing.md,
  },
  targetDate: {
    marginBottom: spacing.md,
  },
  goalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: 80,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  closeButton: {
    backgroundColor: colors.gray[300],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  closeButtonText: {
    color: colors.gray[700],
    fontWeight: "500",
  },
  modalContent: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  createModalButton: {
    marginTop: spacing.lg,
  },
  modalGoalTitle: {
    marginBottom: spacing.sm,
  },
  currentProgress: {
    marginBottom: spacing.lg,
  },
  updateButton: {
    marginTop: spacing.lg,
  },
});
