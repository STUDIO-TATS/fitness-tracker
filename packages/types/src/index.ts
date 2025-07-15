// Auth types
export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

// Exercise types
export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  equipment?: string | null;
  instructions?: string | null;
  created_at: string;
  is_custom: boolean;
  created_by?: string | null;
}

// Workout types
export interface Workout {
  id: string;
  user_id: string;
  name: string;
  date: string;
  duration?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  workout_exercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  created_at: string;
  exercise?: Exercise;
  sets?: Set[];
}

export interface Set {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps?: number | null;
  weight?: number | null;
  distance?: number | null;
  duration?: number | null;
  rest_time?: number | null;
  notes?: string | null;
  created_at: string;
}

// Goal types
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  target_value?: number | null;
  current_value: number;
  unit?: string | null;
  target_date?: string | null;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Body measurement types
export interface BodyMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight?: number | null;
  body_fat_percentage?: number | null;
  muscle_mass?: number | null;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  biceps_left?: number | null;
  biceps_right?: number | null;
  thigh_left?: number | null;
  thigh_right?: number | null;
  calf_left?: number | null;
  calf_right?: number | null;
  notes?: string | null;
  created_at: string;
}

// Form types for creating/updating
export interface CreateWorkoutInput {
  name: string;
  date: string;
  duration?: number;
  notes?: string;
}

export interface CreateExerciseInput {
  name: string;
  category: string;
  muscle_group: string;
  equipment?: string;
  instructions?: string;
}

export interface CreateSetInput {
  set_number: number;
  reps?: number;
  weight?: number;
  distance?: number;
  duration?: number;
  rest_time?: number;
  notes?: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  target_value?: number;
  unit?: string;
  target_date?: string;
}

export interface CreateBodyMeasurementInput {
  date: string;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps_left?: number;
  biceps_right?: number;
  thigh_left?: number;
  thigh_right?: number;
  calf_left?: number;
  calf_right?: number;
  notes?: string;
}

// Workout template types
export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  estimated_duration?: number | null;
  difficulty_level?: 'Beginner' | 'Intermediate' | 'Advanced' | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  template_exercises?: TemplateExercise[];
  usage_count?: number;
}

export interface TemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  order_index: number;
  suggested_sets?: number | null;
  suggested_reps_min?: number | null;
  suggested_reps_max?: number | null;
  suggested_weight_percentage?: number | null;
  suggested_rest_seconds?: number | null;
  notes?: string | null;
  created_at: string;
  exercise?: Exercise;
}

export interface TemplateUsage {
  id: string;
  template_id: string;
  user_id: string;
  workout_id?: string | null;
  used_at: string;
}

export interface CreateWorkoutTemplateInput {
  name: string;
  description?: string;
  category?: string;
  estimated_duration?: number;
  difficulty_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  is_public?: boolean;
}

export interface CreateTemplateExerciseInput {
  exercise_id: string;
  order_index: number;
  suggested_sets?: number;
  suggested_reps_min?: number;
  suggested_reps_max?: number;
  suggested_weight_percentage?: number;
  suggested_rest_seconds?: number;
  notes?: string;
}

// Enums
export const ExerciseCategories = ['Strength', 'Cardio', 'Bodyweight', 'Flexibility'] as const;
export type ExerciseCategory = typeof ExerciseCategories[number];

export const MuscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body'] as const;
export type MuscleGroup = typeof MuscleGroups[number];

export const GoalStatus = ['active', 'completed', 'paused', 'cancelled'] as const;
export type GoalStatusType = typeof GoalStatus[number];

export const TemplateCategories = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Cardio', 'Custom'] as const;
export type TemplateCategory = typeof TemplateCategories[number];

export const DifficultyLevels = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type DifficultyLevel = typeof DifficultyLevels[number];