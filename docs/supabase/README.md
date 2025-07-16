# Supabase ドキュメント

このディレクトリには、Fitness Tracker プロジェクトでの Supabase の使い方に関するドキュメントが含まれています。

## 📚 ドキュメント一覧

### 基礎編

1. **[01. 基本概念](./01_基本概念.md)**

   - Supabase の概要とアーキテクチャ
   - 主要コンポーネントの説明
   - 環境の種類（ローカル/リモート）

2. **[02. ローカル開発環境](./02_ローカル開発環境.md)**

   - Docker 環境のセットアップ
   - 各種 URL とポート番号
   - 開発時の便利なコマンド

3. **[03. リモート環境との連携](./03_リモート環境との連携.md)**

   - ローカルとリモートの判別方法
   - マイグレーションの同期
   - デプロイフロー

4. **[04. マイグレーションの仕組み](./04_マイグレーションの仕組み.md)**
   - マイグレーションファイルの作成
   - 実行と管理方法
   - ベストプラクティス

### 応用編

5. **[05. トラブルシューティング](./05_トラブルシューティング.md)**

   - よくある問題と解決方法
   - 今回遭遇した問題の詳細
   - デバッグのコツ

6. **[06. 複数プロジェクトの管理](./06_複数プロジェクトの管理.md)**
   - 複数プロジェクトの同時起動
   - ポート管理と競合回避
   - リソース管理とベストプラクティス

### ⚠️ 重要な注意事項

7. **[07. 注意点とベストプラクティス](./07_注意点とベストプラクティス.md)**

   - 避けるべきこと
   - セキュリティ上の注意
   - パフォーマンス最適化
   - プロジェクト固有の注意点

8. **[08. auth.users 直接挿入問題](./08_auth.users直接挿入問題.md)** 🚨

   - なぜ直接 SQL でユーザーを作成できないのか
   - 正しいユーザー作成方法
   - Admin API の使い方
   - CI/CD 環境での対応

9. **[09. 開発 Tips](./09_開発Tips.md)** 💡
   - 効率的な開発のための Tips
   - デバッグ技法
   - 便利なツールとスクリプト
   - パフォーマンス最適化

## 🚀 クイックリファレンス

### 基本コマンド

```bash
# ローカル環境
supabase start          # 起動
supabase stop           # 停止
supabase status         # 状態確認
supabase db reset       # DBリセット

# マイグレーション
supabase migration new <name>  # 新規作成
supabase migration list        # 一覧表示
supabase db push              # リモートへ適用

# その他
supabase gen types typescript --local > types/database.ts  # 型生成
```

### ⚠️ 最重要：テストユーザーの作成

```bash
# auth.usersへの直接SQL挿入は動作しません！
# 必ずAdmin APIを使用してください：
```

### 重要な URL

| 環境     | 用途      | URL                                                     |
| -------- | --------- | ------------------------------------------------------- |
| ローカル | API       | http://localhost:54321                                  |
| ローカル | DB        | postgresql://postgres:postgres@localhost:54322/postgres |
| ローカル | Studio    | http://localhost:54323                                  |
| ローカル | Inbucket  | http://localhost:54324                                  |
| リモート | Dashboard | https://supabase.com/dashboard                          |

### 環境変数

```bash
# 公開可能
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# 秘密（絶対に公開しない）
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
DATABASE_URL
```

## 🏗️ プロジェクト固有の情報

- **プロジェクト名**: fitness-tracker
- **プロジェクト ID**: kbihmibidomoxeiysadx
- **リージョン**: Northeast Asia (Tokyo)
- **作成日**: 2025-07-15

### データベース構成

- マルチテナント対応
- 会社・施設・ユーザー管理
- アクティビティトラッキング
- ポイントシステム

## 📖 読む順番（推奨）

1. **初めての方**: 01 → 02 → 07 → 08
2. **開発を始める方**: 02 → 04 → 09
3. **トラブル対応**: 05 → 08
4. **本番環境構築**: 03 → 07

## 🔗 関連リンク

- [Supabase 公式ドキュメント](https://supabase.com/docs)
- [プロジェクトダッシュボード](https://supabase.com/dashboard/project/kbihmibidomoxeiysadx)
- [PostgreSQL 公式ドキュメント](https://www.postgresql.org/docs/)
- [GitHub リポジトリ](https://github.com/STUDIO-TATS/fitness-tracker)
