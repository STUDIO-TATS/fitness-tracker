import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { colors } from "../constants/colors";
import { icons } from "../constants/icons";
import { theme } from "../constants/theme";
import { useI18n } from "../hooks/useI18n";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { WorkoutStackParamList } from "../navigation/WorkoutStackNavigator";
import {
  commonStyles,
  spacing,
  typography,
  layout,
  borderRadius,
  shadows,
} from "../constants/styles";

interface WorkoutExercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: number;
  distance?: number;
  duration_seconds?: number;
  notes?: string;
  order_index: number;
}

interface Workout {
  id: string;
  name: string;
  date: string;
  duration_minutes: number;
  calories_burned?: number;
  notes?: string;
  workout_exercises?: WorkoutExercise[];
}

type WorkoutNavigationProp = StackNavigationProp<
  WorkoutStackParamList,
  'WorkoutMain'
>;

export default function WorkoutScreen() {
  const { t } = useI18n();
  const { session } = useAuth();
  const navigation = useNavigation<WorkoutNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, [session]);

  const fetchWorkouts = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (*)
        `)
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .limit(20);

      if (error) throw error;

      setWorkouts(data || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      Alert.alert(t("common.error"), t("common.dataFetchError"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => {
        setSelectedWorkout(item);
        setDetailModalVisible(true);
      }}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutTitleSection}>
          <View style={styles.workoutNameRow}>
            <Ionicons
              name={icons.navigation.workoutOutline}
              size={20}
              color={theme.colors.action.secondary}
              style={styles.workoutIcon}
            />
            <Text style={styles.workoutName}>{item.name}</Text>
          </View>
          <View style={styles.workoutDateRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.gray[500]}
              style={styles.dateIcon}
            />
            <Text style={styles.workoutDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <Ionicons
          name={icons.navigation.forward}
          size={20}
          color={theme.colors.text.tertiary}
        />
      </View>

      <View style={styles.workoutInfo}>
        <View style={styles.infoItem}>
          <Ionicons
            name={icons.activity.time}
            size={16}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.infoText}>{item.duration_minutes}分</Text>
        </View>
        {item.calories_burned && (
          <View style={styles.infoItem}>
            <Ionicons
              name={icons.misc.flame}
              size={16}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.infoText}>{item.calories_burned} kcal</Text>
          </View>
        )}
        {item.workout_exercises && item.workout_exercises.length > 0 && (
          <View style={styles.infoItem}>
            <Ionicons
              name={icons.misc.listOutline}
              size={16}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.infoText}>
              {item.workout_exercises.length}種目
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderExerciseItem = ({ item }: { item: WorkoutExercise }) => (
    <View style={styles.exerciseItem}>
      <Text style={styles.exerciseName}>{item.exercise_name}</Text>
      <Text style={styles.exerciseDetails}>
        {item.sets}セット × {item.reps}回
        {item.weight ? ` @ ${item.weight}kg` : ''}
      </Text>
      {item.notes && (
        <Text style={styles.exerciseNotes}>{item.notes}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper backgroundColor={theme.colors.background.tertiary}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.action.primary} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor={theme.colors.background.tertiary}>
      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchWorkouts}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={icons.navigation.workoutOutline}
              size={64}
              color={theme.colors.text.tertiary}
            />
            <Text style={styles.emptyText}>{t("workout.noWorkouts")}</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedWorkout?.name}</Text>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
              >
                <Ionicons
                  name={icons.status.close}
                  size={24}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.workoutDetailInfo}>
              <View style={styles.detailInfoItem}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.colors.text.secondary}
                />
                <Text style={styles.detailInfoText}>
                  {selectedWorkout && formatDate(selectedWorkout.date)}
                </Text>
              </View>
              <View style={styles.detailInfoItem}>
                <Ionicons
                  name={icons.activity.time}
                  size={20}
                  color={theme.colors.text.secondary}
                />
                <Text style={styles.detailInfoText}>
                  {selectedWorkout?.duration_minutes}分
                </Text>
              </View>
              {selectedWorkout?.calories_burned && (
                <View style={styles.detailInfoItem}>
                  <Ionicons
                    name={icons.misc.flame}
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                  <Text style={styles.detailInfoText}>
                    {selectedWorkout.calories_burned} kcal
                  </Text>
                </View>
              )}
            </View>

            {selectedWorkout?.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesSectionTitle}>メモ</Text>
                <Text style={styles.notesText}>{selectedWorkout.notes}</Text>
              </View>
            )}

            <Text style={styles.exerciseSectionTitle}>エクササイズ</Text>
            <FlatList
              data={selectedWorkout?.workout_exercises?.sort((a, b) => a.order_index - b.order_index)}
              renderItem={renderExerciseItem}
              keyExtractor={(item) => item.id}
              style={styles.exerciseList}
            />
          </View>
        </View>
      </Modal>

      <FloatingActionButton
        onPress={() => navigation.navigate('WorkoutInput')}
        text={t("workout.startWorkout")}
        icon="add"
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: layout.screenPadding,
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
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    ...typography.body,
    color: theme.colors.text.secondary,
    marginTop: spacing.md,
  },
  workoutCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  workoutTitleSection: {
    flex: 1,
  },
  workoutNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  workoutIcon: {
    marginRight: theme.spacing.sm,
  },
  workoutName: {
    ...typography.cardTitle,
    color: theme.colors.text.primary,
  },
  workoutDateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIcon: {
    marginRight: theme.spacing.xs,
  },
  workoutDate: {
    ...typography.small,
    color: theme.colors.text.secondary,
  },
  workoutInfo: {
    flexDirection: "row",
    gap: theme.spacing.lg,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  infoText: {
    ...typography.small,
    color: theme.colors.text.secondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    ...typography.screenTitle,
    color: theme.colors.text.primary,
  },
  workoutDetailInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  detailInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  detailInfoText: {
    ...typography.body,
    color: theme.colors.text.primary,
  },
  notesSection: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  notesSectionTitle: {
    ...typography.small,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  notesText: {
    ...typography.body,
    color: theme.colors.text.primary,
  },
  exerciseSectionTitle: {
    ...typography.sectionTitle,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  exerciseList: {
    maxHeight: 300,
  },
  exerciseItem: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  exerciseName: {
    ...typography.body,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  exerciseDetails: {
    ...typography.small,
    color: theme.colors.text.secondary,
  },
  exerciseNotes: {
    ...typography.small,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
    fontStyle: "italic",
  },
});