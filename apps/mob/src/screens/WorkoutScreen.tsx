import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { colors } from '../constants/colors';
import { commonStyles, spacing, typography, layout, borderRadius, shadows } from '../constants/styles';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

interface Workout {
  id: string;
  date: string;
  name: string;
  duration: string;
  exercises: Exercise[];
  calories?: number;
}

export default function WorkoutScreen() {
  const [workouts] = useState<Workout[]>([
    {
      id: '1',
      date: '2024-01-15',
      name: '上半身トレーニング',
      duration: '45分',
      exercises: [
        { id: '1', name: 'ベンチプレス', sets: 3, reps: 10, weight: 60 },
        { id: '2', name: 'ダンベルフライ', sets: 3, reps: 12, weight: 15 },
        { id: '3', name: 'ショルダープレス', sets: 3, reps: 10, weight: 20 },
      ],
      calories: 250,
    },
    {
      id: '2',
      date: '2024-01-13',
      name: '有酸素運動',
      duration: '30分',
      exercises: [
        { id: '1', name: 'ランニング', sets: 1, reps: 1 },
        { id: '2', name: 'バーピー', sets: 3, reps: 15 },
      ],
      calories: 300,
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => {
        setSelectedWorkout(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.workoutHeader}>
        <View>
          <Text style={styles.workoutName}>{item.name}</Text>
          <Text style={styles.workoutDate}>{item.date}</Text>
        </View>
        <View style={styles.workoutStats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={colors.gray[500]} />
            <Text style={styles.statText}>{item.duration}</Text>
          </View>
          {item.calories && (
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={16} color={colors.pink[500]} />
              <Text style={styles.statText}>{item.calories} cal</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.exerciseList}>
        {item.exercises.slice(0, 3).map((exercise) => (
          <Text key={exercise.id} style={styles.exerciseItem}>
            • {exercise.name} {exercise.sets}x{exercise.reps}
            {exercise.weight && ` @${exercise.weight}kg`}
          </Text>
        ))}
        {item.exercises.length > 3 && (
          <Text style={styles.moreExercises}>
            +{item.exercises.length - 3} その他のエクササイズ
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper backgroundColor={colors.pink[50]}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>ワークアウト</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatValue}>12</Text>
          <Text style={styles.quickStatLabel}>今月のワークアウト</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatValue}>5.5</Text>
          <Text style={styles.quickStatLabel}>週平均時間</Text>
        </View>
      </View>

      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedWorkout?.name || 'ワークアウト詳細'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>

            {selectedWorkout && (
              <View>
                <View style={styles.modalStats}>
                  <Text style={styles.modalStatItem}>
                    <Ionicons name="calendar" size={16} /> {selectedWorkout.date}
                  </Text>
                  <Text style={styles.modalStatItem}>
                    <Ionicons name="time" size={16} /> {selectedWorkout.duration}
                  </Text>
                  {selectedWorkout.calories && (
                    <Text style={styles.modalStatItem}>
                      <Ionicons name="flame" size={16} /> {selectedWorkout.calories} cal
                    </Text>
                  )}
                </View>

                <Text style={styles.exerciseListTitle}>エクササイズ</Text>
                {selectedWorkout.exercises.map((exercise) => (
                  <View key={exercise.id} style={styles.modalExerciseItem}>
                    <Text style={styles.modalExerciseName}>{exercise.name}</Text>
                    <Text style={styles.modalExerciseDetails}>
                      {exercise.sets} セット × {exercise.reps} 回
                      {exercise.weight && ` @ ${exercise.weight}kg`}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.screenHeader,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    ...commonStyles.screenTitle,
    color: colors.pink[700],
  },
  addButton: {
    ...commonStyles.addButton,
    backgroundColor: colors.primary,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
  },
  quickStatCard: {
    flex: 1,
    ...commonStyles.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: 0,
    ...shadows.sm,
  },
  quickStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  quickStatLabel: {
    ...typography.caption,
    color: colors.gray[600],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 0,
  },
  workoutCard: {
    ...commonStyles.card,
    borderRadius: borderRadius.lg,
    padding: layout.screenPadding,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  workoutName: {
    ...typography.cardTitle,
    color: colors.gray[900],
  },
  workoutDate: {
    ...typography.small,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statText: {
    ...typography.small,
    color: colors.gray[600],
  },
  exerciseList: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  exerciseItem: {
    ...typography.small,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  moreExercises: {
    ...typography.small,
    color: colors.purple[600],
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: layout.screenPadding,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: layout.screenPadding,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.screenPadding,
  },
  modalTitle: {
    ...typography.sectionTitle,
    color: colors.gray[900],
  },
  modalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginBottom: layout.screenPadding,
  },
  modalStatItem: {
    ...typography.small,
    color: colors.gray[600],
  },
  exerciseListTitle: {
    ...typography.cardTitle,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  modalExerciseItem: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  modalExerciseName: {
    ...typography.body,
    fontWeight: '500',
    color: colors.gray[900],
  },
  modalExerciseDetails: {
    ...typography.small,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  closeButton: {
    ...commonStyles.primaryButton,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    marginTop: layout.screenPadding,
  },
  closeButtonText: {
    ...commonStyles.primaryButtonText,
  },
});