import { supabase } from './client'
import type { 
  Workout, 
  WorkoutExercise, 
  Exercise, 
  Set,
  CreateWorkoutInput,
  CreateSetInput 
} from '@fitness-tracker/types'

// Workout operations
export const getWorkouts = async (userId: string) => {
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises (
        *,
        exercise:exercises (*),
        sets (*)
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false })
  
  return { data, error }
}

export const getWorkout = async (workoutId: string) => {
  const { data, error } = await supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises (
        *,
        exercise:exercises (*),
        sets (*)
      )
    `)
    .eq('id', workoutId)
    .single()
  
  return { data, error }
}

export const createWorkout = async (userId: string, workout: CreateWorkoutInput) => {
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      ...workout,
      user_id: userId
    })
    .select()
    .single()
  
  return { data, error }
}

export const updateWorkout = async (id: string, updates: Partial<CreateWorkoutInput>) => {
  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const deleteWorkout = async (id: string) => {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id)
  
  return { error }
}

// Workout Exercise operations
export const addExerciseToWorkout = async (
  workoutId: string, 
  exerciseId: string, 
  orderIndex: number
) => {
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert({
      workout_id: workoutId,
      exercise_id: exerciseId,
      order_index: orderIndex
    })
    .select(`
      *,
      exercise:exercises (*)
    `)
    .single()
  
  return { data, error }
}

export const removeExerciseFromWorkout = async (workoutExerciseId: string) => {
  const { error } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('id', workoutExerciseId)
  
  return { error }
}

export const updateExerciseOrder = async (workoutExerciseId: string, orderIndex: number) => {
  const { data, error } = await supabase
    .from('workout_exercises')
    .update({ order_index: orderIndex })
    .eq('id', workoutExerciseId)
    .select()
    .single()
  
  return { data, error }
}

// Set operations
export const addSet = async (workoutExerciseId: string, set: CreateSetInput) => {
  const { data, error } = await supabase
    .from('sets')
    .insert({
      ...set,
      workout_exercise_id: workoutExerciseId
    })
    .select()
    .single()
  
  return { data, error }
}

export const updateSet = async (setId: string, updates: Partial<CreateSetInput>) => {
  const { data, error } = await supabase
    .from('sets')
    .update(updates)
    .eq('id', setId)
    .select()
    .single()
  
  return { data, error }
}

export const deleteSet = async (setId: string) => {
  const { error } = await supabase
    .from('sets')
    .delete()
    .eq('id', setId)
  
  return { error }
}

// Exercise operations
export const getExercises = async () => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name')
  
  return { data, error }
}

export const getExercisesByMuscleGroup = async (muscleGroup: string) => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('muscle_group', muscleGroup)
    .order('name')
  
  return { data, error }
}

export const searchExercises = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('name')
    .limit(20)
  
  return { data, error }
}