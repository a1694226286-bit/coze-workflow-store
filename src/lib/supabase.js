import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Admin email - 管理员邮箱（只有这个邮箱才能访问 /admin）
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com'

// 是否已配置 Supabase（用于开发模式判断）
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// 只在真正配置了的时候创建客户端，否则创建一个 dummy
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
