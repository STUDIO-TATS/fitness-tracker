#!/bin/bash

# リモートデータベースにシードデータを適用するスクリプト

echo "Applying seed data to remote database..."

# Supabase CLIを使用してリモートDBに接続してSQLを実行
npx supabase db remote set postgresql://postgres:[YOUR-DB-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# またはSupabase管理画面のSQL Editorで直接実行してください
echo "Please run the seed.sql file content in Supabase Dashboard SQL Editor"
echo "Location: https://supabase.com/dashboard/project/kbihmibidomoxeiysadx/sql"