import { Link } from 'react-router-dom'
import { ArrowUpRight, PlayCircle, Image as ImageIcon } from 'lucide-react'

export default function WorkflowCard({ workflow }) {
    // 如果没有封面图，显示一个高级的占位符
    const renderCover = () => {
        if (workflow.cover_url) {
            return <img src={workflow.cover_url} alt={workflow.name} loading="lazy" />
        }

        // 生成基于分类的渐变色块
        const hash = workflow.name.length
        const hues = [250, 210, 280, 320, 150]
        const hue = hues[hash % hues.length]

        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, hsl(${hue}, 70%, 15%), hsl(${hue + 40}, 80%, 10%))`
                }}
                className="wf-cover-placeholder"
            >
                <ImageIcon size={48} strokeWidth={1} opacity={0.5} />
            </div>
        )
    }

    return (
        <Link to={`/workflow/${workflow.slug}`} className="wf-card group">
            <div className="wf-cover">
                {renderCover()}
                <div className="wf-tag">
                    <PlayCircle size={12} />
                    {workflow.category || '视频生成'}
                </div>
            </div>

            <div className="wf-content">
                <h3 className="wf-title">
                    <span style={{ paddingRight: 8 }}>{workflow.name}</span>
                    <ArrowUpRight size={18} className="wf-arrow" />
                </h3>
                <p className="wf-desc">
                    {workflow.description || '暂无描述信息，包含详细工作流配置和提示词。'}
                </p>
            </div>
        </Link>
    )
}
