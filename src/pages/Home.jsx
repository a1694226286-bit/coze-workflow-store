import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { DEMO_WORKFLOWS } from '../lib/demoData.js'
import WorkflowCard from '../components/WorkflowCard.jsx'
import { Search, PackageOpen } from 'lucide-react'

export default function Home() {
    const [workflows, setWorkflows] = useState([])
    const [category, setCategory] = useState('全部')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadWorkflows()
    }, [])

    async function loadWorkflows() {
        if (!isSupabaseConfigured) {
            setWorkflows(DEMO_WORKFLOWS)
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .order('sort_order', { ascending: true })

        if (!error && data) setWorkflows(data)
        setLoading(false)
    }

    // 过滤
    const filtered = workflows.filter(w => {
        const matchCategory = category === '全部' || w.category === category
        const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase())
        return matchCategory && matchSearch
    })

    // 从工作流中提取所有分类
    const allCategories = ['全部', ...new Set(workflows.map(w => w.category).filter(Boolean))]

    if (loading) {
        return <div className="page-loading"><div className="spinner"></div></div>
    }

    return (
        <div>
            {/* Hero */}
            <section className="hero">
                <h1 className="hero-title">
                    200+ 精品 <span className="text-gradient">AI 工作流</span>
                    <br />一键下载，即刻使用
                </h1>
                <p className="hero-subtitle">
                    涵盖视频生成、图文创作、电商工具、教育助手等热门场景，全部适配 Coze (扣子) 平台
                </p>
                <div className="hero-stats">
                    <div className="hero-stat">
                        <div className="hero-stat-value">{workflows.length}+</div>
                        <div className="hero-stat-label">精品工作流</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">{allCategories.length - 1}</div>
                        <div className="hero-stat-label">覆盖场景</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">∞</div>
                        <div className="hero-stat-label">持续更新</div>
                    </div>
                </div>
            </section>

            {/* Search */}
            <div style={{ marginBottom: 'var(--space-lg)', display: 'flex', justifyContent: 'center' }}>
                <div className="input-wrapper" style={{ width: '100%', maxWidth: 480 }}>
                    <Search className="input-icon" size={20} />
                    <input
                        type="text"
                        className="form-input input-with-icon"
                        placeholder="搜索工作流名称..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Category Filter */}
            <div className="category-filter">
                {allCategories.map(cat => (
                    <button
                        key={cat}
                        className={`category-chip ${category === cat ? 'active' : ''}`}
                        onClick={() => setCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Workflow Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>
                    <PackageOpen size={64} style={{ margin: '0 auto 16px', opacity: 0.5 }} strokeWidth={1} />
                    <p style={{ fontSize: '1.125rem' }}>没有找到匹配的工作流</p>
                </div>
            ) : (
                <div className="workflow-grid">
                    {filtered.map(w => (
                        <WorkflowCard key={w.id} workflow={w} />
                    ))}
                </div>
            )}
        </div>
    )
}
