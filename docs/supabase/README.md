# Supabase ドキュメント

このディレクトリには、Fitness TrackerプロジェクトでのSupabaseの使い方に関するドキュメントが含まれています。

## ドキュメント一覧

1. **[01. 基本概念](./01_基本概念.md)**
   - Supabaseの概要とアーキテクチャ
   - 主要コンポーネントの説明
   - 環境の種類（ローカル/リモート）

2. **[02. ローカル開発環境](./02_ローカル開発環境.md)**
   - Docker環境のセットアップ
   - 各種URLとポート番号
   - 開発時の便利なコマンド

3. **[03. リモート環境との連携](./03_リモート環境との連携.md)**
   - ローカルとリモートの判別方法
   - マイグレーションの同期
   - デプロイフロー

4. **[04. マイグレーションの仕組み](./04_マイグレーションの仕組み.md)**
   - マイグレーションファイルの作成
   - 実行と管理方法
   - ベストプラクティス

5. **[05. トラブルシューティング](./05_トラブルシューティング.md)**
   - よくある問題と解決方法
   - 今回遭遇した問題の詳細
   - デバッグのコツ

6. **[06. 複数プロジェクトの管理](./06_複数プロジェクトの管理.md)**
   - 複数プロジェクトの同時起動
   - ポート管理と競合回避
   - リソース管理とベストプラクティス

## クイックリファレンス

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

### 重要なURL

| 環境 | 用途 | URL |
|-----|------|-----|
| ローカル | API | http://localhost:54321 |
| ローカル | DB | postgresql://postgres:postgres@localhost:54322/postgres |
| ローカル | Studio | http://localhost:54323 |
| リモート | Dashboard | https://supabase.com/dashboard |

## プロジェクト固有の情報

- **プロジェクト名**: fitness-tracker
- **リージョン**: Northeast Asia (Tokyo)
- **作成日**: 2025-07-15

## 関連リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [プロジェクトダッシュボード](https://supabase.com/dashboard/project/kbihmibidomoxeiysadx)