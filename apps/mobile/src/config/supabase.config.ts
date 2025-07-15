// Supabase設定
// 開発環境では手動でIPアドレスを設定

const isDevelopment = process.env.NODE_ENV === 'development'

export const SUPABASE_CONFIG = {
  // iOSシミュレーターからlocalhostにアクセスするには実際のIPアドレスが必要
  url: isDevelopment 
    ? 'http://192.168.0.36:54321'
    : process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  
  anonKey: isDevelopment
    ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
}

