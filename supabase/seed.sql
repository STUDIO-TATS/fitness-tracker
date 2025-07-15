-- Fitness Tracker Seed Data
-- マルチテナント対応フィットネス施設管理システムのシードデータ
-- 
-- 注意: このファイルはSupabaseの標準的なseedファイルです
-- `supabase db reset`実行時に自動的に適用されます
--
-- テストユーザーの作成:
-- auth.usersへの直接挿入はできないため、以下のいずれかの方法を使用してください：
-- 1. scripts/create-auth-users.sh を実行
-- 2. Supabase Studio から手動で作成
-- 3. アプリのUIから作成

-- 既存データのクリーンアップ
TRUNCATE TABLE public.point_transactions CASCADE;
TRUNCATE TABLE public.activity_logs CASCADE;
TRUNCATE TABLE public.measurements CASCADE;
TRUNCATE TABLE public.user_points CASCADE;
TRUNCATE TABLE public.point_rules CASCADE;
TRUNCATE TABLE public.point_systems CASCADE;
TRUNCATE TABLE public.user_memberships CASCADE;
TRUNCATE TABLE public.company_users CASCADE;
TRUNCATE TABLE public.user_profiles CASCADE;
TRUNCATE TABLE public.activity_types CASCADE;
TRUNCATE TABLE public.facilities CASCADE;
TRUNCATE TABLE public.branches CASCADE;
TRUNCATE TABLE public.companies CASCADE;

-- 会社・施設データとサンプルデータの作成
DO $$
DECLARE
    -- ユーザーIDは実際のauth.usersから取得
    admin_user_id UUID;
    staff_user_id UUID;
    member1_id UUID;
    member2_id UUID;
    member3_id UUID;
    company1_id UUID;
    company2_id UUID;
    branch1_id UUID;
    branch2_id UUID;
    facility1_id UUID;
    facility2_id UUID;
    facility3_id UUID;
    facility4_id UUID;
    point_system1_id UUID;
    point_system2_id UUID;
BEGIN
    -- 作成済みのユーザーIDを取得
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@fittracker.com';
    SELECT id INTO staff_user_id FROM auth.users WHERE email = 'staff@fittracker.com';
    SELECT id INTO member1_id FROM auth.users WHERE email = 'user1@example.com';
    SELECT id INTO member2_id FROM auth.users WHERE email = 'user2@example.com';
    SELECT id INTO member3_id FROM auth.users WHERE email = 'user3@example.com';

    -- ユーザーが存在しない場合の警告
    IF admin_user_id IS NULL OR staff_user_id IS NULL OR member1_id IS NULL OR member2_id IS NULL OR member3_id IS NULL THEN
        RAISE NOTICE 'Warning: Some test users are missing. Please run scripts/create-auth-users.sh first.';
    END IF;

    -- 会社データの作成
    INSERT INTO public.companies (id, name, code, logo_url, description, is_active)
    VALUES 
        (gen_random_uuid(), 'フィットネスワールド株式会社', 'FW001', 
         'https://example.com/logos/fw.png', 
         '全国展開の総合フィットネスチェーン', true)
    RETURNING id INTO company1_id;

    INSERT INTO public.companies (id, name, code, logo_url, description, is_active)
    VALUES 
        (gen_random_uuid(), 'ヘルシーライフ株式会社', 'HL001', 
         'https://example.com/logos/hl.png', 
         '健康と美容に特化したフィットネスクラブ', true)
    RETURNING id INTO company2_id;

    -- 支店データの作成
    INSERT INTO public.branches (id, company_id, name, code, address, phone, email, is_active)
    VALUES 
        (gen_random_uuid(), company1_id, '東京本店', 'FW-TOKYO-001', 
         '東京都渋谷区渋谷1-1-1', '03-1234-5678', 'tokyo@fitnessworld.jp', true)
    RETURNING id INTO branch1_id;

    INSERT INTO public.branches (id, company_id, name, code, address, phone, email, is_active)
    VALUES 
        (gen_random_uuid(), company1_id, '大阪支店', 'FW-OSAKA-001', 
         '大阪府大阪市北区梅田2-2-2', '06-1234-5678', 'osaka@fitnessworld.jp', true)
    RETURNING id INTO branch2_id;

    -- 施設データの作成
    INSERT INTO public.facilities (
        id, company_id, branch_id, name, code, facility_type, 
        address, phone, email, qr_code, opening_hours, features, is_active
    ) VALUES (
        gen_random_uuid(), company1_id, branch1_id, 
        'フィットネスワールド渋谷店', 'FW-SHIBUYA-001', 'gym',
        '東京都渋谷区渋谷1-1-1 FWビル1-3F', '03-1234-5678', 'shibuya@fitnessworld.jp',
        'QR-FW-SHIBUYA-001',
        '{"mon": "6:00-23:00", "tue": "6:00-23:00", "wed": "6:00-23:00", "thu": "6:00-23:00", "fri": "6:00-23:00", "sat": "8:00-21:00", "sun": "8:00-21:00"}',
        '{"pool": true, "sauna": true, "parking": true, "personal_training": true}',
        true
    ) RETURNING id INTO facility1_id;

    INSERT INTO public.facilities (
        id, company_id, branch_id, name, code, facility_type, 
        address, phone, email, qr_code, opening_hours, features, is_active
    ) VALUES (
        gen_random_uuid(), company1_id, branch2_id, 
        'フィットネスワールド梅田店', 'FW-UMEDA-001', 'gym',
        '大阪府大阪市北区梅田2-2-2 FWタワー5-7F', '06-1234-5678', 'umeda@fitnessworld.jp',
        'QR-FW-UMEDA-001',
        '{"mon": "6:00-23:00", "tue": "6:00-23:00", "wed": "6:00-23:00", "thu": "6:00-23:00", "fri": "6:00-23:00", "sat": "8:00-21:00", "sun": "8:00-21:00"}',
        '{"pool": false, "sauna": true, "parking": false, "personal_training": true}',
        true
    ) RETURNING id INTO facility2_id;

    INSERT INTO public.facilities (
        id, company_id, branch_id, name, code, facility_type, 
        address, phone, email, qr_code, opening_hours, features, is_active
    ) VALUES (
        gen_random_uuid(), company2_id, NULL, 
        'ヘルシーライフ青山スタジオ', 'HL-AOYAMA-001', 'yoga_studio',
        '東京都港区南青山3-3-3', '03-9876-5432', 'aoyama@healthylife.jp',
        'QR-HL-AOYAMA-001',
        '{"mon": "7:00-22:00", "tue": "7:00-22:00", "wed": "7:00-22:00", "thu": "7:00-22:00", "fri": "7:00-22:00", "sat": "8:00-20:00", "sun": "8:00-20:00"}',
        '{"yoga_room": 3, "shower_room": true, "locker": true, "cafe": true}',
        true
    ) RETURNING id INTO facility3_id;

    INSERT INTO public.facilities (
        id, company_id, branch_id, name, code, facility_type, 
        address, phone, email, qr_code, opening_hours, features, is_active
    ) VALUES (
        gen_random_uuid(), company2_id, NULL, 
        'ヘルシーライフ横浜プール', 'HL-YOKOHAMA-001', 'pool',
        '神奈川県横浜市西区みなとみらい4-4-4', '045-1234-5678', 'yokohama@healthylife.jp',
        'QR-HL-YOKOHAMA-001',
        '{"mon": "9:00-21:00", "tue": "9:00-21:00", "wed": "9:00-21:00", "thu": "9:00-21:00", "fri": "9:00-21:00", "sat": "9:00-20:00", "sun": "9:00-20:00"}',
        '{"pool_lanes": 8, "kids_pool": true, "jacuzzi": true, "sauna": true}',
        true
    ) RETURNING id INTO facility4_id;

    -- アクティビティタイプの作成
    -- ジム施設のアクティビティ
    INSERT INTO public.activity_types (
        facility_id, name, code, category, description, 
        duration_minutes, calories_per_hour, equipment_required, is_active
    ) VALUES 
        (facility1_id, '有酸素運動', 'CARDIO-001', 'training', 
         'ランニングマシン、エアロバイクなどを使った有酸素運動', 
         30, 400, '{"treadmill": true, "bike": true, "elliptical": true}', true),
        (facility1_id, 'ウェイトトレーニング', 'WEIGHT-001', 'training', 
         'フリーウェイトやマシンを使った筋力トレーニング', 
         45, 300, '{"dumbbells": true, "barbell": true, "machines": true}', true),
        (facility1_id, 'パーソナルトレーニング', 'PT-001', 'training', 
         'トレーナーとのマンツーマントレーニング', 
         60, 500, '{"trainer": true}', true);

    -- ヨガスタジオのアクティビティ
    INSERT INTO public.activity_types (
        facility_id, name, code, category, description, 
        duration_minutes, calories_per_hour, equipment_required, is_active
    ) VALUES 
        (facility3_id, 'ハタヨガ', 'YOGA-001', 'yoga', 
         '基本的なヨガポーズを中心とした初心者向けクラス', 
         60, 200, '{"yoga_mat": true}', true),
        (facility3_id, 'パワーヨガ', 'YOGA-002', 'yoga', 
         '運動量の多いダイナミックなヨガクラス', 
         75, 350, '{"yoga_mat": true, "blocks": true}', true),
        (facility3_id, 'ホットヨガ', 'YOGA-003', 'yoga', 
         '温かい環境で行うデトックス効果の高いヨガ', 
         60, 400, '{"yoga_mat": true, "towel": true}', true);

    -- プール施設のアクティビティ
    INSERT INTO public.activity_types (
        facility_id, name, code, category, description, 
        duration_minutes, calories_per_hour, equipment_required, is_active
    ) VALUES 
        (facility4_id, '自由遊泳', 'SWIM-001', 'swimming', 
         'プールでの自由な水泳', 
         NULL, 500, '{"swimsuit": true}', true),
        (facility4_id, 'アクアビクス', 'SWIM-002', 'swimming', 
         '水中で行うエアロビクスクラス', 
         45, 400, '{"swimsuit": true}', true),
        (facility4_id, '水泳教室', 'SWIM-003', 'swimming', 
         'インストラクターによる水泳指導', 
         60, 450, '{"swimsuit": true, "cap": true}', true);

    -- ポイントシステムの設定
    INSERT INTO public.point_systems (
        id, company_id, name, point_unit, conversion_rate, 
        expiration_months, rules, is_active
    ) VALUES (
        gen_random_uuid(), company1_id, 
        'FWポイントプログラム', 'FWポイント', 1.0, 
        12, '{"min_points_to_use": 100, "point_usage_unit": 100}', true
    ) RETURNING id INTO point_system1_id;

    INSERT INTO public.point_systems (
        id, company_id, name, point_unit, conversion_rate, 
        expiration_months, rules, is_active
    ) VALUES (
        gen_random_uuid(), company2_id, 
        'ヘルシーマイル', 'マイル', 2.0, 
        24, '{"min_points_to_use": 500, "point_usage_unit": 100}', true
    ) RETURNING id INTO point_system2_id;

    -- ポイントルールの設定
    -- フィットネスワールドのポイントルール
    INSERT INTO public.point_rules (
        point_system_id, activity_category, points_per_session, 
        points_per_minute, bonus_conditions, is_active
    ) VALUES 
        (point_system1_id, 'training', 50, 1.0, 
         '{"consecutive_days": {"3": 50, "7": 200}, "monthly_visits": {"10": 500, "20": 1500}}', true),
        (point_system1_id, 'swimming', 40, 0.8, 
         '{"duration_bonus": {"60": 100, "120": 300}}', true);

    -- ヘルシーライフのポイントルール
    INSERT INTO public.point_rules (
        point_system_id, activity_category, points_per_session, 
        points_per_minute, bonus_conditions, is_active
    ) VALUES 
        (point_system2_id, 'yoga', 100, 2.0, 
         '{"class_completion": 50, "perfect_attendance_week": 500}', true),
        (point_system2_id, 'swimming', 80, 1.5, 
         '{"distance_km": {"1": 50, "3": 200, "5": 500}}', true);

    -- ユーザーが存在する場合のみ、関連データを作成
    IF admin_user_id IS NOT NULL AND staff_user_id IS NOT NULL THEN
        -- 会社ユーザー（スタッフ）の登録
        INSERT INTO public.company_users (
            user_id, company_id, role, permissions, branch_id, is_active
        ) VALUES 
            (admin_user_id, company1_id, 'admin', 
             '{"all": true}', NULL, true),
            (staff_user_id, company1_id, 'staff', 
             '{"check_in": true, "view_reports": false}', branch1_id, true);
    END IF;

    -- メンバーが存在する場合のみ、メンバーシップとアクティビティを作成
    IF member1_id IS NOT NULL THEN
        INSERT INTO public.user_memberships (
            user_id, company_id, membership_number, membership_type, 
            start_date, end_date, is_active
        ) VALUES 
            (member1_id, company1_id, 'FW-2024-0001', 'premium', 
             '2024-01-01', '2024-12-31', true);

        -- アクティビティログのサンプルデータ
        INSERT INTO public.activity_logs (
            user_id, company_id, facility_id, activity_type_id, 
            check_in_time, check_out_time, duration_minutes, 
            calories_burned, distance_km, notes, data
        ) 
        SELECT 
            member1_id,
            company1_id,
            facility1_id,
            (SELECT id FROM public.activity_types WHERE facility_id = facility1_id AND code = 'CARDIO-001'),
            NOW() - INTERVAL '30 days' + (day_offset || ' days')::INTERVAL + '10:00:00'::TIME,
            NOW() - INTERVAL '30 days' + (day_offset || ' days')::INTERVAL + '11:00:00'::TIME,
            60,
            400,
            5.5,
            'ランニングマシンで5.5km走行',
            '{"speed_avg": 5.5, "incline": 2, "heart_rate_avg": 145}'
        FROM generate_series(0, 29, 3) AS day_offset;

        -- 初期ポイントの付与
        INSERT INTO public.user_points (user_id, company_id, current_points, total_earned, total_used)
        VALUES (member1_id, company1_id, 1500, 2000, 500);

        -- ポイント履歴のサンプル
        INSERT INTO public.point_transactions (
            user_id, company_id, transaction_type, amount, 
            balance_after, description, expires_at
        ) VALUES 
            (member1_id, company1_id, 'earn', 500, 500, 
             '新規入会ボーナス', NOW() + INTERVAL '12 months'),
            (member1_id, company1_id, 'earn', 1500, 2000, 
             '月間利用ボーナス', NOW() + INTERVAL '12 months'),
            (member1_id, company1_id, 'use', -500, 1500, 
             'プロテイン購入', NULL);

        -- 体測定記録のサンプル
        INSERT INTO public.measurements (
            user_id, company_id, facility_id, measurement_date, 
            weight, body_fat_percentage, muscle_mass, bmi, 
            measurements, notes
        ) VALUES 
            (member1_id, company1_id, facility1_id, CURRENT_DATE - INTERVAL '3 months',
             75.5, 18.5, 58.2, 23.4,
             '{"chest": 98, "waist": 82, "hip": 96}',
             '初回測定'),
            (member1_id, company1_id, facility1_id, CURRENT_DATE - INTERVAL '1 month',
             73.2, 16.8, 59.1, 22.7,
             '{"chest": 96, "waist": 78, "hip": 94}',
             '順調に減量中'),
            (member1_id, company1_id, facility1_id, CURRENT_DATE,
             72.0, 15.5, 60.0, 22.3,
             '{"chest": 95, "waist": 76, "hip": 93}',
             '目標達成間近！');
    END IF;

    IF member2_id IS NOT NULL THEN
        INSERT INTO public.user_memberships (
            user_id, company_id, membership_number, membership_type, 
            start_date, end_date, is_active
        ) VALUES 
            (member2_id, company1_id, 'FW-2024-0002', 'regular', 
             '2024-02-15', '2025-02-14', true),
            (member2_id, company2_id, 'HL-2024-0002', 'regular', 
             '2024-03-01', '2025-02-28', true);

        -- member2のヨガ活動
        INSERT INTO public.activity_logs (
            user_id, company_id, facility_id, activity_type_id, 
            check_in_time, check_out_time, duration_minutes, 
            calories_burned, notes, data
        ) 
        SELECT 
            member2_id,
            company2_id,
            facility3_id,
            (SELECT id FROM public.activity_types WHERE facility_id = facility3_id AND code = 'YOGA-001'),
            NOW() - INTERVAL '30 days' + (day_offset || ' days')::INTERVAL + '19:00:00'::TIME,
            NOW() - INTERVAL '30 days' + (day_offset || ' days')::INTERVAL + '20:00:00'::TIME,
            60,
            200,
            'ハタヨガクラス参加',
            '{"class_name": "初級ハタヨガ", "instructor": "田中先生"}'
        FROM generate_series(1, 29, 2) AS day_offset;

        INSERT INTO public.user_points (user_id, company_id, current_points, total_earned, total_used)
        VALUES 
            (member2_id, company1_id, 800, 800, 0),
            (member2_id, company2_id, 3000, 3000, 0);
    END IF;

    IF member3_id IS NOT NULL THEN
        INSERT INTO public.user_memberships (
            user_id, company_id, membership_number, membership_type, 
            start_date, end_date, is_active
        ) VALUES 
            (member3_id, company2_id, 'HL-2024-0001', 'vip', 
             '2024-01-01', NULL, true);

        INSERT INTO public.user_points (user_id, company_id, current_points, total_earned, total_used)
        VALUES (member3_id, company2_id, 5000, 5000, 0);
    END IF;

END $$;

-- 実行確認用のデータ件数表示
SELECT 'Companies' as table_name, COUNT(*) as count FROM public.companies
UNION ALL
SELECT 'Branches', COUNT(*) FROM public.branches
UNION ALL
SELECT 'Facilities', COUNT(*) FROM public.facilities
UNION ALL
SELECT 'Activity Types', COUNT(*) FROM public.activity_types
UNION ALL
SELECT 'Users (auth)', COUNT(*) FROM auth.users
UNION ALL
SELECT 'User Profiles', COUNT(*) FROM public.user_profiles
UNION ALL
SELECT 'User Memberships', COUNT(*) FROM public.user_memberships
UNION ALL
SELECT 'Company Users', COUNT(*) FROM public.company_users
UNION ALL
SELECT 'Point Systems', COUNT(*) FROM public.point_systems
UNION ALL
SELECT 'Point Rules', COUNT(*) FROM public.point_rules
UNION ALL
SELECT 'User Points', COUNT(*) FROM public.user_points
UNION ALL
SELECT 'Activity Logs', COUNT(*) FROM public.activity_logs
UNION ALL
SELECT 'Point Transactions', COUNT(*) FROM public.point_transactions
UNION ALL
SELECT 'Measurements', COUNT(*) FROM public.measurements
ORDER BY table_name;

-- テストユーザー情報の表示
SELECT 
    '=== テストユーザーアカウント ===' as info
UNION ALL
SELECT 
    'Email: ' || email || ' / Password: ' || 
    CASE 
        WHEN email = 'admin@fittracker.com' THEN 'Admin123!'
        WHEN email = 'staff@fittracker.com' THEN 'Staff123!'
        ELSE 'User123!'
    END || ' / Name: ' || COALESCE(raw_user_meta_data->>'name', email)
FROM auth.users 
WHERE email IN (
    'admin@fittracker.com',
    'staff@fittracker.com',
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
)
ORDER BY 
    CASE 
        WHEN info LIKE '===%' THEN 0
        WHEN info LIKE '%admin@%' THEN 1
        WHEN info LIKE '%staff@%' THEN 2
        WHEN info LIKE '%user1@%' THEN 3
        WHEN info LIKE '%user2@%' THEN 4
        WHEN info LIKE '%user3@%' THEN 5
        ELSE 6
    END;