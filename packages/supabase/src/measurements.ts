import { supabase } from './client'
import type { BodyMeasurement, CreateBodyMeasurementInput } from '@fitness-tracker/types'

export const getMeasurements = async (userId: string) => {
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  
  return { data, error }
}

export const getLatestMeasurement = async (userId: string) => {
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single()
  
  return { data, error }
}

export const getMeasurementsByDateRange = async (
  userId: string, 
  startDate: string, 
  endDate: string
) => {
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
  
  return { data, error }
}

export const createMeasurement = async (
  userId: string, 
  measurement: CreateBodyMeasurementInput
) => {
  const { data, error } = await supabase
    .from('body_measurements')
    .insert({
      ...measurement,
      user_id: userId
    })
    .select()
    .single()
  
  return { data, error }
}

export const updateMeasurement = async (
  id: string, 
  updates: Partial<CreateBodyMeasurementInput>
) => {
  const { data, error } = await supabase
    .from('body_measurements')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const deleteMeasurement = async (id: string) => {
  const { error } = await supabase
    .from('body_measurements')
    .delete()
    .eq('id', id)
  
  return { error }
}

// Helper function to calculate progress between two measurements
export const calculateProgress = (
  current: BodyMeasurement, 
  previous: BodyMeasurement
) => {
  const progress: Record<string, number | null> = {}
  
  const fields = [
    'weight', 'body_fat_percentage', 'muscle_mass',
    'chest', 'waist', 'hips', 
    'biceps_left', 'biceps_right',
    'thigh_left', 'thigh_right',
    'calf_left', 'calf_right'
  ] as const
  
  fields.forEach(field => {
    if (current[field] != null && previous[field] != null) {
      progress[field] = current[field] - previous[field]
    } else {
      progress[field] = null
    }
  })
  
  return progress
}