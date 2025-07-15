#!/bin/bash

# Supabase Admin APIを使用してテストユーザーを作成

SUPABASE_URL="http://localhost:54321"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

echo "Creating test users..."

# 管理者ユーザー
echo "Creating admin@fittracker.com..."
curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fittracker.com",
    "password": "Admin123!",
    "email_confirm": true,
    "user_metadata": {
      "name": "システム管理者"
    }
  }' | jq .

# スタッフユーザー
echo "Creating staff@fittracker.com..."
curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@fittracker.com",
    "password": "Staff123!",
    "email_confirm": true,
    "user_metadata": {
      "name": "スタッフ太郎"
    }
  }' | jq .

# 一般ユーザー2
echo "Creating user2@example.com..."
curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@example.com",
    "password": "User123!",
    "email_confirm": true,
    "user_metadata": {
      "name": "鈴木花子"
    }
  }' | jq .

# 一般ユーザー3
echo "Creating user3@example.com..."
curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user3@example.com",
    "password": "User123!",
    "email_confirm": true,
    "user_metadata": {
      "name": "佐藤次郎"
    }
  }' | jq .

echo "Done!"

# 作成されたユーザーを確認
echo -e "\nChecking created users..."
docker exec supabase_db_kbihmibidomoxeiysadx psql -U postgres -d postgres -c "SELECT email, created_at FROM auth.users ORDER BY created_at DESC;"