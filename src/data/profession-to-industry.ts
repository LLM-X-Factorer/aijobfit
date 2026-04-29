// 把表单 currentJob（free-text）粗略映射到 industry 英文 keyword（与 roles-domestic.json
// top_industries 对齐）。命中规则：currentJob 包含任一关键词则归入对应行业。
//
// 用静态表是因为 currentJob 高频集中在 30 个左右常见原职业，运行时不能叫 LLM 解析。
// 没命中默认空（matching.ts 退化为不加 inference 的 industry，仅看用户表单选的 industry[]）。
//
// industry 取值与 INDUSTRY_CN_TO_EN 共集：internet / finance / healthcare /
// manufacturing / retail / education / automotive / consulting / energy /
// government / media / telecom / other。

export const PROFESSION_KEYWORD_TO_INDUSTRY: { keywords: string[]; industry: string }[] = [
  // 制造 / 工程
  { keywords: ["电气", "机械", "自动化", "工艺", "结构工程", "电子工程", "硬件"], industry: "manufacturing" },
  // 汽车
  { keywords: ["汽车", "整车", "车辆", "智能驾驶", "自动驾驶"], industry: "automotive" },
  // 能源
  { keywords: ["电网", "电力", "新能源", "光伏", "石油", "燃气", "煤"], industry: "energy" },
  // 医疗
  { keywords: ["医生", "护士", "药师", "医院", "医疗", "生物", "制药", "临床"], industry: "healthcare" },
  // 金融
  { keywords: ["银行", "证券", "基金", "保险", "投行", "财务", "会计", "审计", "风控", "金融"], industry: "finance" },
  // 教育
  { keywords: ["教师", "老师", "培训师", "教研", "教育", "讲师", "辅导员"], industry: "education" },
  // 互联网（程序员/产品经理类不在此 app 受众，放最后做兜底）
  { keywords: ["运营", "产品经理", "新媒体", "增长"], industry: "internet" },
  // 零售
  { keywords: ["零售", "导购", "门店", "店长", "电商运营"], industry: "retail" },
  // 媒体 / 创意
  { keywords: ["编辑", "记者", "策划", "文案", "设计师", "美术", "摄影", "剪辑"], industry: "media" },
  // 咨询 / HR / 法务
  { keywords: ["咨询", "顾问", "HR", "人力资源", "招聘", "猎头", "律师", "法务"], industry: "consulting" },
  // 政府
  { keywords: ["公务员", "事业单位", "政府"], industry: "government" },
  // 通信
  { keywords: ["通信工程", "运营商", "5G"], industry: "telecom" },
];

// 用户填的 currentJob 原文 → 推断出的英文 industry（可能为空）。
export function inferIndustryFromProfession(currentJob: string | undefined): string | null {
  if (!currentJob) return null;
  const job = currentJob.trim();
  if (!job) return null;
  for (const { keywords, industry } of PROFESSION_KEYWORD_TO_INDUSTRY) {
    if (keywords.some((k) => job.includes(k))) return industry;
  }
  return null;
}
