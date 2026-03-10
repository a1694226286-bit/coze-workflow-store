-- ============================================
-- 下载记录表 & 每日限额功能
-- ============================================

-- 1. 创建下载记录表
CREATE TABLE IF NOT EXISTS download_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建索引（加速按用户+日期查询）
CREATE INDEX IF NOT EXISTS idx_download_logs_user_date 
    ON download_logs (user_id, downloaded_at);

-- 3. 启用 RLS
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS 策略：用户只能看自己的下载记录
CREATE POLICY "用户查看自己的下载记录" ON download_logs
    FOR SELECT USING (auth.uid() = user_id);

-- 5. RLS 策略：用户可以插入自己的下载记录
CREATE POLICY "用户记录自己的下载" ON download_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. 创建函数：查询用户今日下载次数
CREATE OR REPLACE FUNCTION get_today_download_count(uid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM download_logs
    WHERE user_id = uid
    AND downloaded_at >= (NOW() AT TIME ZONE 'Asia/Shanghai')::DATE::TIMESTAMPTZ;
$$ LANGUAGE SQL SECURITY DEFINER;
