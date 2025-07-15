# データベース管理コマンド

このプロジェクトでは、Supabaseを使用してデータベースを管理しています。以下のコマンドを使用して、ローカルおよびリモート環境のデータベースを操作できます。

## 🚀 クイックスタート

```bash
# 初回セットアップ
pnpm db:setup

# 開発サーバー起動
pnpm dev
```

## 📋 コマンド一覧

### ローカル環境用コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm db:start` | ローカルのSupabase環境を起動 |
| `pnpm db:stop` | ローカルのSupabase環境を停止 |
| `pnpm db:status` | ローカル環境の状態を確認（URL、キーなど） |
| `pnpm db:reset` | ローカルDBをリセット（マイグレーション再実行＋シード） |
| `pnpm db:setup` | 初期セットアップ（start + reset） |

### マイグレーション管理

| コマンド | 説明 |
|---------|------|
| `pnpm db:migrate:new` | 新しいマイグレーションファイルを作成 |
| `pnpm db:migrate:list` | マイグレーションの適用状況を確認 |
| `pnpm db:migrate:up` | マイグレーションを実行 |
| `pnpm db:diff` | 現在のスキーマとマイグレーションの差分を表示 |

### 開発支援

| コマンド | 説明 |
|---------|------|
| `pnpm db:dump` | ローカルDBのスキーマをダンプ |
| `pnpm db:types` | TypeScriptの型定義を生成 |

### リモート環境用コマンド（`:remote`付き）

> ⚠️ **注意**: リモート環境への操作は本番データに影響します！

| コマンド | 説明 |
|---------|------|
| `pnpm db:push:remote` | ローカルのスキーマをリモートに適用 |
| `pnpm db:pull:remote` | リモートの状態をローカルに同期 |
| `pnpm db:reset:remote` | ⚠️ **危険** リモートDBを完全リセット（確認あり） |
| `pnpm db:migrate:repair:remote` | リモートのマイグレーション履歴を修復 |
| `pnpm db:dump:remote` | リモートDBのスキーマをダンプ |
| `pnpm db:types:remote` | リモートDBから型定義を生成 |

### プロジェクト管理

| コマンド | 説明 |
|---------|------|
| `pnpm db:link` | リモートプロジェクトとリンク |
| `pnpm db:unlink` | リンクを解除 |

## 🔄 典型的なワークフロー

### 1. 新機能開発時

```bash
# 1. マイグレーション作成
pnpm db:migrate:new add_new_feature

# 2. SQLファイルを編集
# supabase/migrations/[timestamp]_add_new_feature.sql

# 3. ローカルでテスト
pnpm db:reset

# 4. 型定義を更新
pnpm db:types

# 5. 問題なければリモートに適用
pnpm db:push:remote
```

### 2. 既存プロジェクトに参加時

```bash
# 1. プロジェクトをクローン
git clone <repository>

# 2. 依存関係インストール
pnpm install

# 3. リモートプロジェクトとリンク
pnpm db:link

# 4. ローカル環境セットアップ
pnpm db:setup

# 5. リモートの最新状態を確認
pnpm db:pull:remote
```

### 3. トラブルシューティング時

```bash
# マイグレーション状態確認
pnpm db:migrate:list

# 差分確認
pnpm db:diff

# 必要に応じて修復
pnpm db:migrate:repair:remote --status applied <migration_id>
```

## 📁 ディレクトリ構造

```
supabase/
├── migrations/      # マイグレーションファイル
│   └── [timestamp]_[description].sql
├── seed.sql        # シードデータ
├── schema.sql      # 現在のスキーマ（参照用）
└── functions/      # Edge Functions（今後追加予定）
```

## 🔗 関連ドキュメント

- [Supabaseの基本概念](./docs/supabase/01_基本概念.md)
- [ローカル開発環境](./docs/supabase/02_ローカル開発環境.md)
- [リモート環境との連携](./docs/supabase/03_リモート環境との連携.md)
- [マイグレーションの仕組み](./docs/supabase/04_マイグレーションの仕組み.md)
- [トラブルシューティング](./docs/supabase/05_トラブルシューティング.md)

## 🌐 アクセスURL

### ローカル環境
- **API**: http://localhost:54321
- **Studio**: http://localhost:54323
- **Inbucket（メール）**: http://localhost:54324

### リモート環境
- **Dashboard**: https://supabase.com/dashboard/project/kbihmibidomoxeiysadx

## ⚡ Tips

1. **型安全性を保つ**: スキーマ変更後は必ず `pnpm db:types` を実行
2. **小さなマイグレーション**: 1つのマイグレーションで1つの機能変更
3. **テスト優先**: 必ずローカルでテストしてからリモートに適用
4. **バックアップ**: 重要な変更前は `pnpm db:dump:remote` でバックアップ

## 🚨 注意事項

- `db:reset:remote` は本番データを完全に削除します
- マイグレーションファイルは一度適用したら編集しない
- `service_role_key` は絶対に公開しない
- 本番環境への直接的なSQL実行は避ける

## 🏗️ シードデータの内容

`pnpm db:reset`を実行すると、以下のテストデータが作成されます：

### 👥 テストユーザー

> ⚠️ **注意**: auth.usersへの直接SQL挿入はできません。以下の方法でユーザーを作成してください：

```bash
# Admin APIを使用してテストユーザーを作成
./scripts/create-auth-users.sh
```

作成されるテストユーザー：

| ユーザータイプ | メール | パスワード | 役割 |
|------------|--------|------------|------|
| 管理者 | admin@fittracker.com | Admin123! | システム管理者 |
| スタッフ | staff@fittracker.com | Staff123! | スタッフ |
| 一般会員1 | user1@example.com | User123! | 会員（プレミアム） |
| 一般会員2 | user2@example.com | User123! | 会員（レギュラー） |
| 一般会員3 | user3@example.com | User123! | 会員（VIP） |

### 🏢 会社・施設構成

#### フィットネスワールド株式会社
- **東京本店**（渋谷）
  - フィットネスワールド渋谷店 (QR: `QR-FW-SHIBUYA-001`)
- **大阪支店**（梅田）
  - フィットネスワールド梅田店 (QR: `QR-FW-UMEDA-001`)

#### ヘルシーライフ株式会社
- ヘルシーライフ青山スタジオ (QR: `QR-HL-AOYAMA-001`)
- ヘルシーライフ横浜プール (QR: `QR-HL-YOKOHAMA-001`)

### 🎯 アクティビティタイプ

- **ジム施設**: 有酸素運動、ウェイトトレーニング、パーソナルトレーニング
- **ヨガスタジオ**: ハタヨガ、パワーヨガ、ホットヨガ
- **プール施設**: 自由遊泳、アクアビクス、水泳教室

### 🪙 ポイントシステム

| 会社 | ポイント名 | 有効期限 |
|------|------------|----------|
| フィットネスワールド | FWポイント | 12ヶ月 |
| ヘルシーライフ | ヘルシーマイル | 24ヶ月 |

## 🛠️ トラブルシューティング

### Dockerエラーの場合
```bash
# Dockerを再起動
docker system prune -a
pnpm db:start
```

### ポート競合の場合
```bash
# 使用中のポートを確認
lsof -i :54321
lsof -i :54322

# Supabaseを停止して再起動
pnpm db:stop
pnpm db:start
```