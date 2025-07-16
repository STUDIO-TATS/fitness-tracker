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

-- RLS (Row Level Security) ポリシーについて:
-- 施設データへのアクセスを許可するため、以下のテーブルにRLSポリシーが適用されています:
-- - facilities: 施設情報
-- - companies: 会社情報  
-- - branches: 支店情報
-- - activity_types: アクティビティタイプ情報
-- これらのポリシーはmigrationファイル（add_facilities_rls_policies.sql）で定義されています。
-- 
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
    company3_id UUID;
    branch1_id UUID;
    branch2_id UUID;
    branch3_id UUID;
    facility1_id UUID;
    facility2_id UUID;
    facility3_id UUID;
    facility4_id UUID;
    facility5_id UUID;
    facility6_id UUID;
    facility7_id UUID;
    point_system1_id UUID;
    point_system2_id UUID;
    point_system3_id UUID;
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

    INSERT INTO public.companies (id, name, code, logo_url, description, is_active)
    VALUES 
        (gen_random_uuid(), 'シンコースポーツ株式会社', 'SS001', 
         'https://example.com/logos/ss.png', 
         'あきる野市を中心とした地域密着型総合スポーツ施設運営会社', true)
    RETURNING id INTO company3_id;

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

    INSERT INTO public.branches (id, company_id, name, code, address, phone, email, is_active)
    VALUES 
        (gen_random_uuid(), company3_id, 'あきる野支店', 'SS-AKIRUNO-001', 
         '東京都あきる野市秋川1-8-1', '042-558-1111', 'akiruno@shinko-sports.co.jp', true)
    RETURNING id INTO branch3_id;

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

    -- シンコースポーツの施設データ
    INSERT INTO public.facilities (
        id, company_id, branch_id, name, code, facility_type, 
        address, phone, email, qr_code, opening_hours, features, is_active
    ) VALUES (
        gen_random_uuid(), company3_id, branch3_id, 
        '秋川体育館', 'SS-AKIGAWA-001', 'gym',
        '東京都あきる野市二宮350', '042-558-1111', 'akigawa@shinko-sports.co.jp',
        'QR-SS-AKIGAWA-001',
        '{"mon": "9:00-21:00", "tue": "9:00-21:00", "wed": "9:00-21:00", "thu": "9:00-21:00", "fri": "9:00-21:00", "sat": "9:00-21:00", "sun": "9:00-21:00"}',
        '{"gym": true, "basketball": true, "badminton": true, "volleyball": true, "parking": true, "shower": true}',
        true
    ) RETURNING id INTO facility5_id;

    INSERT INTO public.facilities (
        id, company_id, branch_id, name, code, facility_type, 
        address, phone, email, qr_code, opening_hours, features, is_active
    ) VALUES (
        gen_random_uuid(), company3_id, branch3_id, 
        'あきる野市民プール', 'SS-AKIRUNO-POOL-001', 'pool',
        '東京都あきる野市二宮350', '042-558-1212', 'pool@shinko-sports.co.jp',
        'QR-SS-AKIRUNO-POOL-001',
        '{"mon": "10:00-21:00", "tue": "10:00-21:00", "wed": "10:00-21:00", "thu": "10:00-21:00", "fri": "10:00-21:00", "sat": "10:00-21:00", "sun": "10:00-21:00"}',
        '{"pool_lanes": 6, "kids_pool": true, "jacuzzi": false, "sauna": true, "parking": true, "wheelchair_accessible": true}',
        true
    ) RETURNING id INTO facility6_id;

    INSERT INTO public.facilities (
        id, company_id, branch_id, name, code, facility_type, 
        address, phone, email, qr_code, opening_hours, features, is_active
    ) VALUES (
        gen_random_uuid(), company3_id, branch3_id, 
        '五日市ファインプラザ', 'SS-ITSUKAICHI-001', 'gym',
        '東京都あきる野市五日市411', '042-596-5611', 'itsukaichi@shinko-sports.co.jp',
        'QR-SS-ITSUKAICHI-001',
        '{"mon": "9:00-21:00", "tue": "9:00-21:00", "wed": "closed", "thu": "9:00-21:00", "fri": "9:00-21:00", "sat": "9:00-21:00", "sun": "9:00-21:00"}',
        '{"gym": true, "studio": true, "conference_room": true, "parking": true, "cafe": true, "wheelchair_accessible": true}',
        true
    ) RETURNING id INTO facility7_id;

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

    -- シンコースポーツ施設のアクティビティ
    -- 秋川体育館のアクティビティ
    INSERT INTO public.activity_types (
        facility_id, name, code, category, description, 
        duration_minutes, calories_per_hour, equipment_required, is_active
    ) VALUES 
        (facility5_id, 'バスケットボール', 'BASKET-001', 'sports', 
         'バスケットボールコートでのゲームや練習', 
         90, 600, '{"basketball": true, "sneakers": true}', true),
        (facility5_id, 'バドミントン', 'BADMIN-001', 'sports', 
         'バドミントンコートでのゲームや練習', 
         60, 450, '{"racket": true, "shuttlecock": true, "indoor_shoes": true}', true),
        (facility5_id, 'バレーボール', 'VOLLEY-001', 'sports', 
         'バレーボールコートでのゲームや練習', 
         90, 360, '{"volleyball": true, "indoor_shoes": true}', true),
        (facility5_id, 'フィットネス', 'FITNESS-001', 'training', 
         'トレーニングジムでの筋力トレーニング', 
         60, 400, '{"gym_wear": true, "towel": true}', true);

    -- あきる野市民プールのアクティビティ
    INSERT INTO public.activity_types (
        facility_id, name, code, category, description, 
        duration_minutes, calories_per_hour, equipment_required, is_active
    ) VALUES 
        (facility6_id, '一般遊泳', 'SWIM-GENERAL-001', 'swimming', 
         '一般利用者向けの自由遊泳', 
         NULL, 400, '{"swimsuit": true, "cap": true}', true),
        (facility6_id, '競泳練習', 'SWIM-COMP-001', 'swimming', 
         '競泳選手向けの本格的な練習', 
         120, 600, '{"swimsuit": true, "cap": true, "goggles": true}', true),
        (facility6_id, '水中ウォーキング', 'AQUA-WALK-001', 'swimming', 
         '膝や腰に優しい水中ウォーキング', 
         45, 300, '{"swimsuit": true, "aqua_shoes": true}', true);

    -- 五日市ファインプラザのアクティビティ
    INSERT INTO public.activity_types (
        facility_id, name, code, category, description, 
        duration_minutes, calories_per_hour, equipment_required, is_active
    ) VALUES 
        (facility7_id, 'エアロビクス', 'AEROBICS-001', 'fitness', 
         'スタジオでのエアロビクスクラス', 
         60, 500, '{"gym_wear": true, "indoor_shoes": true}', true),
        (facility7_id, 'ダンス', 'DANCE-001', 'fitness', 
         'スタジオでのダンスレッスン', 
         60, 400, '{"gym_wear": true, "dance_shoes": true}', true),
        (facility7_id, 'フィットネス', 'FITNESS-002', 'training', 
         'ジムエリアでのフィットネストレーニング', 
         60, 450, '{"gym_wear": true, "towel": true}', true);

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

    INSERT INTO public.point_systems (
        id, company_id, name, point_unit, conversion_rate, 
        expiration_months, rules, is_active
    ) VALUES (
        gen_random_uuid(), company3_id, 
        'シンコーポイント', 'シンコP', 1.0, 
        12, '{"min_points_to_use": 50, "point_usage_unit": 50}', true
    ) RETURNING id INTO point_system3_id;

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

    -- シンコースポーツのポイントルール
    INSERT INTO public.point_rules (
        point_system_id, activity_category, points_per_session, 
        points_per_minute, bonus_conditions, is_active
    ) VALUES 
        (point_system3_id, 'sports', 30, 0.5, 
         '{"team_play": 20, "tournament": 100}', true),
        (point_system3_id, 'swimming', 25, 0.6, 
         '{"lap_bonus": {"50": 25, "100": 75}}', true),
        (point_system3_id, 'training', 20, 0.4, 
         '{"regular_visit": {"weekly": 50, "monthly": 200}}', true),
        (point_system3_id, 'fitness', 35, 0.8, 
         '{"class_attendance": 15, "perfect_month": 300}', true);

    -- ユーザーが存在する場合のみ、関連データを作成
    IF admin_user_id IS NOT NULL THEN
        -- ユーザープロファイルの作成
        INSERT INTO public.user_profiles (
            id, username, full_name, avatar_url, 
            date_of_birth, gender, phone_number, 
            emergency_contact, medical_notes, preferences
        ) VALUES (
            admin_user_id, 
            'admin', 
            'システム管理者', 
            'https://example.com/avatars/admin.jpg',
            '1980-01-01', 
            'other', 
            '090-1234-5678',
            '{"name": "緊急連絡先", "phone": "090-8765-4321", "relationship": "配偶者"}',
            '特になし',
            '{"language": "ja", "notifications": {"email": true, "push": true}}'
        );

        -- 会社ユーザー（管理者）の登録
        INSERT INTO public.company_users (
            user_id, company_id, role, permissions, branch_id, is_active
        ) VALUES (
            admin_user_id, company1_id, 'admin', 
            '{"all": true}', NULL, true
        );
    END IF;

    IF staff_user_id IS NOT NULL THEN
        -- スタッフプロファイルの作成
        INSERT INTO public.user_profiles (
            id, username, full_name, avatar_url, 
            date_of_birth, gender, phone_number, 
            emergency_contact, medical_notes, preferences
        ) VALUES (
            staff_user_id, 
            'staff_taro', 
            'スタッフ太郎', 
            'https://example.com/avatars/staff1.jpg',
            '1990-05-15', 
            'male', 
            '090-2345-6789',
            '{"name": "スタッフ母", "phone": "090-3456-7890", "relationship": "母"}',
            'アレルギー：なし',
            '{"language": "ja", "notifications": {"email": true, "push": false}}'
        );

        -- 会社ユーザー（スタッフ）の登録
        INSERT INTO public.company_users (
            user_id, company_id, role, permissions, branch_id, is_active
        ) VALUES (
            staff_user_id, company1_id, 'staff', 
            '{"check_in": true, "view_reports": false}', branch1_id, true
        );
    END IF;

    -- メンバーが存在する場合のみ、メンバーシップとアクティビティを作成
    IF member1_id IS NOT NULL THEN
        -- member1のプロファイル
        INSERT INTO public.user_profiles (
            id, username, full_name, avatar_url, 
            date_of_birth, gender, phone_number, 
            emergency_contact, medical_notes, preferences
        ) VALUES (
            member1_id, 
            'tanaka_taro', 
            '田中太郎', 
            'https://example.com/avatars/member1.jpg',
            '1995-03-20', 
            'male', 
            '090-3456-7890',
            '{"name": "田中母", "phone": "090-4567-8901", "relationship": "母"}',
            '腰痛持ち、激しい運動は要注意',
            '{"language": "ja", "notifications": {"email": true, "push": true}, "preferred_time": "morning"}'
        );

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
        -- member2のプロファイル
        INSERT INTO public.user_profiles (
            id, username, full_name, avatar_url, 
            date_of_birth, gender, phone_number, 
            emergency_contact, medical_notes, preferences
        ) VALUES (
            member2_id, 
            'suzuki_hanako', 
            '鈴木花子', 
            'https://example.com/avatars/member2.jpg',
            '1988-07-10', 
            'female', 
            '090-4567-8901',
            '{"name": "鈴木夫", "phone": "090-5678-9012", "relationship": "夫"}',
            'ヨガ推奨、膝に古傷あり',
            '{"language": "ja", "notifications": {"email": false, "push": true}, "preferred_time": "evening"}'
        );

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

        -- member2のポイント履歴
        INSERT INTO public.point_transactions (
            user_id, company_id, transaction_type, amount, 
            balance_after, description, expires_at
        ) VALUES 
            (member2_id, company1_id, 'earn', 800, 800, 
             '入会キャンペーンボーナス', NOW() + INTERVAL '12 months'),
            (member2_id, company2_id, 'earn', 2000, 2000, 
             'ヨガクラス10回達成', NOW() + INTERVAL '24 months'),
            (member2_id, company2_id, 'earn', 1000, 3000, 
             '友人紹介ボーナス', NOW() + INTERVAL '24 months');

        -- member2の体測定記録
        INSERT INTO public.measurements (
            user_id, company_id, facility_id, measurement_date, 
            weight, body_fat_percentage, muscle_mass, bmi, 
            measurements, notes
        ) VALUES 
            (member2_id, company2_id, facility3_id, CURRENT_DATE - INTERVAL '6 months',
             58.5, 28.0, 39.5, 22.8,
             '{"chest": 86, "waist": 72, "hip": 96}',
             'ヨガ開始前の記録'),
            (member2_id, company2_id, facility3_id, CURRENT_DATE - INTERVAL '3 months',
             56.0, 25.5, 40.0, 21.9,
             '{"chest": 84, "waist": 69, "hip": 94}',
             '柔軟性向上、体重減少'),
            (member2_id, company2_id, facility3_id, CURRENT_DATE,
             54.5, 23.0, 40.5, 21.3,
             '{"chest": 83, "waist": 66, "hip": 92}',
             '理想的な体型に近づいている');
    END IF;

    IF member3_id IS NOT NULL THEN
        -- member3のプロファイル
        INSERT INTO public.user_profiles (
            id, username, full_name, avatar_url, 
            date_of_birth, gender, phone_number, 
            emergency_contact, medical_notes, preferences
        ) VALUES (
            member3_id, 
            'sato_jiro', 
            '佐藤次郎', 
            'https://example.com/avatars/member3.jpg',
            '1992-11-25', 
            'male', 
            '090-5678-9012',
            '{"name": "佐藤父", "phone": "090-6789-0123", "relationship": "父"}',
            '特になし、健康体',
            '{"language": "ja", "notifications": {"email": true, "push": true}, "preferred_time": "anytime"}'
        );

        INSERT INTO public.user_memberships (
            user_id, company_id, membership_number, membership_type, 
            start_date, end_date, is_active
        ) VALUES 
            (member3_id, company2_id, 'HL-2024-0001', 'vip', 
             '2024-01-01', NULL, true);

        INSERT INTO public.user_points (user_id, company_id, current_points, total_earned, total_used)
        VALUES (member3_id, company2_id, 5000, 5000, 0);

        -- member3の水泳活動ログ
        INSERT INTO public.activity_logs (
            user_id, company_id, facility_id, activity_type_id, 
            check_in_time, check_out_time, duration_minutes, 
            calories_burned, distance_km, notes, data
        ) 
        SELECT 
            member3_id,
            company2_id,
            facility4_id,
            (SELECT id FROM public.activity_types WHERE facility_id = facility4_id AND code = 'SWIM-001'),
            NOW() - INTERVAL '30 days' + (day_offset || ' days')::INTERVAL + '06:30:00'::TIME,
            NOW() - INTERVAL '30 days' + (day_offset || ' days')::INTERVAL + '08:00:00'::TIME,
            90,
            750,
            3.0,
            '朝スイム3km',
            '{"style": "freestyle", "laps": 120, "pool_length": 25}'
        FROM generate_series(0, 29, 1) AS day_offset
        WHERE EXTRACT(DOW FROM NOW() - INTERVAL '30 days' + (day_offset || ' days')::INTERVAL) NOT IN (0, 6);

        -- member3のポイント履歴
        INSERT INTO public.point_transactions (
            user_id, company_id, transaction_type, amount, 
            balance_after, description, expires_at, 
            activity_log_id
        ) VALUES 
            (member3_id, company2_id, 'earn', 5000, 5000, 
             'VIP会員登録ボーナス', NOW() + INTERVAL '24 months', NULL);

        -- member3の測定記録
        INSERT INTO public.measurements (
            user_id, company_id, facility_id, measurement_date, 
            weight, body_fat_percentage, muscle_mass, bmi, 
            measurements, notes
        ) VALUES 
            (member3_id, company2_id, facility4_id, CURRENT_DATE - INTERVAL '2 months',
             68.0, 12.5, 55.0, 21.0,
             '{"chest": 92, "waist": 75, "hip": 90}',
             'トレーニング開始時'),
            (member3_id, company2_id, facility4_id, CURRENT_DATE,
             70.0, 11.0, 57.5, 21.6,
             '{"chest": 94, "waist": 74, "hip": 91}',
             '筋肉量増加、順調');
    END IF;

END $$;

-- 実行確認用のデータ件数表示
SELECT * FROM (
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
) t
ORDER BY table_name;

-- テストユーザー情報の表示
SELECT * FROM (
    SELECT 
        0 as sort_order,
        '=== テストユーザーアカウント ===' as info
    UNION ALL
    SELECT 
        CASE 
            WHEN email = 'admin@fittracker.com' THEN 1
            WHEN email = 'staff@fittracker.com' THEN 2
            WHEN email = 'user1@example.com' THEN 3
            WHEN email = 'user2@example.com' THEN 4
            WHEN email = 'user3@example.com' THEN 5
            ELSE 6
        END as sort_order,
        'Email: ' || email || ' / Password: testpass123 / Name: ' || COALESCE(raw_user_meta_data->>'name', email) as info
    FROM auth.users 
    WHERE email IN (
        'admin@fittracker.com',
        'staff@fittracker.com',
        'user1@example.com',
        'user2@example.com',
        'user3@example.com'
    )
) user_info
ORDER BY sort_order;