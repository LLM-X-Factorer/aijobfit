// 诚实推荐免费资源清单（来自 agent-hunt/docs/employment-course/02-9.9诊断报告模板.md 第 5 节）
// 这是产品的核心差异化：报告里诚实推免费资源，不为了卖课贬低自学路径

export interface Resource {
  emoji: string;
  name: string;
  description: string;
  url?: string;
  paid?: boolean; // 默认免费；少数付费但便宜的也列出，标注 paid
}

export interface ResourceGroup {
  title: string;
  resources: Resource[];
}

// 通用资源（所有人都该看）
export const COMMON_RESOURCES: Resource[] = [
  {
    emoji: "📚",
    name: "Datawhale 开源学习平台",
    description: "公益训练营，开源 + 同伴学习",
    url: "https://datawhale.club",
  },
  {
    emoji: "📚",
    name: "阿里云 ModelScope 训练营",
    description: "阿里云补贴，覆盖 LLM / Agent 实战",
    url: "https://modelscope.cn",
  },
  {
    emoji: "🎬",
    name: "李宏毅 LLM 系列（B 站）",
    description: "B 站搜「李宏毅 大型语言模型」",
  },
  {
    emoji: "📖",
    name: "Anthropic Prompt Engineering Guide",
    description: "英文，但是 Prompt 黄金标准",
    url: "https://docs.anthropic.com",
  },
  {
    emoji: "🤖",
    name: "即刻 / Twitter 上的 AI Agent 玩家圈子",
    description: "关键意见领袖：宝玉、AGI Hunt、Founder Park",
  },
];

// 按主线分类的资源
export const TRACK_RESOURCES: Record<"A" | "B" | "C" | "D", ResourceGroup> = {
  A: {
    title: "A · AI 产品经理",
    resources: [
      {
        emoji: "📰",
        name: "人人都是产品经理 - AI 产品经理专题",
        description: "国内 PM 社区最大的 AI PM 内容库",
        url: "https://www.woshipm.com",
      },
      {
        emoji: "🎤",
        name: "派分享会",
        description: "找 AI PM 实战分享",
      },
      {
        emoji: "📊",
        name: "AI 产品榜",
        description: "看真实 AI 产品的功能拆解",
        url: "https://aicpb.com",
      },
    ],
  },
  B: {
    title: "B · AI 运营 / 训练师",
    resources: [
      {
        emoji: "📦",
        name: "秋叶 AI 办公训练营",
        description: "1599，付费但便宜",
        url: "https://qiuyezhushou.com",
        paid: true,
      },
      {
        emoji: "📊",
        name: "AI 产品榜的运营案例库",
        description: "真实运营案例集合",
      },
      {
        emoji: "📰",
        name: "增长黑盒 AI 营销专题",
        description: "AI 时代的增长方法论",
        url: "https://growthbox.net",
      },
    ],
  },
  C: {
    title: "C · AI 转型咨询",
    resources: [
      {
        emoji: "📑",
        name: "麦肯锡 / Gartner / 德勤 AI 报告",
        description: "官网免费 PDF",
      },
      {
        emoji: "🏢",
        name: "清华-中国人民大学 AI 应用案例库",
        description: "中文真实企业 AI 转型案例",
        url: "https://rdcy-yc.com",
      },
      {
        emoji: "📺",
        name: "36 氪 / 虎嗅的 AI 转型深度报道",
        description: "国内 AI 转型一线观察",
      },
    ],
  },
  D: {
    title: "D · AIGC 创意",
    resources: [
      {
        emoji: "🎬",
        name: "B 站 ComfyUI 系列教程",
        description: "搜「ComfyUI 入门」",
      },
      {
        emoji: "🎨",
        name: "Liblib 创作社区",
        description: "中文 AIGC 模型分享",
        url: "https://liblib.art",
      },
      {
        emoji: "🎨",
        name: "Civitai",
        description: "英文，海量 SD 模型",
        url: "https://civitai.com",
      },
      {
        emoji: "📚",
        name: "即梦 AI 学院",
        description: "字节出的 AIGC 视频工具教学",
        url: "https://jimeng.jianying.com",
      },
      {
        emoji: "🎬",
        name: "Runway 官方教程",
        description: "视频生成头部工具学习路径",
        url: "https://runwayml.com/learn",
      },
    ],
  },
};

// 3 个月学习路线（基于路径 A · 自学，第 5 节路径 A 表格）
export interface MonthPlan {
  month: string;
  topic: string;
  resources: string[]; // 简要列出
  hours: string;
}

export const SELF_STUDY_PLAN: MonthPlan[] = [
  {
    month: "第 1 月 · 通识",
    topic: "LLM 基础 / Prompt / Agent 概念",
    resources: [
      "Datawhale 公益训练营",
      "阿里云 ModelScope 训练营",
      "李宏毅 LLM 系列（B 站）",
      "Anthropic Prompt Engineering Guide",
    ],
    hours: "30-40h",
  },
  {
    month: "第 2 月 · 工具实战",
    topic: "Cursor / Claude Code / Dify / Coze",
    resources: [
      "Cursor 官方教程",
      "Dify 官方文档 + Coze 模板市场",
      "即刻「AI Agent 玩家」社区帖子",
      "YC AI Cookbook（cookbook.openai.com）",
    ],
    hours: "30-40h",
  },
  {
    month: "第 3 月 · 主线深化 + 项目",
    topic: "按目标主线深化（A/B/C/D 任选）",
    resources: ["按你 Top 1 主线选上面的资源清单", "至少完成 1 个能跑的真实项目"],
    hours: "40-60h",
  },
];
