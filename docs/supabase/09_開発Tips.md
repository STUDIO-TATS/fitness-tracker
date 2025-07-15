# Supabase開発Tips集

## 🚀 効率的な開発のために

### 1. エイリアスとショートカット

#### bashエイリアス設定
```bash
# ~/.bashrc または ~/.zshrc に追加
alias sb='supabase'
alias sbstart='supabase start'
alias sbstop='supabase stop'
alias sbreset='supabase db reset'
alias sbstudio='open http://localhost:54323'
```

#### VSCode snippets
```json
// .vscode/supabase.code-snippets
{
  "Supabase Client": {
    "prefix": "sbclient",
    "body": [
      "import { createClient } from '@supabase/supabase-js'",
      "",
      "const supabase = createClient(",
      "  process.env.${1:NEXT_PUBLIC_}SUPABASE_URL!,",
      "  process.env.${1:NEXT_PUBLIC_}SUPABASE_ANON_KEY!",
      ")"
    ]
  },
  "RLS Policy": {
    "prefix": "rlspolicy",
    "body": [
      "CREATE POLICY \"${1:policy_name}\" ON public.${2:table_name}",
      "  FOR ${3|SELECT,INSERT,UPDATE,DELETE,ALL|}",
      "  TO authenticated",
      "  USING (${4:auth.uid() = user_id});"
    ]
  }
}
```

### 2. デバッグ技法

#### SQLデバッグ
```sql
-- クエリプランの確認
EXPLAIN ANALYZE
SELECT * FROM large_table WHERE condition = true;

-- 実行時間の計測
\timing on
SELECT COUNT(*) FROM activities;

-- デバッグ出力
DO $$
BEGIN
    RAISE NOTICE 'Debug: user_id = %', auth.uid();
    RAISE NOTICE 'Debug: current time = %', NOW();
END $$;
```

#### JavaScriptデバッグ
```javascript
// Supabaseクエリのデバッグ
const { data, error, status, statusText } = await supabase
  .from('users')
  .select('*')
  .single()

console.log({
  data,
  error,
  status,
  statusText,
  // 実行されたクエリを確認
  query: supabase.from('users').select('*').single().toString()
})
```

### 3. 型安全性の向上

#### 型生成の自動化
```json
// package.json
{
  "scripts": {
    "dev": "concurrently \"next dev\" \"npm run watch:types\"",
    "watch:types": "watch 'npm run db:types' ./supabase/migrations"
  }
}
```

#### カスタム型定義
```typescript
// types/supabase-helpers.ts
import { Database } from './supabase'

// テーブル型の抽出
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// 使用例
type User = Tables<'users'>
type NewUser = InsertTables<'users'>
```

### 4. ローカル開発の高速化

#### データのプリロード
```bash
# 開発用データをダンプ
pg_dump $DATABASE_URL \
  --data-only \
  --table=companies \
  --table=facilities \
  > supabase/seeds/dev-data.sql

# 起動時に自動ロード
echo "\\i supabase/seeds/dev-data.sql" >> supabase/seed.sql
```

#### ホットリロード設定
```javascript
// supabase/functions/hello/index.ts の開発
// deno.json
{
  "tasks": {
    "dev": "deno run --watch --allow-net --allow-read index.ts"
  }
}
```

### 5. テスト環境の構築

#### テスト用ヘルパー
```typescript
// tests/supabase-test-helper.ts
import { createClient } from '@supabase/supabase-js'

export function createTestClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function createTestUser(email: string) {
  const supabase = createTestClient()
  const { data } = await supabase.auth.admin.createUser({
    email,
    password: 'test123456',
    email_confirm: true
  })
  return data.user
}

export async function cleanupTestData(supabase: any) {
  // テストデータのクリーンアップ
  await supabase.rpc('cleanup_test_data')
}
```

### 6. パフォーマンス最適化

#### インデックスヒント
```sql
-- 実行計画でインデックスが使われているか確認
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM activities 
WHERE user_id = 'uuid' AND created_at > '2024-01-01';

-- 必要に応じてインデックスを作成
CREATE INDEX CONCURRENTLY idx_activities_user_date 
ON activities(user_id, created_at DESC);
```

#### バッチ処理
```javascript
// 大量データの効率的な挿入
async function batchInsert(items: any[], batchSize = 100) {
  const batches = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }
  
  for (const batch of batches) {
    await supabase.from('items').insert(batch)
    // レート制限回避のための待機
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}
```

### 7. 便利なSQL関数

#### 汎用的なヘルパー関数
```sql
-- JSONBから安全に値を取得
CREATE OR REPLACE FUNCTION safe_jsonb_text(data jsonb, key text)
RETURNS text AS $$
BEGIN
  RETURN COALESCE(data->>key, '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 配列に値が含まれるかチェック
CREATE OR REPLACE FUNCTION array_contains(arr anyarray, val anyelement)
RETURNS boolean AS $$
BEGIN
  RETURN val = ANY(arr);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 使用例
SELECT * FROM users 
WHERE safe_jsonb_text(metadata, 'role') = 'admin';
```

### 8. 環境変数の管理

#### .env.localの構造化
```bash
# === Supabase Local ===
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# === Supabase Staging ===
# NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
# SUPABASE_SERVICE_ROLE_KEY=staging-service-role-key

# === Feature Flags ===
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### 環境切り替えスクリプト
```bash
#!/bin/bash
# scripts/switch-env.sh

if [ "$1" = "local" ]; then
  cp .env.local.example .env.local
  echo "Switched to local environment"
elif [ "$1" = "staging" ]; then
  cp .env.staging.example .env.local
  echo "Switched to staging environment"
fi
```

### 9. エラーハンドリング

#### 統一的なエラー処理
```typescript
// utils/supabase-error-handler.ts
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

export async function handleSupabaseError<T>(
  promise: Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await promise
  
  if (error) {
    console.error('Supabase error:', error)
    throw new SupabaseError(
      error.message || 'Unknown error',
      error.code || 'UNKNOWN',
      error.details
    )
  }
  
  if (!data) {
    throw new SupabaseError('No data returned', 'NO_DATA')
  }
  
  return data
}

// 使用例
try {
  const user = await handleSupabaseError(
    supabase.from('users').select('*').single()
  )
} catch (error) {
  if (error instanceof SupabaseError) {
    // エラー処理
  }
}
```

### 10. モニタリングとロギング

#### カスタムロギング
```sql
-- ログテーブルの作成
CREATE TABLE IF NOT EXISTS app_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ログ記録関数
CREATE OR REPLACE FUNCTION log_event(
  p_level TEXT,
  p_message TEXT,
  p_context JSONB DEFAULT '{}'
) RETURNS void AS $$
BEGIN
  INSERT INTO app_logs (level, message, context, user_id)
  VALUES (p_level, p_message, p_context, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 使用例
SELECT log_event('info', 'User login', jsonb_build_object(
  'ip', current_setting('request.headers')::json->>'x-forwarded-for'
));
```

## 🎯 プロダクション移行チェックリスト

- [ ] 環境変数の確認
- [ ] RLSポリシーの検証
- [ ] インデックスの最適化
- [ ] バックアップ戦略の確立
- [ ] モニタリングの設定
- [ ] エラー通知の設定
- [ ] レート制限の確認
- [ ] セキュリティ監査

## 📚 参考リソース

- [Supabase CLI リファレンス](https://supabase.com/docs/reference/cli/introduction)
- [PostgreSQL パフォーマンスTips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Deno デプロイメント](https://deno.com/deploy)
- [Next.js + Supabase ベストプラクティス](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)