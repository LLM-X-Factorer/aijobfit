// 5 主线（A-D 转行轨道 + E 留行 + AI 增强）
// 字段：id, name, nameEn, jdCount, medianSalary, targetUsers, keySkills

export interface Track {
  id: "A" | "B" | "C" | "D" | "E";
  name: string;
  nameEn: string;
  // E 主线 jdCount / medianSalary 静态写 0，运行时由 TrackOverview 从
  // roles-augmented-by-profession.json 动态覆盖。其他消费者（matching / reportGen）
  // 不读这两个字段，所以默认 0 不影响。
  jdCount: number;
  medianSalary: number;
  targetUsers: string[];
  keySkills: string[];
  // 关联到 roles-domestic.json 的 role_id（A-D 用于 4 主线匹配 boost；E 为 [] 因为
  // 留行不归 14 角色聚类，归 420 个原职业 + AI 增强）
  roleIds: string[];
  // 入口路由：A-D → /diagnose；E → /diagnose-augment
  ctaPath: string;
  // E 标识：留行 + AI 增强轨道，在 matching/reportGen 的 4 主线 boost 里被排除
  isAugmentationTrack?: boolean;
}

export const TRACKS: Track[] = [
  {
    id: "A",
    name: "AI 产品经理",
    nameEn: "AI Product Manager",
    jdCount: 293,
    medianSalary: 32500,
    targetUsers: ["传统 PM", "业务产品经理", "项目经理转 AI"],
    keySkills: ["产品设计", "Prompt Engineering", "数据分析", "PRD 写作", "AI 工具实战"],
    roleIds: ["product_manager"],
    ctaPath: "/diagnose",
  },
  {
    id: "B",
    name: "AI 运营 / 训练师",
    nameEn: "AI Operations / Trainer",
    jdCount: 95,
    medianSalary: 23000,
    targetUsers: ["互联网运营", "HR", "应届生", "内容运营"],
    keySkills: ["内容运营", "Prompt 工程", "Coze / Dify", "数据分析", "用户增长"],
    roleIds: ["operations"],
    ctaPath: "/diagnose",
  },
  {
    id: "C",
    name: "AI 转型咨询",
    nameEn: "AI Transformation Consulting",
    jdCount: 71,
    medianSalary: 35000,
    targetUsers: ["5+ 年传统行业经验", "B 端 PM", "咨询顾问"],
    keySkills: ["行业 know-how", "AI 转型方法论", "B 端解决方案", "提案写作", "客户对接"],
    roleIds: ["ai_transformation"],
    ctaPath: "/diagnose",
  },
  {
    id: "D",
    name: "AIGC 创意",
    nameEn: "AIGC Creative",
    jdCount: 64,
    medianSalary: 16000,
    targetUsers: ["平面设计", "视频剪辑", "营销创意", "短视频从业者"],
    keySkills: ["ComfyUI", "Stable Diffusion", "Midjourney", "剪映", "Runway"],
    roleIds: ["other"], // 灰度，暂未单独聚类
    ctaPath: "/diagnose",
  },
  {
    id: "E",
    name: "留行 + AI 增强",
    nameEn: "Stay-in-Industry + AI Augmentation",
    jdCount: 0,        // 运行时由 TrackOverview 从 roles-augmented-by-profession 算
    medianSalary: 0,   // 同上
    targetUsers: ["不想转行的资深从业者", "电气工程师 / 产品经理 / 教师 / 销售", "用 AI 提升原岗位竞争力"],
    keySkills: ["原职业 know-how", "Prompt Engineering", "RAG", "AI 工具改造日常工作", "行业垂直 LLM"],
    roleIds: [],
    ctaPath: "/diagnose-augment",
    isAugmentationTrack: true,
  },
];

export function getTrackById(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}

// A-D 转行轨道（excludes E），用于 matching boost / reportGen fallback。E 不参与
// 4 主线匹配分数，避免「我会剪映」这种 D 主线技能命中后误把用户拉进 E 留行轨道。
export const TRANSITION_TRACKS: Track[] = TRACKS.filter((t) => !t.isAugmentationTrack);
