import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { useAuth } from '../App.jsx'
import { Settings, KeyRound, Copy, Check, PlusSquare, Database, Trash2, AlertCircle, Upload, FileArchive } from 'lucide-react'

export default function Admin() {
    const navigate = useNavigate()
    const { user, isAdmin, loading: authLoading } = useAuth()

    const [workflows, setWorkflows] = useState([])
    const [codes, setCodes] = useState([])
    const [loading, setLoading] = useState(true)

    const [wfForm, setWfForm] = useState({
        name: '', slug: '', description: '', category: '',
        cover_url: '', video_url: '', download_path: ''
    })
    const [zipFile, setZipFile] = useState(null)
    const [uploading, setUploading] = useState(false)

    const [codeCount, setCodeCount] = useState(10)
    const [generatedCodes, setGeneratedCodes] = useState([])
    const [message, setMessage] = useState({ type: '', text: '' })
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate('/')
            return
        }
        if (isAdmin) loadData()
    }, [isAdmin, authLoading])

    async function loadData() {
        if (!isSupabaseConfigured) {
            setLoading(false)
            return
        }

        const [wfRes, codeRes] = await Promise.all([
            supabase.from('workflows').select('*').order('sort_order'),
            supabase.from('membership_codes').select('*').order('created_at', { ascending: false })
        ])

        if (wfRes.data) setWorkflows(wfRes.data)
        if (codeRes.data) setCodes(codeRes.data)
        setLoading(false)
    }

    function generateCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let code = 'COZE-'
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code
    }

    async function handleGenerateCodes() {
        if (!isSupabaseConfigured) {
            setMessage({ type: 'error', text: '请先配置 Supabase' })
            return
        }

        const newCodes = []
        for (let i = 0; i < codeCount; i++) {
            newCodes.push({ code: generateCode(), is_used: false })
        }

        const { error } = await supabase.from('membership_codes').insert(newCodes)

        if (error) {
            setMessage({ type: 'error', text: '生成失败：' + error.message })
        } else {
            setGeneratedCodes(newCodes.map(c => c.code))
            setMessage({ type: 'success', text: `成功生成 ${codeCount} 个会员码！` })
            loadData()
        }
    }

    function copyAllCodes() {
        const text = generatedCodes.join('\n')
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    async function handleAddWorkflow(e) {
        e.preventDefault()
        if (!isSupabaseConfigured) return
        setUploading(true)
        setMessage({ type: '', text: '' })

        let downloadPath = wfForm.download_path

        // 如果选择了 ZIP 文件，先上传到 Storage
        if (zipFile) {
            const fileName = `${Date.now()}_${zipFile.name}`
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('workflows')
                .upload(fileName, zipFile)

            if (uploadError) {
                setMessage({ type: 'error', text: 'ZIP 上传失败：' + uploadError.message })
                setUploading(false)
                return
            }
            downloadPath = fileName
        }

        const slug = wfForm.slug || wfForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `wf-${Date.now()}`

        const { error } = await supabase.from('workflows').insert([{
            ...wfForm, slug, download_path: downloadPath, sort_order: workflows.length + 1
        }])

        if (error) {
            setMessage({ type: 'error', text: '添加失败：' + error.message })
        } else {
            setMessage({ type: 'success', text: '工作流上架成功！' + (zipFile ? ' ZIP 文件已上传。' : '') })
            setWfForm({ name: '', slug: '', description: '', category: '', cover_url: '', video_url: '', download_path: '' })
            setZipFile(null)
            // 重置 file input
            const fileInput = document.getElementById('zip-upload')
            if (fileInput) fileInput.value = ''
            loadData()
        }
        setUploading(false)
    }

    async function handleDeleteWorkflow(id) {
        if (!confirm('确定删除这个工作流？')) return
        await supabase.from('workflows').delete().eq('id', id)
        loadData()
    }

    if (authLoading || loading) return <div className="page-loading"><div className="spinner"></div></div>
    if (!isAdmin) return null

    return (
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-2xl)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Settings size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', lineHeight: 1 }}>管理后台</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>仅管理员可见。用于生成会员激活码及上架工作流资料。</p>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ display: 'flex', gap: 8 }}>
                    <AlertCircle size={18} />
                    <span>{message.text}</span>
                </div>
            )}

            {/* 会员码管理 */}
            <div className="admin-section">
                <h3><KeyRound size={20} className="text-gradient" /> 会员激活码管理</h3>

                <div className="admin-form-row" style={{ alignItems: 'flex-end', marginBottom: 'var(--space-xl)' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">单批生成数量</label>
                        <input type="number" className="form-input" value={codeCount} onChange={(e) => setCodeCount(parseInt(e.target.value) || 1)} min="1" max="100" />
                    </div>
                    <button className="btn btn-primary" onClick={handleGenerateCodes} style={{ height: 48 }}>
                        生成 {codeCount} 个新会员码
                    </button>
                </div>

                {generatedCodes.length > 0 && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-xl)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                            <span style={{ fontSize: '0.875rem', color: '#10B981', fontWeight: 500 }}>本次新生成的会员码 ({generatedCodes.length}个)</span>
                            <button className="btn btn-ghost" onClick={copyAllCodes} style={{ gap: 4, height: 32, fontSize: '0.8125rem' }}>
                                {copied ? <><Check size={14} /> 已复制</> : <><Copy size={14} /> 复制全部</>}
                            </button>
                        </div>
                        <div className="codes-list" style={{ maxHeight: 200, overflowY: 'auto' }}>
                            {generatedCodes.map(c => <span key={c} className="code-tag">{c}</span>)}
                        </div>
                    </div>
                )}

                <details>
                    <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.875rem', userSelect: 'none', padding: '8px 0' }}>
                        查看历史全部会员码（共 {codes.length} 个，已使用 {codes.filter(c => c.is_used).length} 个）
                    </summary>
                    <div className="codes-list" style={{ marginTop: 'var(--space-md)', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                        {codes.map(c => (
                            <span key={c.id} className={`code-tag ${c.is_used ? 'used' : ''}`} title={c.is_used ? `已被使用` : '未使用'}>{c.code}</span>
                        ))}
                    </div>
                </details>
            </div>

            {/* 工作流管理 */}
            <div className="detail-layout" style={{ marginTop: 0 }}>
                <div className="admin-section">
                    <h3><PlusSquare size={20} className="text-gradient" /> 添加新工作流</h3>
                    <form onSubmit={handleAddWorkflow}>
                        <div className="admin-form-row">
                            <div className="form-group">
                                <label className="form-label">名称 *</label>
                                <input className="form-input" value={wfForm.name} onChange={e => setWfForm({ ...wfForm, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">分类 *</label>
                                <input className="form-input" value={wfForm.category} placeholder="如：视频生成" onChange={e => setWfForm({ ...wfForm, category: e.target.value })} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">描述</label>
                            <textarea className="form-input" value={wfForm.description} onChange={e => setWfForm({ ...wfForm, description: e.target.value })} style={{ minHeight: 80, resize: 'vertical' }} />
                        </div>
                        <div className="admin-form-row">
                            <div className="form-group">
                                <label className="form-label">封面图 URL (可选)</label>
                                <input className="form-input" value={wfForm.cover_url} onChange={e => setWfForm({ ...wfForm, cover_url: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">演示视频 URL (可选, B站iframe链接)</label>
                                <input className="form-input" value={wfForm.video_url} onChange={e => setWfForm({ ...wfForm, video_url: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
                            <label className="form-label">上传工作流 ZIP 压缩包</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="zip-upload"
                                    type="file"
                                    accept=".zip,.rar,.7z"
                                    onChange={e => setZipFile(e.target.files[0] || null)}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('zip-upload').click()}
                                    className="btn btn-secondary"
                                    style={{ width: '100%', height: 56, gap: 10, justifyContent: 'center', borderStyle: 'dashed' }}
                                >
                                    {zipFile ? (
                                        <><FileArchive size={20} style={{ color: 'var(--success)' }} /> {zipFile.name} ({(zipFile.size / 1024 / 1024).toFixed(2)} MB)</>
                                    ) : (
                                        <><Upload size={20} /> 点击选择 ZIP 文件</>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: 44, width: '100%' }} disabled={uploading}>
                            {uploading ? '正在上传...' : '上架工作流'}
                        </button>
                    </form>
                </div>

                <div className="admin-section">
                    <h3><Database size={20} className="text-gradient" /> 在架库概览</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: 'var(--space-md)' }}>
                        当前系统中有 {workflows.length} 个工作流在售。
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
                        {workflows.map(w => (
                            <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{w.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{w.category}</div>
                                </div>
                                <button className="btn btn-ghost" style={{ color: '#EF4444', padding: 8, borderRadius: 'var(--radius-md)' }} onClick={() => handleDeleteWorkflow(w.id)} title="下架删除">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
