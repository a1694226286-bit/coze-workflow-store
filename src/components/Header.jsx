import { Link } from 'react-router-dom'
import { Zap, Library, LogIn, Crown, User, LogOut, ShieldAlert } from 'lucide-react'
import { useAuth } from '../App.jsx'

export default function Header() {
    const { user, isVip, isAdmin, signOut } = useAuth()

    return (
        <div className="header-wrapper">
            <header className="header">
                <Link to="/" className="header-logo">
                    <Zap className="icon" strokeWidth={2.5} />
                    <span>Coze 商城</span>
                </Link>

                <nav className="header-nav">
                    <Link to="/" className="nav-link">
                        <Library size={18} />
                        <span>工作流库</span>
                    </Link>

                    {user ? (
                        <>
                            {isAdmin && (
                                <Link to="/admin" className="nav-link" style={{ color: '#F59E0B' }}>
                                    <ShieldAlert size={18} />
                                    <span>管理后台</span>
                                </Link>
                            )}

                            {!isVip ? (
                                <Link to="/activate" className="nav-link" style={{ color: '#F59E0B' }}>
                                    <Crown size={18} />
                                    <span>激活 VIP</span>
                                </Link>
                            ) : (
                                <span className="nav-link" style={{ cursor: 'default', color: '#10B981' }}>
                                    <Crown size={18} />
                                    <span>VIP 会员</span>
                                </span>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginLeft: 'var(--space-md)', paddingLeft: 'var(--space-md)', borderLeft: '1px solid var(--border-light)' }}>
                                <span className="nav-link" style={{ cursor: 'default' }}>
                                    <User size={18} />
                                    <span>{user.email.split('@')[0]}</span>
                                </span>
                                <button onClick={signOut} className="btn btn-ghost" style={{ padding: '6px 12px' }}>
                                    <LogOut size={18} />
                                    <span>退出</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <Link to="/login" className="btn btn-ghost">登录</Link>
                            <Link to="/register" className="btn btn-primary">立即注册</Link>
                        </div>
                    )}
                </nav>
            </header>
        </div>
    )
}
