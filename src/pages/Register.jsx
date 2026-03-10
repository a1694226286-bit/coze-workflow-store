import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react'

export default function Register() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [nickname, setNickname] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    async function handleRegister(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        if (!isSupabaseConfigured) {
            setError('系统提示：未配置 Supabase 环境变量，无法注册。')
            setLoading(false)
            return
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nickname: nickname
                }
            }
        })

        if (error) {
            setError(error.message)
        } else {
            setMessage('注册成功！请查收邮件确认链接（如果有配置的话），或直接前往登录。')
            setTimeout(() => navigate('/login'), 2000)
        }
        setLoading(false)
    }

    return (
        <div className="auth-card">
            <div className="auth-title">
                <div className="auth-icon">
                    <UserPlus size={24} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>创建账号 🚀</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>加入 Coze 商城，下载精品工作流</p>
            </div>

            {error && <div className="alert alert-error"><AlertCircle size={16} />{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <label className="form-label">昵称 (选填)</label>
                    <div className="input-wrapper">
                        <User className="input-icon" size={18} />
                        <input
                            type="text"
                            className="form-input input-with-icon"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="怎么称呼你？"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">邮箱</label>
                    <div className="input-wrapper">
                        <Mail className="input-icon" size={18} />
                        <input
                            type="email"
                            className="form-input input-with-icon"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-2xl)' }}>
                    <label className="form-label">密码</label>
                    <div className="input-wrapper">
                        <Lock className="input-icon" size={18} />
                        <input
                            type="password"
                            className="form-input input-with-icon"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 44 }} disabled={loading}>
                    {loading ? '注册中...' : '注册账号'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                已有账号？ <Link to="/login" style={{ color: 'var(--accent-secondary)', fontWeight: 500 }}>去登录</Link>
            </div>
        </div>
    )
}
