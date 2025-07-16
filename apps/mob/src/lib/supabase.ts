import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// structuredClone polyfill for React Native
if (!global.structuredClone) {
  global.structuredClone = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };
}

// 環境変数が正しく読み込まれない場合のフォールバック
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fglbnfkmybahntsxrjwv.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbGJuZmtteWJhaG50c3hyand2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1ODA1NzUsImV4cCI6MjA0ODE1NjU3NX0.Y_5mUe-xA6wqTG3-mENKG8xRGuxQQg5goBKONAQgG94';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  // デバッグ用の設定
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});