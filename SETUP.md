# Fitness Tracker セットアップガイド

このガイドでは、Fitness Trackerアプリケーションの開発環境をセットアップする手順を説明します。

## 前提条件

- Node.js 18+ がインストールされていること
- pnpm がインストールされていること
- Supabaseアカウントを持っていること

## 1. 依存関係のインストール

```bash
pnpm install
```

## 2. Supabaseプロジェクトのセットアップ

### 2.1 Supabase CLIのインストール

```bash
npm install -g supabase
```

### 2.2 Supabaseにログイン

```bash
supabase login
```

### 2.3 プロジェクトとのリンク

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## 3. データベースセットアップ

### 3.1 マイグレーションの実行

```bash
# すべてのマイグレーションを実行
supabase db push

# または個別にマイグレーションを実行
supabase db push --include-all
```

### 3.2 シードデータの投入

```bash
# シードデータを実行（デモデータを含む）
supabase db reset --seed
```

または、手動でシードファイルを実行する場合：

```bash
# Supabase ダッシュボードのSQL Editorで以下のファイルの内容を実行
# supabase/seed.sql
```

## 4. Storage（アバター画像）の設定

### 4.1 avatarバケットの作成

Supabaseダッシュボードで：

1. Storage → Buckets に移動
2. "New bucket" をクリック
3. Bucket name: `avatar`
4. Public bucket: チェックしない（プライベート）
5. "Create bucket" をクリック

### 4.2 RLSポリシーの確認

マイグレーション `00003_avatar_bucket_rls.sql` が正常に実行されると、以下のポリシーが自動的に設定されます：

- ユーザーは自分のアバターのみ表示可能
- ユーザーは自分のアバターのみアップロード可能
- ユーザーは自分のアバターのみ更新・削除可能

## 5. 環境変数の設定

### 5.1 .env.localファイルの作成

```bash
cp .env.local.example .env.local
```

### 5.2 Supabase認証情報の設定

`.env.local` を編集して、以下の値を設定してください：

```env
# Web App (Next.js)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Mobile App (Expo)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

これらの値は Supabase ダッシュボードの Settings → API から取得できます。

## 6. アプリケーションの起動

### 6.1 Webアプリケーション

```bash
pnpm dev:web
```

または

```bash
cd apps/web
pnpm dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

### 6.2 モバイルアプリケーション

```bash
pnpm dev:mobile
```

または

```bash
cd apps/mobile
pnpm start
```

## 7. デモアカウントでのログイン

アプリケーションが起動したら、以下のデモアカウントでログインできます：

**Email:** demo@fitness-tracker.com  
**Password:** demo123456

このアカウントには以下のデータが含まれています：

- 7回のワークアウト履歴（プッシュ、プル、レッグワークアウトなど）
- 4つの進行中の目標
- 5回の体測定記録
- カスタムワークアウトテンプレート
- 24種類のエクササイズデータ

## 8. 開発コマンド

### 8.1 よく使用するコマンド

```bash
# すべてのアプリをビルド
pnpm build

# Webアプリの開発サーバー起動
pnpm dev:web

# モバイルアプリの開発サーバー起動  
pnpm dev:mobile

# 型チェック
pnpm typecheck

# リント
pnpm lint
```

### 8.2 Supabaseコマンド

```bash
# ローカルのSupabaseを起動（オプション）
supabase start

# マイグレーションの作成
supabase migration new migration_name

# マイグレーションの実行
supabase db push

# データベースのリセット（シード含む）
supabase db reset

# Supabase停止
supabase stop
```

## 9. トラブルシューティング

### 9.1 マイグレーションエラー

```bash
# データベースをリセットして再実行
supabase db reset
```

### 9.2 認証エラー

- `.env.local` の認証情報が正しいか確認
- Supabaseプロジェクトのリンクが正しいか確認

### 9.3 RLSエラー

- すべてのマイグレーションが正常に実行されているか確認
- Supabaseダッシュボードでポリシーが設定されているか確認

### 9.4 依存関係エラー

```bash
# node_modulesをクリアして再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 10. 本番デプロイ準備

### 10.1 環境変数の確認

本番環境用の環境変数が正しく設定されているか確認してください。

### 10.2 RLSポリシーの確認

すべてのテーブルでRow Level Security（RLS）が有効になっていることを確認してください。

### 10.3 API制限の設定

Supabaseダッシュボードで適切なAPI制限を設定してください。

---

これでFitness Trackerアプリケーションの開発環境が整いました！

何か問題が発生した場合は、このガイドのトラブルシューティングセクションを参照するか、Supabaseの公式ドキュメントをご確認ください。