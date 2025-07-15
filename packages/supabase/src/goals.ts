import { supabase } from './client'
import type { Goal, CreateGoalInput } from '@fitness-tracker/types'

export const getGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const getActiveGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('target_date', { ascending: true })
  
  return { data, error }
}

export const getGoal = async (goalId: string) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .single()
  
  return { data, error }
}

export const createGoal = async (userId: string, goal: CreateGoalInput) => {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      ...goal,
      user_id: userId,
      current_value: 0,
      status: 'active'
    })
    .select()
    .single()
  
  return { data, error }
}

export const updateGoal = async (id: string, updates: Partial<CreateGoalInput & { current_value: number; status: Goal['status'] }>) => {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const updateGoalProgress = async (id: string, currentValue: number) => {
  const { data: goal, error: fetchError } = await getGoal(id)
  
  if (fetchError || !goal) {
    return { data: null, error: fetchError }
  }
  
  const updates: Partial<Goal> = {
    current_value: currentValue
  }
  
  // Auto-complete goal if target is reached
  if (goal.target_value && currentValue >= goal.target_value) {
    updates.status = 'completed'
  }
  
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const deleteGoal = async (id: string) => {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
  
  return { error }
}