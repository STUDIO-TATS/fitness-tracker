import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SUPABASE_CONFIG } from '../config/supabase.config'

const supabaseUrl = SUPABASE_CONFIG.url
const supabaseAnonKey = SUPABASE_CONFIG.anonKey

// デバッグ情報を出力
console.log('=== Supabase Configuration ===')
console.log('URL:', supabaseUrl)
console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET')
console.log('Environment:', process.env.NODE_ENV)
console.log('=============================')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export const signIn = async (email: string, password: string) => {
  console.log('=== Sign In Attempt ===')
  console.log('Email:', email)
  console.log('URL:', supabaseUrl)
  
  try {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    console.log('Sign in response:', response)
    
    if (response.error) {
      console.error('Sign in error:', response.error)
    }
    
    return response
  } catch (error) {
    console.error('Sign in exception:', error)
    throw error
  }
}

export const signUp = async (email: string, password: string, name: string) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}