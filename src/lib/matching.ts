// 用户输入 → 14 角色匹配算法

import { Role, Skill } from "./fetchAgentHunt";
import { UserInput } from "./encoding";
import { TRACKS } from "@/data/tracks";
import { inferIndustryFromProfession } from "@/data/profession-to-industry";

export interface WhyMatched {
  hitRequired: string[]; // canonical names of required skills hit
  hitPreferred: string[]; // canonical names of preferred skills hit
  totalRequired: number;
  totalPreferred: number;
  targetTrackBoost: { trackId: string; trackName: string } | null;
  educationPenalty: { advancedPct: number; userEdu: string } | null;
  lowConfidence: { skillCoverage: number } | null;
  industryFit: {
    userIndustriesCN: string[];
    roleTopIndustriesCN: string[];
    intersect: string[];
    match: boolean;
  } | null;
  // 行业 hard filter：用户行业（表单选 + currentJob 推断）若全部不在角色 Top 3 行业里，
  // 分数乘 0.3 强降权，避免「电气工程师 + 教育」类用户被推 AI 销售。
  industryHardFilter: { applied: boolean; userIndustriesEN: string[]; roleTopIndustriesEN: string[] } | null;
  zeroHit: boolean;
  reasoning: string[];
}

export interface RoleMatch {
  roleId: string;
  roleName: string;
  matchScore: number; // 0-100
  matchedSkills: string[]; // canonical names
  missingSkills: { name: string; importance: number }[]; // missing required + preferred, sorted by count
  role: Role;
  whyMatched: WhyMatched;
}

// 表单 industry 选项（中文）↔ roles-domestic.json top_industries（英文）双向映射
const INDUSTRY_CN_TO_EN: Record<string, string> = {
  互联网: "internet",
  金融: "finance",
  医疗: "healthcare",
  制造: "manufacturing",
  零售: "retail",
  教育: "education",
};

const INDUSTRY_EN_TO_CN: Record<string, string> = {
  internet: "互联网",
  finance: "金融",
  healthcare: "医疗",
  manufacturing: "制造",
  retail: "零售",
  education: "教育",
  automotive: "汽车",
  consulting: "咨询",
  energy: "能源",
  government: "政府",
  media: "媒体",
  other: "其他",
};

// 预先构建一个 alias map：把用户输入的常见技能名映射到 skill_id
// 简化版：同时支持 canonical name 完整匹配 + id 完整匹配 + 子串包含
function normalizeUserSkills(userSkills: string[], allSkills: Skill[]): Set<string> {
  const ids = new Set<string>();
  const lc = userSkills.map((s) => s.trim().toLowerCase()).filter(Boolean);

  // 简单别名表：表单里的预设 → skill id（仅常见的）
  const aliasMap: Record<string, string> = {
    python: "python",
    sql: "sql",
    java: "java",
    "agent architecture": "agent_architecture",
    "prompt engineering": "prompt_engineering",
    rag: "rag",
    langchain: "langchain",
    pytorch: "pytorch",
    tensorflow: "tensorflow",
    "stable diffusion": "stable_diffusion",
    comfyui: "comfyui",
    midjourney: "midjourney",
    "data analysis": "data_analysis",
    "数据分析": "data_analysis",
    chatgpt: "llm",
    claude: "llm",
    cursor: "generative_ai",
    runway: "generative_ai",
    "fine tuning": "fine_tuning",
    "fine-tuning": "fine_tuning",
    multimodal: "multimodal_ai",
    "generative ai": "generative_ai",
  };

  for (const s of lc) {
    if (aliasMap[s]) {
      ids.add(aliasMap[s]);
      continue;
    }
    // 在 skills.json 里找：canonical_name 或 id 完全匹配（大小写不敏感）
    const hit = allSkills.find(
      (sk) =>
        sk.id.toLowerCase() === s ||
        sk.canonical_name.toLowerCase() === s ||
        sk.canonical_name.toLowerCase().includes(s) ||
        s.includes(sk.canonical_name.toLowerCase()),
    );
    if (hit) ids.add(hit.id);
  }

  return ids;
}

function getSkillName(skillId: string, allSkills: Skill[]): string {
  const sk = allSkills.find((s) => s.id === skillId);
  return sk ? sk.canonical_name : skillId;
}

// 角色 JD 中 master+phd 的占比；> 50% 视为"高学历要求"
function roleAdvancedDegreePct(role: Role): number {
  const total = Object.values(role.education).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  const advanced = (role.education.master || 0) + (role.education.phd || 0);
  return advanced / total;
}

const educationLevel: Record<string, number> = {
  专科: 1,
  本科: 2,
  硕士: 3,
  博士: 4,
};

export function matchUserToRoles(
  input: UserInput,
  roles: Role[],
  allSkills: Skill[],
  options: { lockedRoleId?: string } = {},
): RoleMatch[] {
  const userSkillIds = normalizeUserSkills(input.skills, allSkills);
  const userEduLevel = educationLevel[input.education] ?? 2;

  // 用户选择的 targetTrack（"A · ..." 格式或 "我不知道"）
  const targetTrackIds = (input.targetTrack || [])
    .map((t) => t[0]) // "A · AI 产品经理" → "A"
    .filter((t) => ["A", "B", "C", "D"].includes(t));

  const targetRoleIds = new Set<string>();
  for (const tid of targetTrackIds) {
    const track = TRACKS.find((t) => t.id === tid);
    if (track) track.roleIds.forEach((r) => targetRoleIds.add(r));
  }

  const userIndustriesCN = (input.industry || []).filter(
    (i) => i && i !== "其他" && i.trim(),
  );
  const userIndustriesEN = userIndustriesCN
    .map((cn) => INDUSTRY_CN_TO_EN[cn])
    .filter((v): v is string => Boolean(v));

  // 把 currentJob 推断的行业并入：电气工程师 → manufacturing 之类。
  const inferredIndustryEN = inferIndustryFromProfession(input.currentJob);
  const userIndustriesENForFilter = inferredIndustryEN
    ? Array.from(new Set([...userIndustriesEN, inferredIndustryEN]))
    : userIndustriesEN;

  const matches: RoleMatch[] = roles
    // 路线 B：仅算用户锁定的角色；路线 A：排除 "其他" 聚合桶
    .filter((r) =>
      options.lockedRoleId ? r.role_id === options.lockedRoleId : r.role_id !== "other",
    )
    .map((role) => {
      const requiredIds = role.required_skills.map((s) => s.skill_id);
      const preferredIds = role.preferred_skills.map((s) => s.skill_id);

      const matchedRequired = requiredIds.filter((id) => userSkillIds.has(id));
      const matchedPreferred = preferredIds.filter((id) => userSkillIds.has(id));

      const totalWeight = requiredIds.length + preferredIds.length * 0.5;
      const matchedWeight = matchedRequired.length + matchedPreferred.length * 0.5;

      let score =
        totalWeight > 0
          ? Math.min(100, (matchedWeight / totalWeight) * 100)
          : 0;

      // 置信度惩罚：required + preferred 合计少于 5 个时，线性降权。
      // 避免 "AI 教育" 这类稀疏角色（1 required + 0 preferred）用户命中一个就冲到
      // 100%，把主线锚点角色（product_manager / operations）挤掉。
      const skillCoverage = requiredIds.length + preferredIds.length;
      const confidenceFactor = Math.min(1, skillCoverage / 5);
      const isLowConfidence = skillCoverage < 5;
      score *= confidenceFactor;

      // 加成：用户指定 targetTrack 且角色匹配
      const triggeringTrack = TRACKS.find(
        (t) => targetTrackIds.includes(t.id) && t.roleIds.includes(role.role_id),
      );
      const isTargetTrackBoosted = Boolean(triggeringTrack);
      if (isTargetTrackBoosted) score *= 1.2;

      // 惩罚：高学历要求但用户低学历
      const advancedPct = roleAdvancedDegreePct(role);
      const isEducationPenalized = advancedPct > 0.5 && userEduLevel < 3;
      if (isEducationPenalized) score *= 0.5;

      // 行业 hard filter：用户行业（表单 + currentJob 推断）与角色 Top 3 行业完全不交时，
      // ×0.3。原因：industryFit 之前只是 reasoning 信号，不影响分数 → 「教育 + 产品经理」
      // 用户和「金融 + 产品经理」用户拿到的推荐一样。Top 3 而非 Top 5：要求更严，把
      // 「该角色主战场」之外的角色明显压下去。路线 B 也照常应用（虽然只有 1 个角色，
      // reasoning 里的 industryFit 仍能让用户看到行业对照）。
      const roleTop3IndustriesEN = (role.top_industries || []).slice(0, 3).map((t) => t.industry);
      const hasIndustrySignal = userIndustriesENForFilter.length > 0;
      const industryHardFilterApplied =
        hasIndustrySignal &&
        roleTop3IndustriesEN.length > 0 &&
        !userIndustriesENForFilter.some((en) => roleTop3IndustriesEN.includes(en));
      if (industryHardFilterApplied) score *= 0.3;

      score = Math.min(100, Math.round(score));

      const hitRequiredNames = matchedRequired.map((id) => getSkillName(id, allSkills));
      const hitPreferredNames = matchedPreferred.map((id) => getSkillName(id, allSkills));
      const matchedSkills = [...hitRequiredNames, ...hitPreferredNames];

      const missingRequired = role.required_skills
        .filter((s) => !userSkillIds.has(s.skill_id))
        .map((s) => ({ name: getSkillName(s.skill_id, allSkills), importance: s.count }));

      // 按 count（即出现频次/重要性）降序
      missingRequired.sort((a, b) => b.importance - a.importance);

      // 行业匹配：把用户中文行业映射成英文 keyword 后与 role.top_industries 求交集
      const roleTopIndustriesEN = (role.top_industries || []).slice(0, 5).map((t) => t.industry);
      const intersectEN = userIndustriesEN.filter((en) => roleTopIndustriesEN.includes(en));
      const industryFit =
        userIndustriesCN.length > 0 && roleTopIndustriesEN.length > 0
          ? {
              userIndustriesCN,
              roleTopIndustriesCN: roleTopIndustriesEN.map(
                (en) => INDUSTRY_EN_TO_CN[en] ?? en,
              ),
              intersect: intersectEN.map((en) => INDUSTRY_EN_TO_CN[en] ?? en),
              match: intersectEN.length > 0,
            }
          : null;

      const zeroHit = matchedRequired.length === 0 && matchedPreferred.length === 0;

      const reasoning: string[] = [];
      if (zeroHit) {
        reasoning.push(
          `0 项命中：你填的技能与「${role.role_name}」的 ${requiredIds.length} 项必备 / ${preferredIds.length} 项优选都没交集。出现在 Top 3 不是因为技能匹配，优先看下方 Gap 节列出的待补技能。`,
        );
      } else {
        const segs: string[] = [];
        if (hitRequiredNames.length > 0) {
          const sample = hitRequiredNames.slice(0, 5).join("、");
          const more = hitRequiredNames.length > 5 ? "…" : "";
          segs.push(
            `必备技能命中 ${hitRequiredNames.length}/${requiredIds.length}（${sample}${more}）`,
          );
        }
        if (hitPreferredNames.length > 0) {
          const sample = hitPreferredNames.slice(0, 5).join("、");
          const more = hitPreferredNames.length > 5 ? "…" : "";
          segs.push(
            `优选技能命中 ${hitPreferredNames.length}/${preferredIds.length}（${sample}${more}）`,
          );
        }
        reasoning.push(`你的技能与该角色硬要求重合：${segs.join("；")}。`);
      }

      if (isTargetTrackBoosted && triggeringTrack) {
        reasoning.push(
          `你选了「${triggeringTrack.name}」主线 → 该角色得分 ×1.2 加权，提升了在你 Top 3 里的排序。`,
        );
      }

      if (isEducationPenalized) {
        reasoning.push(
          `该角色 ${Math.round(advancedPct * 100)}% JD 要求硕士及以上，你目前 ${input.education} → 匹配分 ×0.5 折半，不是首选。`,
        );
      }

      if (isLowConfidence) {
        reasoning.push(
          `聚类样本稀（required + preferred 仅 ${skillCoverage} 项）→ 统计稳定性低，分数仅供参考。`,
        );
      }

      if (industryFit) {
        if (industryFit.match) {
          reasoning.push(
            `行业匹配：你的目标行业「${industryFit.intersect.join("、")}」出现在该角色 Top 行业里。`,
          );
        } else {
          reasoning.push(
            `行业偏移：你的目标行业「${industryFit.userIndustriesCN.join("、")}」不在该角色 Top 行业（${industryFit.roleTopIndustriesCN.slice(0, 3).join(" / ")}）→ 跨行可能需要适配。`,
          );
        }
      }

      if (industryHardFilterApplied) {
        const userIndustriesCNForMsg = userIndustriesENForFilter
          .map((en) => INDUSTRY_EN_TO_CN[en] ?? en)
          .join("、");
        const roleTopCN = roleTop3IndustriesEN
          .map((en) => INDUSTRY_EN_TO_CN[en] ?? en)
          .join(" / ");
        reasoning.push(
          `行业 hard filter：你的行业「${userIndustriesCNForMsg}」不在该角色 Top 3 行业（${roleTopCN}）→ 分数 ×0.3 强降权，避免推无关方向。`,
        );
      }

      if (zeroHit) {
        reasoning.push(
          `建议：先去补 Gap 节列的必备技能，或在路线 B 自己锁定行业 + 岗位重新诊断。`,
        );
      }

      const whyMatched: WhyMatched = {
        hitRequired: hitRequiredNames,
        hitPreferred: hitPreferredNames,
        totalRequired: requiredIds.length,
        totalPreferred: preferredIds.length,
        targetTrackBoost:
          isTargetTrackBoosted && triggeringTrack
            ? { trackId: triggeringTrack.id, trackName: triggeringTrack.name }
            : null,
        educationPenalty: isEducationPenalized
          ? { advancedPct, userEdu: input.education }
          : null,
        lowConfidence: isLowConfidence ? { skillCoverage } : null,
        industryFit,
        industryHardFilter: hasIndustrySignal
          ? {
              applied: industryHardFilterApplied,
              userIndustriesEN: userIndustriesENForFilter,
              roleTopIndustriesEN: roleTop3IndustriesEN,
            }
          : null,
        zeroHit,
        reasoning,
      };

      return {
        roleId: role.role_id,
        roleName: role.role_name,
        matchScore: score,
        matchedSkills,
        missingSkills: missingRequired.slice(0, 8),
        role,
        whyMatched,
      };
    });

  matches.sort((a, b) => b.matchScore - a.matchScore);
  return matches;
}
