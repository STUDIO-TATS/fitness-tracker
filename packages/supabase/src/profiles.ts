import { supabase } from './client'
import type { Profile } from '@fitness-tracker/types'

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

export const updateProfile = async (
  userId: string, 
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

export const checkUsernameAvailability = async (username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()
  
  if (error && error.code === 'PGRST116') {
    // No rows returned means username is available
    return { available: true, error: null }
  }
  
  if (error) {
    return { available: false, error }
  }
  
  return { available: false, error: null }
}

export const uploadAvatar = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file)
  
  if (error) {
    return { url: null, error }
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)
  
  // Update profile with new avatar URL
  await updateProfile(userId, { avatar_url: publicUrl })
  
  return { url: publicUrl, error: null }
}

export const deleteAvatar = async (userId: string, avatarUrl: string) => {
  // Extract file name from URL
  const fileName = avatarUrl.split('/').pop()
  
  if (!fileName) {
    return { error: new Error('Invalid avatar URL') }
  }
  
  const { error } = await supabase.storage
    .from('avatars')
    .remove([fileName])
  
  if (error) {
    return { error }
  }
  
  // Clear avatar URL from profile
  await updateProfile(userId, { avatar_url: null })
  
  return { error: null }
}