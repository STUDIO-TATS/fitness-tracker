#!/bin/bash

# Fitness Tracker Database Setup Script
# このスクリプトはデータベースのマイグレーションとシードデータの投入を行います

echo "🏋️ Fitness Tracker Database Setup"
echo "=================================="

# 現在のディレクトリがプロジェクトルートかチェック
if [ ! -f "package.json" ]; then
    echo "❌ Error: プロジェクトルートディレクトリで実行してください"
    exit 1
fi

# Supabase CLIがインストールされているかチェック
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLIがインストールされていません"
    echo "📦 インストール方法: npm install -g supabase"
    exit 1
fi

echo "📋 ステップ 1: マイグレーションの実行"
echo "-----------------------------------"

# マイグレーションを実行
if supabase db push; then
    echo "✅ マイグレーションが正常に完了しました"
else
    echo "❌ マイグレーションでエラーが発生しました"
    exit 1
fi

echo ""
echo "📊 ステップ 2: シードデータの投入"
echo "-------------------------------"

# シードデータを実行するかユーザーに確認
read -p "デモデータを投入しますか？ (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # シードファイルが存在するかチェック
    if [ ! -f "supabase/seed.sql" ]; then
        echo "❌ Error: supabase/seed.sql が見つかりません"
        exit 1
    fi

    # シードデータを実行
    echo "🌱 シードデータを投入中..."
    if supabase db reset --seed; then
        echo "✅ シードデータが正常に投入されました"
        echo ""
        echo "🎯 デモアカウント情報:"
        echo "  📧 Email: demo@fitness-tracker.com"
        echo "  🔑 Password: demo123456"
        echo ""
        echo "📈 投入されたデータ:"
        echo "  👤 ユーザー: 1名"
        echo "  💪 エクササイズ: 24種類"
        echo "  🏋️ ワークアウト: 7回"
        echo "  🎯 目標: 4個"
        echo "  📏 体測定: 5回"
        echo "  📋 テンプレート: 5個"
    else
        echo "❌ シードデータの投入でエラーが発生しました"
        exit 1
    fi
else
    echo "⏭️  シードデータの投入をスキップしました"
fi

echo ""
echo "🎉 データベースセットアップが完了しました！"
echo ""
echo "📱 次のステップ:"
echo "  1. .env.local ファイルでSupabase認証情報を設定"
echo "  2. pnpm dev:web でWebアプリを起動"
echo "  3. http://localhost:3000 でアプリにアクセス"
echo "  4. デモアカウントでログイン"
echo ""
echo "🔧 トラブルシューティング:"
echo "  - 問題が発生した場合は SETUP.md を参照してください"
echo "  - データベースリセット: supabase db reset"