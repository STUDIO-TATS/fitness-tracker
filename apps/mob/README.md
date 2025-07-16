# Fitness Tracker Mobile App

Expo SDK 53を使用したフィットネストラッカーモバイルアプリケーション。

## ローカル開発環境

### テストユーザー

以下のテストユーザーが利用可能です（パスワードは全て `testpass123`）：

- `admin@fittracker.com` - システム管理者
- `staff@fittracker.com` - スタッフ太郎
- `user1@example.com` - 田中太郎  
- `user2@example.com` - 鈴木花子
- `user3@example.com` - 佐藤次郎

### 起動方法

1. ルートディレクトリでSupabaseを起動：
   ```bash
   pnpm supabase start
   ```

2. モバイルアプリディレクトリに移動して起動：
   ```bash
   cd apps/mob
   pnpm expo start
   ```

### トラブルシューティング

#### ネットワークエラーが発生する場合

1. `.env.local` ファイルが正しく設定されているか確認：
   ```
   EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
   ```

2. Supabaseが起動しているか確認：
   ```bash
   pnpm supabase status
   ```

3. Expoのキャッシュをクリア：
   ```bash
   pnpm expo start --clear
   ```

#### テストユーザーが存在しない場合

ルートディレクトリで以下を実行：
```bash
./scripts/create-auth-users.sh
```