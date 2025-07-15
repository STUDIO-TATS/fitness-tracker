#!/bin/bash

# フィットネストラッカー データベースリセット＆シードスクリプト
# マイグレーションからシードデータまで一括実行

set -e  # エラーが発生したら停止

echo "🚀 フィットネストラッカー データベースセットアップを開始します..."
echo "⚠️  警告: 既存のデータは全て削除されます！"

# 確認プロンプト
read -p "続行しますか？ (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ セットアップがキャンセルされました"
    exit 1
fi

echo ""
echo "1️⃣ Supabaseの起動確認..."

# Supabaseが起動しているかチェック
echo "🔍 Supabaseの状態を確認中..."
if ! npx supabase status --local > /dev/null 2>&1; then
    echo "⚡ Supabaseを起動中..."
    npx supabase start
    
    if [ $? -ne 0 ]; then
        echo "❌ Supabaseの起動が失敗しました"
        echo "💡 手動で起動してから再実行してください: npx supabase start"
        exit 1
    fi
    
    echo "✅ Supabaseが起動しました"
else
    echo "✅ Supabase は既に起動しています"
fi

echo ""
echo "2️⃣ Supabaseプロジェクトのリセット..."

# Supabaseプロジェクトの完全リセット
echo "🗑️  データベースをリセット中..."
npx supabase db reset --local

if [ $? -ne 0 ]; then
    echo "❌ データベースリセットが失敗しました"
    exit 1
fi

echo "✅ データベースリセットが完了しました"
echo ""

echo "3️⃣ マイグレーションの実行..."

# マイグレーションを実行
echo "📋 マイグレーションファイルを適用中..."
npx supabase db push --local

if [ $? -ne 0 ]; then
    echo "❌ マイグレーションの実行が失敗しました"
    exit 1
fi

echo "✅ マイグレーションが完了しました"
echo ""

echo "4️⃣ シードデータの投入..."

# シードスクリプトを実行
echo "🌱 シードデータを投入中..."
cd "$(dirname "$0")/.." # プロジェクトルートに移動
npx tsx scripts/seed-auth.ts

if [ $? -ne 0 ]; then
    echo "❌ シードデータの投入が失敗しました"
    exit 1
fi

echo ""
echo "🎉 セットアップが正常に完了しました！"
echo ""
echo "📊 データベース構成:"
echo "- 会社数: 3社"
echo "- 施設数: 6施設"
echo "- ユーザー数: 4人（エンドユーザー1人 + 会社ユーザー3人）"
echo "- QRコード: 6つの施設それぞれに配置"
echo ""
echo "🔗 アクセス情報:"
echo "- Supabase Studio: http://localhost:54323"
echo "- データベースURL: postgresql://postgres:postgres@localhost:54322/postgres"
echo ""
echo "👤 テストユーザー:"
echo "【エンドユーザー】"
echo "- メール: demo@fitness-tracker.com"
echo "- パスワード: demo123456"
echo ""
echo "【会社管理者】"
echo "- フィットネスチェーンA: admin@fitness-chain-a.com / admin123456"
echo "- ヨガスタジオB: manager@yoga-studio-b.com / manager123456"
echo "- アクアフィットネスC: staff@aqua-fitness-c.com / staff123456"
echo ""
echo "🏋️‍♂️ QRコードテスト例:"
echo "- QR_FCA_SBY_GYM01 (フィットネスチェーンA 渋谷支店 ジム)"
echo "- QR_YSB_YOGA01 (ヨガスタジオB)"
echo "- QR_AFC_POOL01 (アクアフィットネスC メインプール)"