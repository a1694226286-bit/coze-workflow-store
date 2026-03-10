import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { useAuth } from '../App.jsx'
import { KeyRound, Crown, Lock, ChevronRight, CheckCircle2 } from 'lucide-react'

export default function Activate() {
    const { user, isVip, fetchProfile } = useAuth()
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    async function handleActivate(e) {
        e.preventDefault()
        if (!code.trim()) return

        setLoading(true)
        setMessage({ type: '', text: '' })

        if (!isSupabaseConfigured) {
            setMessage({ type: 'error', text: '系统未配置，无法激活' })
            setLoading(false)
            return
        }

        // 1. 检查激活码
        const { data: codeData, error: codeError } = await supabase
            .from('membership_codes')
            .select('*')
            .eq('code', code.trim())
            .single()

        if (codeError || !codeData) {
            setMessage({ type: 'error', text: '无效的会员码，请检查是否输入正确' })
            setLoading(false)
            return
        }

        if (codeData.is_used) {
            setMessage({ type: 'error', text: '该会员码已被使用过' })
            setLoading(false)
            return
        }

        // 2. 标记激活码为已使用
        const { error: updateCodeError } = await supabase
            .from('membership_codes')
            .update({ is_used: true, used_by: user.id, used_at: new Date().toISOString() })
            .eq('id', codeData.id)

        if (updateCodeError) {
            setMessage({ type: 'error', text: '激活过程出错，请联系客服' })
            setLoading(false)
            return
        }

        // 3. 更新用户状态为 VIP
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ is_vip: true, vip_activated_at: new Date().toISOString() })
            .eq('id', user.id)

        if (profileError) {
            setMessage({ type: 'error', text: '更新会员状态失败：' + profileError.message })
        } else {
            setMessage({ type: 'success', text: '激活成功！您现在可以不限量下载所有工作流啦！' })
            setCode('')
            fetchProfile() // 重新获取用户状态
        }

        setLoading(false)
    }

    // 如果未登录
    if (!user) {
        return (
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-xl)' }}>
                    <Lock size={40} style={{ color: 'var(--text-dim)' }} />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-md)', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>请先登录账号</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-xl)', lineHeight: 1.6 }}>
                    激活会员需要绑定您的账号。<br />请在登录后继续操作。
                </p>
                <Link to="/login" className="btn btn-primary" style={{ width: '100%', height: 44 }}>
                    去登录 <ChevronRight size={16} />
                </Link>
            </div>
        )
    }

    // 如果已经是 VIP
    if (isVip) {
        return (
            <div className="auth-card" style={{ textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.03)' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-xl)' }}>
                    <Crown size={40} style={{ color: '#10B981' }} />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-md)', fontFamily: 'var(--font-display)', color: '#10B981' }}>尊贵的 VIP 会员，您好！</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-xl)', lineHeight: 1.6 }}>
                    您已经激活了终身 VIP 会员权益。<br />全站工作流不限量免费下载。
                </p>
                <Link to="/" className="btn btn-primary" style={{ width: '100%', height: 44 }}>
                    去浏览工作流商城
                </Link>
            </div>
        )
    }

    return (
        <div className="auth-card">
            <div className="auth-title">
                <div className="auth-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                    <KeyRound size={24} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>激活 VIP 会员 👑</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>在输入框中填入您通过淘宝获取的会员码</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ display: 'flex', gap: 8 }}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleActivate}>
                <div className="form-group" style={{ marginBottom: 'var(--space-2xl)' }}>
                    <div className="input-wrapper">
                        <KeyRound className="input-icon" size={18} />
                        <input
                            type="text"
                            className="form-input input-with-icon"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="请输入类似 COZE-XXXX 的 13 位会员码"
                            required
                            style={{ fontSize: '1.125rem', padding: '16px 16px 16px 48px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-gold" style={{ width: '100%', height: 48, fontSize: '1rem', gap: 8 }} disabled={loading}>
                    <Crown size={20} />
                    {loading ? '正在验证...' : '立即激活终身 VIP'}
                </button>
            </form>

            <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px dashed var(--border-light)' }}>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 8 }}>如何获取会员码？</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                    会员码可通过官方淘宝店铺购买（商品名称：Coze 顶级工作流合集终身 SVIP）。付款后客服将自动发放 13 位会员兑换码，凭码即可在此激活下载权限。
                </p>
            </div>
        </div>
    )
}
