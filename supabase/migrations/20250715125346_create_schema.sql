-- マルチテナント対応フィットネス施設管理システム
-- 会社ごとのポイントシステム、支店は任意

-- 会社マスタ
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- 会社コード
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 支店マスタ（任意）
CREATE TABLE public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, code)
);

-- 施設マスタ
CREATE TABLE public.facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL, -- 支店は任意
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    facility_type VARCHAR(50) NOT NULL, -- gym, pool, yoga_studio, exercise_studio, etc
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    qr_code VARCHAR(255) UNIQUE NOT NULL, -- QRコード用のユニークID
    opening_hours JSONB, -- 営業時間
    features JSONB, -- 施設の特徴
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, code)
);

-- アクティビティタイプマスタ（各施設で利用可能なアクティビティ）
CREATE TABLE public.activity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL, -- training, swimming, yoga, dance, etc
    description TEXT,
    duration_minutes INTEGER, -- 標準的な所要時間
    calories_per_hour INTEGER, -- 時間あたりの消費カロリー目安
    equipment_required JSONB, -- 必要な器具
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(facility_id, code)
);

-- ユーザープロファイル（会社横断）
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    phone VARCHAR(50),
    emergency_contact JSONB,
    preferences JSONB, -- ユーザー設定
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 会社ユーザー（従業員・管理者）
CREATE TABLE public.company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'staff', -- admin, manager, staff, viewer
    permissions JSONB, -- 詳細な権限設定
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL, -- 特定支店に限定する場合
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- ユーザーと会社の関連（メンバーシップ）
CREATE TABLE public.user_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    membership_number VARCHAR(100) NOT NULL,
    membership_type VARCHAR(50) NOT NULL, -- regular, premium, vip, etc
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, membership_number),
    UNIQUE(user_id, company_id)
);

-- 会社ごとのポイントシステム設定
CREATE TABLE public.point_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    point_unit VARCHAR(50) NOT NULL, -- ポイント, コイン, etc
    conversion_rate DECIMAL(10, 4) DEFAULT 1.0, -- 1円 = Xポイント
    expiration_months INTEGER, -- ポイント有効期限（月）
    rules JSONB, -- ポイント付与ルール
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id)
);

-- ポイント付与ルール
CREATE TABLE public.point_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    point_system_id UUID NOT NULL REFERENCES public.point_systems(id) ON DELETE CASCADE,
    activity_category VARCHAR(50), -- アクティビティカテゴリ
    points_per_session INTEGER, -- セッションごとのポイント
    points_per_minute DECIMAL(10, 2), -- 分あたりのポイント
    bonus_conditions JSONB, -- ボーナス条件
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ユーザーのポイント残高
CREATE TABLE public.user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    current_points DECIMAL(15, 2) DEFAULT 0,
    total_earned DECIMAL(15, 2) DEFAULT 0,
    total_used DECIMAL(15, 2) DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- アクティビティログ（施設利用記録）
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL, -- 集計用：外部キーは後で追加
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    activity_type_id UUID REFERENCES public.activity_types(id) ON DELETE SET NULL,
    check_in_time TIMESTAMPTZ NOT NULL,
    check_out_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    calories_burned INTEGER,
    distance_km DECIMAL(10, 2),
    notes TEXT,
    data JSONB, -- アクティビティ固有のデータ
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ポイント履歴
CREATE TABLE public.point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earn', 'use', 'expire', 'adjust')),
    amount DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    activity_log_id UUID REFERENCES public.activity_logs(id) ON DELETE SET NULL,
    description TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 体測定記録（会社横断で管理）
CREATE TABLE public.measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID, -- 集計用：どの会社の施設で測定したか
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL, -- どの施設で測定したか
    measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight DECIMAL(5, 2),
    body_fat_percentage DECIMAL(5, 2),
    muscle_mass DECIMAL(5, 2),
    bmi DECIMAL(5, 2),
    measurements JSONB, -- その他の測定値
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 外部キー制約を追加
ALTER TABLE public.activity_logs ADD CONSTRAINT fk_activity_logs_company_id 
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.measurements ADD CONSTRAINT fk_measurements_company_id 
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

-- Policies
-- ユーザーは自分のプロファイルを管理できる
CREATE POLICY "Users can manage own profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- ユーザーは自分のメンバーシップを参照できる
CREATE POLICY "Users can view own memberships" ON public.user_memberships
    FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のアクティビティログを管理できる
CREATE POLICY "Users can manage own activity logs" ON public.activity_logs
    FOR ALL USING (auth.uid() = user_id);

-- ユーザーは自分のポイント情報を参照できる
CREATE POLICY "Users can view own points" ON public.user_points
    FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のポイント履歴を参照できる
CREATE POLICY "Users can view own point transactions" ON public.point_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の測定記録を管理できる
CREATE POLICY "Users can manage own measurements" ON public.measurements
    FOR ALL USING (auth.uid() = user_id);

-- 会社ユーザーは自分が所属する会社の情報を参照できる
CREATE POLICY "Company users can view own company data" ON public.company_users
    FOR SELECT USING (auth.uid() = user_id);

-- 会社管理者は所属会社のデータにアクセス可能
CREATE POLICY "Company admins can view company activity logs" ON public.activity_logs
    FOR SELECT USING (
        company_id IN (
            SELECT cu.company_id 
            FROM public.company_users cu 
            WHERE cu.user_id = auth.uid() 
            AND cu.is_active = true 
            AND cu.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Company admins can view company point transactions" ON public.point_transactions
    FOR SELECT USING (
        company_id IN (
            SELECT cu.company_id 
            FROM public.company_users cu 
            WHERE cu.user_id = auth.uid() 
            AND cu.is_active = true 
            AND cu.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Company admins can view company measurements" ON public.measurements
    FOR SELECT USING (
        company_id IN (
            SELECT cu.company_id 
            FROM public.company_users cu 
            WHERE cu.user_id = auth.uid() 
            AND cu.is_active = true 
            AND cu.role IN ('admin', 'manager')
        )
    );

-- 公開情報は誰でも参照可能
CREATE POLICY "Anyone can view active companies" ON public.companies
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active facilities" ON public.facilities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active activity types" ON public.activity_types
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active branches" ON public.branches
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active point systems" ON public.point_systems
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active point rules" ON public.point_rules
    FOR SELECT USING (is_active = true);

-- インデックス
CREATE INDEX idx_facilities_qr_code ON public.facilities(qr_code);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_facility_id ON public.activity_logs(facility_id);
CREATE INDEX idx_activity_logs_check_in_time ON public.activity_logs(check_in_time);
CREATE INDEX idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON public.point_transactions(created_at);
CREATE INDEX idx_measurements_user_id_date ON public.measurements(user_id, measurement_date);
CREATE INDEX idx_user_memberships_user_company ON public.user_memberships(user_id, company_id);
CREATE INDEX idx_facilities_company_id ON public.facilities(company_id);
CREATE INDEX idx_activity_types_facility_id ON public.activity_types(facility_id);

-- トリガー関数：更新日時の自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- 各テーブルに更新日時自動更新トリガーを設定
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_types_updated_at BEFORE UPDATE ON public.activity_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_memberships_updated_at BEFORE UPDATE ON public.user_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_point_systems_updated_at BEFORE UPDATE ON public.point_systems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_logs_updated_at BEFORE UPDATE ON public.activity_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON public.user_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_measurements_updated_at BEFORE UPDATE ON public.measurements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- QRコードから施設情報を取得する関数
CREATE OR REPLACE FUNCTION public.get_facility_by_qr_code(qr_code_input TEXT)
RETURNS TABLE (
    facility_id UUID,
    facility_name TEXT,
    company_name TEXT,
    branch_name TEXT,
    facility_type TEXT,
    available_activities JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.name,
        c.name,
        b.name,
        f.facility_type,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', at.id,
                    'name', at.name,
                    'category', at.category,
                    'description', at.description,
                    'duration_minutes', at.duration_minutes,
                    'calories_per_hour', at.calories_per_hour
                )
                ORDER BY at.name
            ) FILTER (WHERE at.id IS NOT NULL),
            '[]'::jsonb
        ) as available_activities
    FROM public.facilities f
    JOIN public.companies c ON f.company_id = c.id
    LEFT JOIN public.branches b ON f.branch_id = b.id
    LEFT JOIN public.activity_types at ON f.id = at.facility_id AND at.is_active = true
    WHERE f.qr_code = qr_code_input AND f.is_active = true AND c.is_active = true
    GROUP BY f.id, f.name, c.name, b.name, f.facility_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ポイント計算・付与関数
CREATE OR REPLACE FUNCTION public.calculate_and_award_points(
    user_id_input UUID,
    activity_log_id_input UUID
)
RETURNS DECIMAL AS $$
DECLARE
    log_record RECORD;
    company_id_var UUID;
    point_rule RECORD;
    points_earned DECIMAL := 0;
    expiration_date TIMESTAMPTZ;
    current_balance DECIMAL;
BEGIN
    -- アクティビティログから情報を取得
    SELECT al.*, f.company_id, at.category 
    INTO log_record
    FROM public.activity_logs al
    JOIN public.facilities f ON al.facility_id = f.id
    LEFT JOIN public.activity_types at ON al.activity_type_id = at.id
    WHERE al.id = activity_log_id_input AND al.user_id = user_id_input;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    company_id_var := log_record.company_id;
    
    -- ポイントルールを取得
    SELECT pr.*, ps.expiration_months
    INTO point_rule
    FROM public.point_rules pr
    JOIN public.point_systems ps ON pr.point_system_id = ps.id
    WHERE ps.company_id = company_id_var 
    AND pr.activity_category = log_record.category
    AND pr.is_active = true
    AND ps.is_active = true
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- ポイント計算
    points_earned := COALESCE(point_rule.points_per_session, 0);
    
    IF point_rule.points_per_minute IS NOT NULL AND log_record.duration_minutes IS NOT NULL THEN
        points_earned := points_earned + (point_rule.points_per_minute * log_record.duration_minutes);
    END IF;
    
    -- 有効期限計算
    IF point_rule.expiration_months IS NOT NULL THEN
        expiration_date := NOW() + (point_rule.expiration_months || ' months')::INTERVAL;
    END IF;
    
    -- ユーザーポイント残高を更新
    INSERT INTO public.user_points (user_id, company_id, current_points, total_earned, total_used)
    VALUES (user_id_input, company_id_var, points_earned, points_earned, 0)
    ON CONFLICT (user_id, company_id)
    DO UPDATE SET 
        current_points = user_points.current_points + points_earned,
        total_earned = user_points.total_earned + points_earned,
        updated_at = NOW();
    
    -- 現在の残高を取得
    SELECT current_points INTO current_balance
    FROM public.user_points
    WHERE user_id = user_id_input AND company_id = company_id_var;
    
    -- ポイント履歴に記録
    INSERT INTO public.point_transactions (
        user_id, company_id, transaction_type, amount, balance_after,
        activity_log_id, description, expires_at
    )
    VALUES (
        user_id_input, company_id_var, 'earn', points_earned, current_balance,
        activity_log_id_input, 'Activity completion reward', expiration_date
    );
    
    RETURN points_earned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 会社ダッシュボード用集計ビュー
CREATE OR REPLACE VIEW public.company_activity_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    DATE(al.check_in_time) as activity_date,
    COUNT(*) as total_activities,
    COUNT(DISTINCT al.user_id) as unique_users,
    COUNT(DISTINCT al.facility_id) as facilities_used,
    SUM(al.duration_minutes) as total_duration_minutes,
    SUM(al.calories_burned) as total_calories_burned,
    AVG(al.duration_minutes) as avg_duration_minutes
FROM public.companies c
LEFT JOIN public.activity_logs al ON c.id = al.company_id
WHERE al.check_in_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY c.id, c.name, DATE(al.check_in_time)
ORDER BY activity_date DESC;

-- 施設別利用状況ビュー  
CREATE OR REPLACE VIEW public.facility_usage_summary AS
SELECT 
    f.id as facility_id,
    f.name as facility_name,
    f.company_id,
    c.name as company_name,
    DATE(al.check_in_time) as usage_date,
    COUNT(*) as total_visits,
    COUNT(DISTINCT al.user_id) as unique_visitors,
    SUM(al.duration_minutes) as total_duration_minutes,
    AVG(al.duration_minutes) as avg_duration_minutes
FROM public.facilities f
JOIN public.companies c ON f.company_id = c.id
LEFT JOIN public.activity_logs al ON f.id = al.facility_id
WHERE al.check_in_time >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY f.id, f.name, f.company_id, c.name, DATE(al.check_in_time)
ORDER BY usage_date DESC;

-- ポイントシステム利用状況ビュー
CREATE OR REPLACE VIEW public.point_system_summary AS
SELECT 
    ps.company_id,
    c.name as company_name,
    ps.name as point_system_name,
    ps.point_unit,
    COUNT(DISTINCT up.user_id) as active_users,
    SUM(up.current_points) as total_points_outstanding,
    SUM(up.total_earned) as total_points_earned,
    SUM(up.total_used) as total_points_used,
    AVG(up.current_points) as avg_points_per_user
FROM public.point_systems ps
JOIN public.companies c ON ps.company_id = c.id
LEFT JOIN public.user_points up ON ps.company_id = up.company_id
WHERE ps.is_active = true
GROUP BY ps.company_id, c.name, ps.name, ps.point_unit;

-- 会社ダッシュボード用統計関数
CREATE OR REPLACE FUNCTION public.get_company_stats(company_id_input UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_activities BIGINT,
    unique_users BIGINT,
    total_duration_hours NUMERIC,
    total_calories BIGINT,
    avg_session_duration NUMERIC,
    total_points_awarded NUMERIC,
    active_members BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(al.id)::BIGINT as total_activities,
        COUNT(DISTINCT al.user_id)::BIGINT as unique_users,
        ROUND(SUM(al.duration_minutes) / 60.0, 2) as total_duration_hours,
        SUM(al.calories_burned)::BIGINT as total_calories,
        ROUND(AVG(al.duration_minutes), 2) as avg_session_duration,
        COALESCE(SUM(pt.amount), 0) as total_points_awarded,
        (SELECT COUNT(DISTINCT um.user_id) 
         FROM public.user_memberships um 
         WHERE um.company_id = company_id_input 
         AND um.is_active = true)::BIGINT as active_members
    FROM public.activity_logs al
    LEFT JOIN public.point_transactions pt ON al.id = pt.activity_log_id
    WHERE al.company_id = company_id_input
    AND al.check_in_time >= CURRENT_DATE - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 施設利用ランキング関数
CREATE OR REPLACE FUNCTION public.get_facility_ranking(company_id_input UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    facility_id UUID,
    facility_name TEXT,
    total_visits BIGINT,
    unique_visitors BIGINT,
    total_duration_minutes BIGINT,
    avg_duration_minutes NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.name,
        COUNT(al.id)::BIGINT,
        COUNT(DISTINCT al.user_id)::BIGINT,
        SUM(al.duration_minutes)::BIGINT,
        ROUND(AVG(al.duration_minutes), 2)
    FROM public.facilities f
    LEFT JOIN public.activity_logs al ON f.id = al.facility_id
    WHERE f.company_id = company_id_input
    AND f.is_active = true
    AND (al.check_in_time IS NULL OR al.check_in_time >= CURRENT_DATE - (days_back || ' days')::INTERVAL)
    GROUP BY f.id, f.name
    ORDER BY COUNT(al.id) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();