import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, FlatList } from 'react-native'
import { Text, Card, Button, Input } from '@fitness-tracker/ui'
import { colors, spacing } from '@fitness-tracker/ui'
import { 
  createWorkout, 
  addExerciseToWorkout, 
  addSet, 
  getExercises,
  searchExercises,
  getCurrentUser 
} from '../lib/supabase'
import type { Exercise, CreateSetInput } from '@fitness-tracker/types'
import { useAuth } from '../hooks/useAuth'
import { DrawerLayout } from '../components/DrawerLayout'

interface WorkoutExerciseData {
  exercise: Exercise
  sets: CreateSetInput[]
}

export const WorkoutScreen = () => {
  const { user } = useAuth()
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0])
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [exercises, setExercises] = useState<WorkoutExerciseData[]>([])
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadExercises()
  }, [])

  const loadExercises = async () => {
    try {
      const { data } = await getExercises()
      if (data) {
        setAvailableExercises(data)
      }
    } catch (error) {
      console.error('Error loading exercises:', error)
    }
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (term.trim()) {
      const { data } = await searchExercises(term)
      if (data) {
        setAvailableExercises(data)
      }
    } else {
      loadExercises()
    }
  }

  const addExercise = (exercise: Exercise) => {
    setExercises([
      ...exercises,
      {
        exercise,
        sets: [{ set_number: 1, reps: 0, weight: 0 }]
      }
    ])
    setShowExerciseModal(false)
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const addSetToExercise = (exerciseIndex: number) => {
    const updated = [...exercises]
    const lastSetNumber = updated[exerciseIndex].sets.length
    updated[exerciseIndex].sets.push({
      set_number: lastSetNumber + 1,
      reps: 0,
      weight: 0
    })
    setExercises(updated)
  }

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof CreateSetInput, value: number) => {
    const updated = [...exercises]
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value
    }
    setExercises(updated)
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises]
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex)
    // Update set numbers
    updated[exerciseIndex].sets.forEach((set, i) => {
      set.set_number = i + 1
    })
    setExercises(updated)
  }

  const saveWorkout = async () => {
    if (!workoutName || exercises.length === 0 || !user) {
      Alert.alert('エラー', 'ワークアウト名とエクササイズを入力してください')
      return
    }

    setSaving(true)
    try {
      // Create workout
      const { data: workout, error: workoutError } = await createWorkout(user.id, {
        name: workoutName,
        date: workoutDate,
        notes: workoutNotes
      })

      if (workoutError || !workout) throw workoutError

      // Add exercises and sets
      for (let i = 0; i < exercises.length; i++) {
        const { exercise, sets } = exercises[i]
        
        const { data: workoutExercise, error: exerciseError } = await addExerciseToWorkout(
          workout.id,
          exercise.id,
          i
        )
        if (exerciseError || !workoutExercise) throw exerciseError

        // Add sets
        for (const set of sets) {
          if (set.reps && set.weight) {
            const { error: setError } = await addSet(workoutExercise.id, set)
            if (setError) throw setError
          }
        }
      }

      Alert.alert('成功', 'ワークアウトを保存しました')
      setWorkoutName('')
      setWorkoutNotes('')
      setExercises([])
    } catch (error: any) {
      Alert.alert('エラー', error.message)
    } finally {
      setSaving(false)
    }
  }

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => addExercise(item)}
    >
      <Text variant="body" weight="semibold">{item.name}</Text>
      <Text variant="caption" color="gray">{item.muscle_group} • {item.category}</Text>
    </TouchableOpacity>
  )

  return (
    <DrawerLayout title="ワークアウト">
      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: spacing.lg }}>
        <Input
          label="ワークアウト名"
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="例：胸の日"
        />

        <Input
          label="日付"
          value={workoutDate}
          onChangeText={setWorkoutDate}
          placeholder="YYYY-MM-DD"
        />

        <Input
          label="メモ（任意）"
          value={workoutNotes}
          onChangeText={setWorkoutNotes}
          placeholder="今日のワークアウトについて..."
          multiline
          numberOfLines={3}
        />

        <Card style={styles.addExerciseCard}>
          <Button
            title="エクササイズを追加"
            onPress={() => setShowExerciseModal(true)}
            variant="secondary"
          />
        </Card>

        {exercises.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text variant="body" color="gray" style={styles.emptyText}>
              エクササイズを追加してワークアウトを開始しましょう
            </Text>
          </Card>
        ) : (
          exercises.map((item, exerciseIndex) => (
            <Card key={exerciseIndex} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseInfo}>
                  <Text variant="heading3" weight="semibold">{item.exercise.name}</Text>
                  <Text variant="caption" color="gray">{item.exercise.muscle_group}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeExercise(exerciseIndex)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>削除</Text>
                </TouchableOpacity>
              </View>

              {item.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={styles.setNumber}>セット {set.set_number}</Text>
                  
                  <View style={styles.setInputContainer}>
                    <Input
                      placeholder="回数"
                      value={set.reps?.toString() || ''}
                      onChangeText={(value) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(value) || 0)}
                      keyboardType="numeric"
                      style={styles.setInput}
                    />
                    <Text style={styles.unitText}>reps</Text>
                  </View>
                  
                  <View style={styles.setInputContainer}>
                    <Input
                      placeholder="重量"
                      value={set.weight?.toString() || ''}
                      onChangeText={(value) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(value) || 0)}
                      keyboardType="numeric"
                      style={styles.setInput}
                    />
                    <Text style={styles.unitText}>kg</Text>
                  </View>
                  
                  {item.sets.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeSet(exerciseIndex, setIndex)}
                      style={styles.removeSetButton}
                    >
                      <Text style={styles.removeSetText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <Button
                title="セットを追加"
                onPress={() => addSetToExercise(exerciseIndex)}
                variant="secondary"
                size="small"
                style={styles.addSetButton}
              />
            </Card>
          ))
        )}

        {exercises.length > 0 && (
          <Button
            title="ワークアウトを保存"
            onPress={saveWorkout}
            loading={saving}
            style={styles.saveButton}
          />
        )}
      </ScrollView>

      {/* Exercise Selection Modal */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text variant="heading2" weight="semibold">エクササイズを選択</Text>
            <TouchableOpacity
              onPress={() => setShowExerciseModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
          </View>
          
          <Input
            placeholder="エクササイズを検索..."
            value={searchTerm}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />

          <FlatList
            data={availableExercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id}
            style={styles.exerciseList}
          />
        </SafeAreaView>
      </Modal>
    </DrawerLayout>
  )
}

const styles = StyleSheet.create({
  addExerciseCard: {
    marginVertical: spacing.md,
  },
  emptyCard: {
    marginVertical: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
  },
  exerciseCard: {
    marginBottom: spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  removeButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  setNumber: {
    width: 60,
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
  },
  setInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  setInput: {
    flex: 1,
    marginBottom: 0,
  },
  unitText: {
    fontSize: 12,
    color: colors.gray[500],
    width: 30,
  },
  removeSetButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addSetButton: {
    marginTop: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: '500',
  },
  searchInput: {
    margin: spacing.lg,
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  exerciseItem: {
    backgroundColor: '#fff',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
})