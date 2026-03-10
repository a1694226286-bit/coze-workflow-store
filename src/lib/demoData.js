// 开发/演示用的模拟数据（Supabase 未配置时使用）
export const DEMO_WORKFLOWS = [
    {
        id: '1', name: '情绪放大镜款短视频', slug: 'qxfdj',
        description: '情绪放大文案，生成短视频', category: '视频生成',
        cover_url: '', video_url: '', sort_order: 1,
    },
    {
        id: '2', name: '皮影戏工作流', slug: 'piying-video',
        description: '皮影戏风格视频自动生成', category: '视频生成',
        cover_url: '', video_url: '', sort_order: 2,
    },
    {
        id: '3', name: '语录赛道：情感、创业、认知', slug: 'yulu',
        description: '语录类短视频批量生成', category: '视频生成',
        cover_url: '', video_url: '', sort_order: 3,
    },
    {
        id: '4', name: '听故事学中药最新版', slug: 'tgsxzy',
        description: '中药故事讲解视频', category: '视频生成',
        cover_url: '', video_url: '', sort_order: 4,
    },
    {
        id: '5', name: '心理学效应解读', slug: 'xinlixue',
        description: '心理学知识类视频', category: '视频生成',
        cover_url: '', video_url: '', sort_order: 5,
    },
    {
        id: '6', name: '公众号输入主题自动生成图文', slug: 'gzh-tuwen',
        description: '公众号图文自动生成', category: '图文生成',
        cover_url: '', video_url: '', sort_order: 6,
    },
    {
        id: '7', name: 'B2B 电商宣传视频', slug: 'b2b-video',
        description: '电商产品宣传视频一键生成', category: '电商工具',
        cover_url: '', video_url: '', sort_order: 7,
    },
    {
        id: '8', name: '历史人物故事写实视频', slug: 'history-people',
        description: '新闻播报风格写实视频', category: '视频生成',
        cover_url: '', video_url: '', sort_order: 8,
    },
    {
        id: '9', name: '每日英语学习', slug: 'everyday-english',
        description: '英语单词学习卡片生成', category: '教育工具',
        cover_url: '', video_url: '', sort_order: 9,
    },
    {
        id: '10', name: '书法助手', slug: 'shufa',
        description: '书法练习指导与评价', category: '教育工具',
        cover_url: '', video_url: '', sort_order: 10,
    },
    {
        id: '11', name: 'URL 转 AI PPT', slug: 'url-to-aippt',
        description: '输入网址自动生成 PPT', category: '办公效率',
        cover_url: '', video_url: '', sort_order: 11,
    },
    {
        id: '12', name: '小红书文案改写', slug: 'xhs-rewrite',
        description: '一键改写为小红书风格文案', category: '图文生成',
        cover_url: '', video_url: '', sort_order: 12,
    },
]

// 所有分类
export const CATEGORIES = ['全部', '视频生成', '图文生成', '电商工具', '教育工具', '办公效率']

// 生成占位封面图 URL
export function getPlaceholderCover(name) {
    const colors = ['7c5cff', '5b8cff', 'ff6b6b', 'ffc857', '34c759', 'ff9f43']
    const idx = name.length % colors.length
    return `https://placehold.co/640x400/${colors[idx]}/ffffff?text=${encodeURIComponent(name.slice(0, 6))}&font=noto-sans`
}
