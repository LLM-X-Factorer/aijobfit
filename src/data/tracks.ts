// 4 主线（来自 agent-hunt 产品设计文档）
// 字段：id, name, nameEn, jdCount, medianSalary, targetUsers, keySkills

export interface Track {
  id: "A" | "B" | "C" | "D";
  name: string;
  nameEn: string;
  jdCount: number;
  medianSalary: number;
  targetUsers: string[];
  keySkills: string[];
  // 关联到 roles-domestic.json 的 role_id（可能 1 个或多个）
  roleIds: string[];
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
  },
];

export function getTrackById(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}
