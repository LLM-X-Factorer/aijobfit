// 12 个行业 keyword（与 industry-augmented-salary.json by_industry 对齐）+ 中文名映射。
// 只供新增 pSEO 路由 / sitemap 使用；reportGen.ts / matching.ts 各自有就地拷贝（避免改
// 既有路径触发回归测试），后续如要 SSOT 再统一收口。

export interface IndustryMeta {
  en: string; // 数据 keyword（roles top_industries / industry-augmented-salary 用）
  cn: string; // 中文显示名
  slug?: string; // 给 /industry/[slug] 用，默认 = en
  blurb: string; // pSEO 页面 / OG / FAQ 用的一句话场景描述
}

export const INDUSTRY_LIST: IndustryMeta[] = [
  { en: "internet", cn: "互联网", blurb: "AI 招聘最大池：产品 / 运营 / 工程师 / 算法全栈需求" },
  { en: "finance", cn: "金融", blurb: "银行 / 证券 / 基金 / 保险 / 投行 + AI 转型岗位" },
  { en: "manufacturing", cn: "制造", blurb: "智能制造转型，电气 / 机械 / 工艺 / 硬件岗位 + AI 增强" },
  { en: "healthcare", cn: "医疗", blurb: "医生 / 护士 / 药师 / 医院信息 + 医疗 AI" },
  { en: "education", cn: "教育", blurb: "教师 / 教研 / 培训师 / 辅导员 + 教育 AI / AIGC 课件" },
  { en: "automotive", cn: "汽车", blurb: "自动驾驶 / 智驾 / 车辆数据 + AI 算法" },
  { en: "energy", cn: "能源", blurb: "电力 / 新能源 / 光伏 / 油气 + AI 监控调度" },
  { en: "consulting", cn: "咨询", blurb: "管理咨询 / B 端 PM / 律师 / HR + AI 转型方法论" },
  { en: "media", cn: "媒体", blurb: "编辑 / 记者 / 设计师 / 文案 / 剪辑 + AIGC 创意" },
  { en: "retail", cn: "零售", blurb: "门店 / 电商 / 导购 + AI 选品 / 客服 / 私域增长" },
  { en: "telecom", cn: "电信", blurb: "运营商 / 通信工程 / 5G + AI 网络优化" },
  { en: "government", cn: "政府", blurb: "公务员 / 事业单位 + 政务 AI / 数字化改革" },
];

export const INDUSTRY_EN_TO_CN: Record<string, string> = Object.fromEntries(
  INDUSTRY_LIST.map((i) => [i.en, i.cn]),
);

export function getIndustry(en: string): IndustryMeta | undefined {
  return INDUSTRY_LIST.find((i) => i.en === en);
}
