import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { KeyboardAvoidingWrapper } from "../components/KeyboardAvoidingWrapper";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { colors } from "../constants/colors";
import { icons } from "../constants/icons";
import { theme } from "../constants/theme";
import { useI18n } from "../hooks/useI18n";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { GoalsStackParamList } from "../navigation/GoalsStackNavigator";
import {
  commonStyles,
  spacing,
  typography,
  layout,
  borderRadius,
  shadows,
} from "../constants/styles";

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string;
  category: string;
  target_date?: string;
  color: string;
  status: string;
}

type GoalsNavigationProp = StackNavigationProp<
  GoalsStackParamList,
  'GoalsMain'
>;

export default function GoalsScreen() {
  const { t } = useI18n();
  const { session } = useAuth();
  const navigation = useNavigation<GoalsNavigationProp>();
  const viewShotRef = useRef<ViewShot>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [session]);

  const fetchGoals = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      Alert.alert(t("common.error"), t("common.dataFetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "目標を共有",
        });
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("common.shareError"));
    }
  };

  const openShareModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShareModalVisible(true);
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'daily': '毎日',
      'weekly': '今週',
      'monthly': '今月',
      'yearly': '今年'
    };
    return labels[category] || category;
  };

  const renderGoalItem = ({ item }: { item: Goal }) => {
    const progress = (item.current_value / item.target_value) * 100;

    return (
      <TouchableOpacity
        style={styles.goalCard}
        onLongPress={() => openShareModal(item)}
      >
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleWithIcon}>
            <Ionicons
              name={icons.navigation.goalsOutline}
              size={20}
              color={colors.purple[600]}
              style={styles.goalIcon}
            />
            <Text style={styles.goalTitle}>{item.title}</Text>
          </View>
          <Text style={styles.goalTarget}>{getCategoryLabel(item.category)}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progress, 100)}%`, backgroundColor: item.color },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {item.current_value} / {item.target_value} {item.unit}
          </Text>
        </View>

        <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <KeyboardAvoidingWrapper>
          <ScreenWrapper backgroundColor={theme.colors.background.tertiary}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.action.primary} />
              <Text style={styles.loadingText}>{t("common.loading")}</Text>
            </View>
          </ScreenWrapper>
        </KeyboardAvoidingWrapper>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingWrapper>
        <ScreenWrapper backgroundColor={theme.colors.background.tertiary} keyboardAvoiding={false} dismissKeyboardOnTap={false}>
          <FlatList
            data={goals}
            renderItem={renderGoalItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={fetchGoals}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name={icons.navigation.goalsOutline}
                  size={64}
                  color={theme.colors.text.tertiary}
                />
                <Text style={styles.emptyText}>{t("goals.noGoals")}</Text>
              </View>
            }
          />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>新しい目標を追加</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="目標のタイトル"
              placeholderTextColor={colors.gray[400]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.shareModalOverlay}
          activeOpacity={1}
          onPress={() => setShareModalVisible(false)}
        >
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
            <View style={styles.shareCard}>
              <Text style={styles.shareTitle}>目標達成中！ 🎯</Text>
              {selectedGoal && (
                <>
                  <Text style={styles.shareGoalTitle}>
                    {selectedGoal.title}
                  </Text>
                  <View style={styles.shareProgressContainer}>
                    <View style={styles.shareProgressBar}>
                      <View
                        style={[
                          styles.shareProgressFill,
                          {
                            width: `${Math.min(
                              (selectedGoal.current_value / selectedGoal.target_value) * 100,
                              100
                            )}%`,
                            backgroundColor: selectedGoal.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={styles.shareProgressText}>
                    {Math.round(
                      (selectedGoal.current_value / selectedGoal.target_value) * 100
                    )}
                    % 完了
                  </Text>
                  <Text style={styles.shareStats}>
                    {selectedGoal.current_value} / {selectedGoal.target_value}{" "}
                    {selectedGoal.unit}
                  </Text>
                </>
              )}
              <Text style={styles.shareFooter}>Fitness Tracker</Text>
            </View>
          </ViewShot>

          <View style={styles.shareActions}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-social" size={24} color={colors.white} />
              <Text style={styles.shareButtonText}>シェア</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
        </ScreenWrapper>
      </KeyboardAvoidingWrapper>
      
      <FloatingActionButton
        onPress={() => navigation.navigate('GoalsInput')}
        text={`${t("goals.title")}を追加`}
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
  listContent: {
    padding: 20,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: theme.colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: theme.colors.text.secondary,
    marginTop: spacing.md,
  },
  goalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  goalTitleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  goalIcon: {
    marginRight: theme.spacing.sm,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
    flex: 1,
  },
  goalTarget: {
    fontSize: 14,
    color: colors.gray[500],
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.gray[900],
    textAlign: "right",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.gray[900],
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: colors.gray[900],
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.gray[200],
  },
  cancelButtonText: {
    color: colors.gray[700],
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: colors.purple[500],
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  shareModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  shareCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    minWidth: 300,
  },
  shareTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.purple[700],
    marginBottom: 20,
  },
  shareGoalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 20,
    textAlign: "center",
  },
  shareProgressContainer: {
    width: "100%",
    marginBottom: 16,
  },
  shareProgressBar: {
    height: 20,
    backgroundColor: colors.gray[200],
    borderRadius: 10,
    overflow: "hidden",
  },
  shareProgressFill: {
    height: "100%",
    borderRadius: 10,
  },
  shareProgressText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.gray[900],
    marginBottom: 8,
  },
  shareStats: {
    fontSize: 16,
    color: colors.gray[600],
    marginBottom: 24,
  },
  shareFooter: {
    fontSize: 14,
    color: colors.gray[500],
    fontStyle: "italic",
  },
  shareActions: {
    marginTop: 24,
  },
  shareButton: {
    flexDirection: "row",
    backgroundColor: colors.purple[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    gap: 8,
  },
  shareButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});