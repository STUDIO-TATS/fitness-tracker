-- 通知テーブルの作成
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('app', 'facility', 'achievement', 'reminder')),
    category VARCHAR(100) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
    facility_name VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- インデックスの作成
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- RLSポリシーの設定
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の通知のみ閲覧可能
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- ユーザーは自分の通知の既読状態を更新可能
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- システムは通知を作成可能（サービスロールのみ）
CREATE POLICY "Service role can create notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- 更新日時の自動更新トリガー
CREATE TRIGGER set_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();