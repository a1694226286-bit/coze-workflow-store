import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { DEMO_WORKFLOWS } from '../lib/demoData.js'
import { useAuth } from '../App.jsx'
import { ArrowLeft, PlayCircle, Download, Lock, CheckCircle2, ChevronRight, Crown, Play } from 'lucide-react'

export default function WorkflowDetail() {
    const { slug } = useParams()
    const { user, isVip, isAdmin } = useAuth()
    const [workflow, setWorkflow] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [playing, setPlaying] = useState(false)

    useEffect(() => {
        loadWorkflow()
    }, [slug])

    async function loadWorkflow() {
        if (!isSupabaseConfigured) {
            const demoWf = DEMO_WORKFLOWS.find(w => w.slug === slug)
            setWorkflow(demoWf || null)
            setLoading(false)
            return
        }

        const { data } = await supabase
            .from('workflows')
            .select('*')
            .eq('slug', slug)
            .single()

        setWorkflow(data)
        setLoading(false)
    }

    async function handleDownload() {
        if (!workflow.download_path || !isSupabaseConfigured) {
            alert('下载链接未配置或未连接数据库')
            return
        }

        setDownloading(true)
        // download_path 存的是文件夹名，上传到 Storage 时加了 .zip 后缀
        const storagePath = workflow.download_path.endsWith('.zip')
            ? workflow.download_path
            : workflow.download_path + '.zip'

        const { data, error } = await supabase
            .storage
            .from('workflows')
            .createSignedUrl(storagePath, 60) // 1分钟有效期的下载链接

        setDownloading(false)
        if (error) {
            alert('获取下载链接失败：' + error.message)
        } else if (data?.signedUrl) {
            window.location.href = data.signedUrl
        }
    }

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>
    if (!workflow) return (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>工作流不存在</h2>
            <Link to="/" className="btn btn-primary">返回首页</Link>
        </div>
    )

    const canDownload = isVip || isAdmin

    // 自动把B站普通链接转成嵌入播放器链接
    function toEmbedUrl(url) {
        if (!url) return ''
        // 已经是嵌入链接
        if (url.includes('player.bilibili.com')) return url
        // 从普通链接提取 BV 号
        const bvMatch = url.match(/BV[a-zA-Z0-9]+/)
        if (bvMatch) {
            return `https://player.bilibili.com/player.html?bvid=${bvMatch[0]}&autoplay=0&high_quality=1`
        }
        // 非B站链接原样返回
        return url
    }

    return (
        <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 'var(--space-xl)', fontSize: '0.875rem' }} className="hover:text-main">
                <ArrowLeft size={16} /> 返回工作流列表
            </Link>

            <div className="detail-layout">
                {/* Left: Video Player */}
                <div className="video-container">
                    {workflow.video_url ? (
                        playing ? (
                            /* 播放状态：用 overflow:hidden 裁掉 B站顶部标题栏 */
                            <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                                <iframe
                                    src={toEmbedUrl(workflow.video_url) + '&danmaku=0&as_wide=1'}
                                    style={{
                                        width: '100%',
                                        height: 'calc(100% + 56px)',
                                        marginTop: '-56px',
                                        border: 'none',
                                    }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen>
                                </iframe>
                            </div>
                        ) : (
                            /* 封面状态：显示封面图 + 播放按钮 */
                            <div
                                onClick={() => setPlaying(true)}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    borderRadius: 'var(--radius-lg)',
                                    overflow: 'hidden',
                                }}
                            >
                                {workflow.cover_url ? (
                                    <img
                                        src={workflow.cover_url}
                                        alt={workflow.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%', height: '100%',
                                        background: 'linear-gradient(135deg, hsl(250, 70%, 15%), hsl(290, 80%, 10%))',
                                    }} />
                                )}
                                {/* 播放按钮遮罩 */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'rgba(0,0,0,0.3)',
                                    transition: 'background 0.2s',
                                }}>
                                    <div style={{
                                        width: 72, height: 72, borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.15)',
                                        backdropFilter: 'blur(8px)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        transition: 'transform 0.2s',
                                    }}>
                                        <Play size={32} fill="white" color="white" style={{ marginLeft: 3 }} />
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="video-placeholder">
                            <PlayCircle size={64} strokeWidth={1} style={{ marginBottom: 16, opacity: 0.5 }} />
                            <p style={{ fontSize: '1.125rem' }}>暂无演示视频</p>
                        </div>
                    )}
                </div>

                {/* Right: Info Card */}
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-md)', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
                        {workflow.name}
                    </h1>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-lg)' }}>
                        <span className="wf-tag" style={{ position: 'relative', top: 0, left: 0 }}>
                            {workflow.category || '默认分类'}
                        </span>
                    </div>

                    <div className="info-card">
                        <div>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-sm)', color: 'var(--text-main)' }}>工作流简介</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                {workflow.description || '这是一个强大且易用的 Coze 工作流，内置了精心调优的 Prompt 和插件配置，一键导入即可在你的空间内运行使用。'}
                            </p>
                        </div>

                        <div style={{ padding: 'var(--space-md) 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', marginTop: 'var(--space-sm)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                                    <span>包含完整节点与 Prompt 配置</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                                    <span>一键导入个人 Coze 空间</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                                    <span>支持二次修改与自定义扩展</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-md)' }}>
                            {!user ? (
                                <div style={{ textAlign: 'center', padding: 'var(--space-lg)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
                                    <Lock size={32} style={{ margin: '0 auto 12px', color: 'var(--text-dim)' }} />
                                    <p style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: '0.875rem' }}>登录后可获取工作流文件</p>
                                    <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>前去登录 <ChevronRight size={16} /></Link>
                                </div>
                            ) : !canDownload ? (
                                <div style={{ textAlign: 'center', padding: 'var(--space-lg)', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <Crown size={32} style={{ margin: '0 auto 12px', color: '#F59E0B' }} />
                                    <p style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: '0.875rem' }}>需要 VIP 权限才能下载此工作流</p>
                                    <Link to="/activate" className="btn btn-gold" style={{ width: '100%' }}>激活 VIP 下载全库</Link>
                                </div>
                            ) : (
                                <button
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="btn btn-primary"
                                    style={{ width: '100%', height: 48, fontSize: '1rem' }}
                                >
                                    <Download size={20} />
                                    {downloading ? '获取链接中...' : '下载工作流 ZIP'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
