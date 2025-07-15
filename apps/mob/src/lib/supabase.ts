import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { mockAuth } from './mockAuth';

// モックモードフラグ（ネットワークエラー時はtrueに設定）
const USE_MOCK = true; // 一時的にモックモードを有効化

// 環境変数が正しく読み込まれない場合のフォールバック
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fglbnfkmybahntsxrjwv.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbGJuZmtteWJhaG50c3hyand2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1ODA1NzUsImV4cCI6MjA0ODE1NjU3NX0.Y_5mUe-xA6wqTG3-mENKG8xRGuxQQg5goBKONAQgG94';

// デバッグ用にURLを確認
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);
console.log('Using mock mode:', USE_MOCK);

const realSupabase = createClient(supabaseUrl, supabaseAnonKey, {
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

// モックモードの場合はモック認証を使用
export const supabase = USE_MOCK ? {
  auth: mockAuth,
  // 他のメソッドは実際のSupabaseクライアントを使用
  from: realSupabase.from.bind(realSupabase),
  storage: realSupabase.storage,
  functions: realSupabase.functions,
} : realSupabase;