import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { LogIn, Mail, Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [forgotPassword, setForgotPassword] = useState(false)
    const [resetSent, setResetSent] = useState(false)

    useEffect(() => {
        // Check if valid setup
        if (!isSupabaseConfigured) {
            setError('系统提示：检测到未配置 Supabase 环境变量。当前可随便点击登录体验 UI。')
        }
    }, [])

    async function handleLogin(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!isSupabaseConfigured) {
            // Mock login wrapper
            setTimeout(() => {
                setLoading(false)
                navigate('/')
            }, 800)
            return
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate('/')
        }
    }

    async function handleResetPassword(e) {
        e.preventDefault()
        if (!email.trim()) { setError('请输入邮箱'); return }
        setLoading(true)
        setError('')

        if (!isSupabaseConfigured) {
            setTimeout(() => { setResetSent(true); setLoading(false) }, 800)
            return
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/login',
        })

        if (error) {
            setError(error.message)
        } else {
            setResetSent(true)
        }
        setLoading(false)
    }

    // 忘记密码 - 重置邮件已发送
    if (forgotPassword && resetSent) {
        return (
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-xl)' }}>
                    <CheckCircle2 size={40} style={{ color: '#10B981' }} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--text-main)', marginBottom: 'var(--space-md)' }}>重置邮件已发送 📧</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-xl)' }}>
                    我们已向 <strong style={{ color: 'var(--text-main)' }}>{email}</strong> 发送了一封密码重置邮件。<br />请查收邮件并点击链接重置密码。
                </p>
                <button className="btn btn-primary" style={{ width: '100%', height: 44 }} onClick={() => { setForgotPassword(false); setResetSent(false); setError('') }}>
                    <ArrowLeft size={16} /> 返回登录
                </button>
            </div>
        )
    }

    // 忘记密码 - 输入邮箱
    if (forgotPassword) {
        return (
            <div className="auth-card">
                <div className="auth-title">
                    <div className="auth-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                        <Mail size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>忘记密码 🔑</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>输入你的注册邮箱，我们将发送重置链接</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleResetPassword}>
                    <div className="form-group" style={{ marginBottom: 'var(--space-2xl)' }}>
                        <label className="form-label">邮箱</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                className="form-input input-with-icon"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="请输入注册时的邮箱"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 44 }} disabled={loading}>
                        {loading ? '正在发送...' : '发送重置链接'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: '0.875rem' }}>
                    <button onClick={() => { setForgotPassword(false); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
                        <ArrowLeft size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />返回登录
                    </button>
                </div>
            </div>
        )
    }

    // 正常登录
    return (
        <div className="auth-card">
            <div className="auth-title">
                <div className="auth-icon">
                    <LogIn size={24} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>欢迎回来 👋</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>登录你的账号，下载精品工作流</p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label className="form-label">邮箱</label>
                    <div className="input-wrapper">
                        <Mail className="input-icon" size={18} />
                        <input
                            type="email"
                            className="form-input input-with-icon"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="请输入邮箱"
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>密码</label>
                        <button type="button" onClick={() => { setForgotPassword(true); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500, padding: 0 }}>
                            忘记密码？
                        </button>
                    </div>
                    <div className="input-wrapper">
                        <Lock className="input-icon" size={18} />
                        <input
                            type="password"
                            className="form-input input-with-icon"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="请输入密码"
                            required
                        />
                    </div>
                </div>
                <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 44 }} disabled={loading}>
                        {loading ? '正在验证...' : '登 录'}
                    </button>
                </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                还没有账号？ <Link to="/register" style={{ color: 'var(--accent-secondary)', fontWeight: 500 }}>立即注册</Link>
            </div>
        </div>
    )
}
