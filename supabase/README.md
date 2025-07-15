# Supabase Seed Scripts

このディレクトリには、Supabaseデータベースのスキーマとシードスクリプトが含まれています。

## ファイル構成

- `schema.sql` - データベーススキーマ定義
- `seed.ts` - シードデータ作成スクリプト
- `package.json` - スクリプト実行用の設定

## セットアップ

### 1. 環境変数の設定

モバイルアプリの `.env` ファイルに以下を追加：

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Service Role Keyは、Supabaseダッシュボードの Settings > API から取得できます。

### 2. 依存関係のインストール

```bash
cd supabase
npm install
```

### 3. シードスクリプトの実行

```bash
npm run seed
```

## シードデータの内容

スクリプトは以下のデータを作成します：

### テストユーザー
- Email: `test@example.com`
- Password: `test1234`

### マスタデータ
- 会社: フィットネスジムA
- 施設: メインジム
- アクティビティタイプ:
  - ウェイトトレーニング
  - カーディオ
  - ヨガ

### サンプルデータ
- ワークアウト履歴: 3件
- 体測定データ: 2件

## 注意事項

- スクリプトは実行時に既存のデータをすべて削除します
- Service Role Keyが必要です（Admin APIを使用するため）
- 本番環境では実行しないでください

## トラブルシューティング

### "Auth session missing" エラー
モバイルアプリでこのエラーが出る場合は、テストユーザーが作成されていない可能性があります。
シードスクリプトを実行してテストユーザーを作成してください。

### テーブルが存在しないエラー
`schema.sql` をSupabaseのSQL Editorで実行してテーブルを作成してください。