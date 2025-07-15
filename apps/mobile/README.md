# Fitness Tracker Mobile App

## 開発環境のセットアップ

### 必要な環境
- Node.js 18以上
- Expo CLI
- iOS Simulator (Mac) または Android Emulator

### インストール

```bash
# プロジェクトルートで
npm install
```

### 環境変数の設定

`.env` ファイルに以下の環境変数を設定してください：

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 開発サーバーの起動

```bash
npm run dev
```

## テストユーザー

開発用のテストユーザーが用意されています：

- **メールアドレス**: test@example.com
- **パスワード**: test1234

このユーザーには以下のサンプルデータが含まれています：
- ワークアウト履歴
- 目標設定
- 体測定データ

## シードデータの設定

1. Supabaseダッシュボードでテストユーザーを作成するか、以下のコマンドを実行：

```bash
# Service Role Keyが必要です
cd packages/supabase
npx tsx create-seed-user.ts
```

2. 作成されたユーザーIDを使ってSQLを実行：

```bash
# seed.sql内のUSER_IDを実際のユーザーIDに置き換えてから実行
psql your_database_url < packages/supabase/seed.sql
```

## 機能

- **ダッシュボード**: 今日の統計、最近のトレーニング、目標の進捗を表示
- **ワークアウト**: トレーニングの記録と履歴の確認
- **目標**: フィットネス目標の設定と進捗管理
- **体測定**: 体重、体脂肪率などの記録
- **プロフィール**: ユーザー情報の管理

## トラブルシューティング

### AuthSessionMissingError

このエラーが発生した場合は、以下を確認してください：
- 環境変数が正しく設定されているか
- ユーザーがログインしているか
- AsyncStorageが正しく動作しているか

### New Architecture警告

`app.json`に`"newArchEnabled": true`が設定されていることを確認してください。