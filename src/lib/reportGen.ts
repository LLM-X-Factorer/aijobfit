// UserInput + roles → 7 节报告 JSON

import { Role, Skill } from "./fetchAgentHunt";
import { UserInput } from "./encoding";
import { matchUserToRoles, RoleMatch } from "./matching";
import { TRACKS, Track } from "@/data/tracks";

export interface CoverData {
  title: string;
  currentJob: string;
  yearsExp: string;
  education: string;
  city?: string;
  trackScores: { track: Track; score: number }[]; // 4 主线匹配度
  topRoles: { roleName: string; matchScore: number }[];
  reportId: string;
  generatedAt: string;
}

export interface RolesData {
  topMatches: RoleMatch[];
  totalRoles: number;
  totalJDs: number;
}

export interface SalaryData {
  topRoleName: string;
  p25: number;
  p50: number;
  p75: number;
  userExpectedMin?: number;
  userExpectedMax?: number;
  reality: "above" | "below" | "in-range" | "no-input";
  message: string;
}

export interface GapData {
  topRoleName: string;
  matchedSkills: string[];
  missingSkills: { name: string; importance: number; priority: "high" | "mid" | "low" }[];
  totalRequired: number;
  matchedCount: number;
}

export interface PathsData {
  topTrack: Track | null;
}

export interface ActionsData {
  d7: string[];
  d30: string[];
  d90: string[];
}

export interface MetaData {
  jdTotal: number;
  rolesTotal: number;
  generatedAt: string;
  reportId: string;
  // 兜底模式：用户技能与 agent-hunt 的技能库（偏 AI/ML 硬核）几乎不重合时触发，
  // 匹配分数全为 0。报告内容照常渲染（用户看见的 top 3 都是 0%），
  // 前端会在 Cover 上方显示一个提示，说明原因并建议下一步。
  isFallback: boolean;
  fallbackTrack?: Track | null;
}

export interface Report {
  cover: CoverData;
  roles: RolesData;
  salary: SalaryData;
  gap: GapData;
  paths: PathsData;
  actions: ActionsData;
  meta: MetaData;
}

const JD_TOTAL = 2370;

function calcTrackScores(matches: RoleMatch[]): { track: Track; score: number }[] {
  return TRACKS.map((track) => {
    // 一个主线的分数 = 这个主线相关的角色匹配分数最大值（如果有的话），没有则降权
    const relatedScores = matches
      .filter((m) => track.roleIds.includes(m.roleId))
      .map((m) => m.matchScore);
    const score = relatedScores.length > 0 ? Math.max(...relatedScores) : 0;
    return { track, score };
  });
}

function buildSalary(input: UserInput, top: RoleMatch | undefined): SalaryData {
  if (!top) {
    return {
      topRoleName: "—",
      p25: 0,
      p50: 0,
      p75: 0,
      reality: "no-input",
      message: "暂无足够数据",
    };
  }
  const { p25, median, p75 } = top.role.salary;
  const min = input.expectedSalaryMin;
  const max = input.expectedSalaryMax;
  if (!min && !max) {
    return {
      topRoleName: top.roleName,
      p25,
      p50: median,
      p75,
      reality: "no-input",
      message: `${top.roleName} 中位月薪 ${median.toLocaleString()} 元，区间 ${p25.toLocaleString()} - ${p75.toLocaleString()}。`,
    };
  }
  const userMid = ((min || 0) + (max || 0)) / 2 * 1000; // K → 元
  if (userMid > p75) {
    return {
      topRoleName: top.roleName,
      p25,
      p50: median,
      p75,
      userExpectedMin: min,
      userExpectedMax: max,
      reality: "above",
      message: `你的期望（约 ${userMid.toLocaleString()} 元）高于 ${top.roleName} 的 P75（${p75.toLocaleString()}）。要达成需要进入 Top 25%。`,
    };
  }
  if (userMid < p25) {
    return {
      topRoleName: top.roleName,
      p25,
      p50: median,
      p75,
      userExpectedMin: min,
      userExpectedMax: max,
      reality: "below",
      message: `你的期望（约 ${userMid.toLocaleString()} 元）低于 ${top.roleName} 的 P25（${p25.toLocaleString()}），市场实际可以更高。`,
    };
  }
  return {
    topRoleName: top.roleName,
    p25,
    p50: median,
    p75,
    userExpectedMin: min,
    userExpectedMax: max,
    reality: "in-range",
    message: `你的期望落在 ${top.roleName} 的 P25-P75 区间，定位合理。`,
  };
}

function buildGap(top: RoleMatch | undefined): GapData {
  if (!top) {
    return {
      topRoleName: "—",
      matchedSkills: [],
      missingSkills: [],
      totalRequired: 0,
      matchedCount: 0,
    };
  }
  const totalRequired = top.role.required_skills.length;
  const matchedCount = top.matchedSkills.length;
  // missingSkills 里都是 required_skills，默认至少 mid（"后补"），高频的升 high（"先补"）。
  // 用绝对阈值 3 在低样本聚类（如 operations 95 JD，每 skill count=1）下会全掉到 low
  // 并显示"锦上添花"，对 required 是误导。
  const missingSkills = top.missingSkills.map((s) => ({
    ...s,
    priority: (s.importance >= 10 ? "high" : "mid") as "high" | "mid" | "low",
  }));
  return {
    topRoleName: top.roleName,
    matchedSkills: top.matchedSkills,
    missingSkills,
    totalRequired,
    matchedCount,
  };
}

function buildActions(input: UserInput, topTrack: Track | null): ActionsData {
  const trackName = topTrack?.name || "你的目标主线";
  return {
    d7: [
      "用 Cursor / Claude Code 完成你日常工作中的 1 个小自动化（哪怕只是写邮件脚本）",
      "加入 1 个 AI 学习社群（Datawhale / 即刻 AI Agent 玩家 / 任选）",
    ],
    d30: [
      "完成 Datawhale 一期公益训练营（免费）",
      "在 Dify 或 Coze 上搭一个能跑的 Agent，记录过程",
    ],
    d90: [
      `在 GitHub 或个人主页上展示你的第一个 ${trackName} 方向 AI 项目`,
      "重新做一次本诊断报告，对比你的 Gap 缩小了多少",
    ],
  };
}

export function generateReport(
  input: UserInput,
  roles: Role[],
  skills: Skill[],
  reportId: string,
): Report {
  const allMatches = matchUserToRoles(input, roles, skills);
  // calcTrackScores 走全量匹配，否则 top 3 若不含 track 对应角色，4 主线会全 0
  const trackScores = calcTrackScores(allMatches);

  // 兜底检测：top 1 为 0 说明用户技能与角色 required_skills 完全无交集
  const rawTop = allMatches[0];
  const isFallback = !rawTop || rawTop.matchScore === 0;

  // 兜底推荐方向：优先取用户选的 targetTrack 第一个（非"我不知道"），
  // 否则按 4 主线匹配度里第一个 > 0 的，再否则用默认 A。
  const targetTrackFromInput = (input.targetTrack || [])
    .map((t) => t[0])
    .find((t) => ["A", "B", "C", "D"].includes(t));
  const fallbackTrack = isFallback
    ? TRACKS.find((t) => t.id === targetTrackFromInput) ||
      trackScores.filter((s) => s.score > 0).sort((a, b) => b.score - a.score)[0]?.track ||
      TRACKS[0]
    : null;

  // Fallback 模式下把锚点角色（例如 B 主线 = operations）hoist 到 top，
  // 避免后续 section 以字典序最靠前的 0% 角色（e.g. AI/LLM 工程师）为主角，
  // 让运营用户看到的 Gap/薪资/Top 3 全部围绕错误角色。
  let topMatches = allMatches.slice(0, 3);
  if (isFallback && fallbackTrack) {
    const anchorRoleId = fallbackTrack.roleIds.find((rid) => rid !== "other");
    if (anchorRoleId) {
      const anchor = allMatches.find((m) => m.roleId === anchorRoleId);
      if (anchor) {
        const rest = allMatches.filter((m) => m.roleId !== anchorRoleId);
        topMatches = [anchor, ...rest.slice(0, 2)];
      }
    }
  }
  const top = topMatches[0];

  const topTrack = trackScores
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.track || fallbackTrack || null;
  const generatedAt = new Date().toISOString().slice(0, 10);

  return {
    cover: {
      title: `${input.currentJob || "你"}的 AI 求职定位报告`,
      currentJob: input.currentJob,
      yearsExp: input.yearsExp,
      education: input.education,
      city: input.city,
      trackScores,
      topRoles: topMatches.map((m) => ({
        roleName: m.roleName,
        matchScore: m.matchScore,
      })),
      reportId,
      generatedAt,
    },
    roles: {
      topMatches,
      totalRoles: 14,
      totalJDs: JD_TOTAL,
    },
    salary: buildSalary(input, top),
    gap: buildGap(top),
    paths: { topTrack },
    actions: buildActions(input, topTrack),
    meta: {
      jdTotal: JD_TOTAL,
      rolesTotal: 14,
      generatedAt,
      reportId,
      isFallback,
      fallbackTrack,
    },
  };
}
