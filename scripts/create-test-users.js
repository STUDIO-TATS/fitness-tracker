const { createClient } = require('@supabase/supabase-js')

// サービスロールキーを使用（管理者権限）
const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUsers() {
  console.log('テストユーザーを作成中...')
  
  const testUsers = [
    { email: 'admin@fittracker.com', password: 'Admin123!', name: 'システム管理者' },
    { email: 'staff@fittracker.com', password: 'Staff123!', name: 'スタッフ太郎' },
    { email: 'user1@example.com', password: 'User123!', name: '山田太郎' },
    { email: 'user2@example.com', password: 'User123!', name: '鈴木花子' },
    { email: 'user3@example.com', password: 'User123!', name: '佐藤次郎' }
  ]

  for (const user of testUsers) {
    try {
      // Admin APIを使用してユーザー作成
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name
        }
      })

      if (error) {
        console.error(`エラー (${user.email}):`, error.message)
      } else {
        console.log(`✓ ${user.email} を作成しました`)
      }
    } catch (err) {
      console.error(`例外 (${user.email}):`, err)
    }
  }

  console.log('完了！')
  process.exit(0)
}

createTestUsers()