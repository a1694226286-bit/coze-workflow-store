import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import { supabase, isSupabaseConfigured, ADMIN_EMAIL } from './lib/supabase.js'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import WorkflowDetail from './pages/WorkflowDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Activate from './pages/Activate.jsx'
import Admin from './pages/Admin.jsx'

// Auth Context
export const AuthContext = createContext(null)

export function useAuth() {
    return useContext(AuthContext)
}

export default function App() {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) {
            setLoading(false)
            return
        }

        // 获取当前会话
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else setLoading(false)
        })

        // 监听 auth 状态变化
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function fetchProfile(userId) {
        if (!supabase) return
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        setProfile(data)
        setLoading(false)
    }

    async function signOut() {
        if (supabase) await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    const isVip = profile?.is_vip || false
    const isAdmin = user?.email === ADMIN_EMAIL

    const auth = { user, profile, isVip, isAdmin, loading, signOut, fetchProfile: () => user && fetchProfile(user.id) }

    return (
        <AuthContext.Provider value={auth}>
            <Header />
            <main className="container page">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/workflow/:slug" element={<WorkflowDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/activate" element={<Activate />} />
                    <Route path="/admin" element={<Admin />} />
                </Routes>
            </main>
        </AuthContext.Provider>
    )
}
