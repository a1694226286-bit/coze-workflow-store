-- ============================================
-- Coze 工作流商城 - 数据库 Schema
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================

-- 1. 用户扩展表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_vip BOOLEAN DEFAULT FALSE,
  vip_activated_at TIMESTAMPTZ,
  nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 自动为新注册用户创建 profile
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, is_vip) VALUES (NEW.id, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- 2. 工作流表
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  download_path TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 会员码表
CREATE TABLE IF NOT EXISTS membership_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- profiles: 用户只能读写自己的 profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- workflows: 所有人可读，只有 service_role 可写（管理员通过 Supabase dashboard 或 admin API）
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflows_select" ON workflows
  FOR SELECT USING (true);

CREATE POLICY "workflows_all_for_authenticated" ON workflows
  FOR ALL USING (auth.role() = 'authenticated');

-- membership_codes: 所有登录用户可读和更新（用于激活）
ALTER TABLE membership_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "codes_select" ON membership_codes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "codes_update" ON membership_codes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "codes_insert" ON membership_codes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- Storage Bucket
-- ============================================
-- 在 Supabase Dashboard → Storage 中手动创建 bucket: "workflows"
-- 设为 Private (需要登录才能下载)
