import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUPABASE_CONFIG } from "../config/supabase.config";

const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseAnonKey = SUPABASE_CONFIG.anonKey;

// Create a safe storage wrapper
const storage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('AsyncStorage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('AsyncStorage setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('AsyncStorage removeItem error:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signUp = async (email: string, password: string, name: string) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

// Workout functions - temporary placeholders
export const createWorkout = async (userId: string, workout: any) => {
  return {
    data: null,
    error: new Error("Workout functions not implemented yet"),
  };
};

export const addExerciseToWorkout = async (
  workoutId: string,
  exerciseId: string,
  order: number
) => {
  return {
    data: null,
    error: new Error("Workout functions not implemented yet"),
  };
};

export const addSet = async (workoutExerciseId: string, set: any) => {
  return {
    data: null,
    error: new Error("Workout functions not implemented yet"),
  };
};

export const getExercises = async () => {
  return { data: [], error: null };
};

export const searchExercises = async (term: string) => {
  return { data: [], error: null };
};

// Profile functions
export const getProfile = async (userId: string) => {
  // TEMPORARY: Return mock data to avoid RLS issues
  // This prevents any database queries from being executed
  const mockProfile = {
    id: userId,
    display_name: "テストユーザー",
    username: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    data: mockProfile,
    error: null,
  };
};

export const updateProfile = async (userId: string, profileData: any) => {
  // For now, just return the updated profile data to avoid RLS issues
  return {
    data: {
      id: userId,
      display_name: profileData.display_name || "テストユーザー",
      username: profileData.username || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    error: null,
  };

  // TODO: Re-enable this when RLS is properly configured
  /*
  try {
    console.log('📝 [DEBUG] Updating user_profiles table...')
    const result = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single()
    
    console.log('📝 [DEBUG] Update result:', result)
    return result
  } catch (error) {
    console.error('📝 [DEBUG] Error in updateProfile:', error)
    return { data: null, error }
  }
  */
};

// Goals functions - temporary placeholders until goals table is set up
export const getGoals = async (userId: string) => {
  return { data: [], error: null };
};

export const createGoal = async (userId: string, goalData: any) => {
  return { data: null, error: new Error("Goals table not set up yet") };
};

export const updateGoal = async (goalId: string, goalData: any) => {
  return { data: null, error: new Error("Goals table not set up yet") };
};

export const deleteGoal = async (goalId: string) => {
  return { data: null, error: new Error("Goals table not set up yet") };
};

export const updateGoalProgress = async (goalId: string, progress: number) => {
  return { data: null, error: new Error("Goals table not set up yet") };
};

export const getWorkouts = async (userId: string) => {
  // For now, return empty array until workouts table is properly set up
  return { data: [], error: null };
};

export const getActiveGoals = async (userId: string) => {
  // For now, return empty array until goals table is properly set up
  return { data: [], error: null };
};
