// 用户输入 → 14 角色匹配算法

import { Role, Skill } from "./fetchAgentHunt";
import { UserInput } from "./encoding";
import { TRACKS } from "@/data/tracks";

export interface RoleMatch {
  roleId: string;
  roleName: string;
  matchScore: number; // 0-100
  matchedSkills: string[]; // canonical names
  missingSkills: { name: string; importance: number }[]; // missing required + preferred, sorted by count
  role: Role;
}

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

// 教育要求估算：如果角色 education 字段中 master + phd > 50%，认为要求"高学历"
function roleRequiresAdvancedDegree(role: Role): boolean {
  const total = Object.values(role.education).reduce((a, b) => a + b, 0);
  if (total === 0) return false;
  const advanced = (role.education.master || 0) + (role.education.phd || 0);
  return advanced / total > 0.5;
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

  const matches: RoleMatch[] = roles
    // 排除 "其他"（other）这种聚合桶，避免推非典型角色
    .filter((r) => r.role_id !== "other")
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

      // 加成：用户指定 targetTrack 且角色匹配
      if (targetRoleIds.has(role.role_id)) {
        score *= 1.2;
      }

      // 惩罚：高学历要求但用户低学历
      if (roleRequiresAdvancedDegree(role) && userEduLevel < 3) {
        score *= 0.5;
      }

      score = Math.min(100, Math.round(score));

      const matchedSkills = [...matchedRequired, ...matchedPreferred].map((id) =>
        getSkillName(id, allSkills),
      );

      const missingRequired = role.required_skills
        .filter((s) => !userSkillIds.has(s.skill_id))
        .map((s) => ({ name: getSkillName(s.skill_id, allSkills), importance: s.count }));

      // 按 count（即出现频次/重要性）降序
      missingRequired.sort((a, b) => b.importance - a.importance);

      return {
        roleId: role.role_id,
        roleName: role.role_name,
        matchScore: score,
        matchedSkills,
        missingSkills: missingRequired.slice(0, 8),
        role,
      };
    });

  matches.sort((a, b) => b.matchScore - a.matchScore);
  return matches;
}
