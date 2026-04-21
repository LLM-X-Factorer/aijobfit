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
  // 优先级：count >= 10 → high；3-9 → mid；< 3 → low
  const missingSkills = top.missingSkills.map((s) => ({
    ...s,
    priority: (s.importance >= 10 ? "high" : s.importance >= 3 ? "mid" : "low") as
      | "high"
      | "mid"
      | "low",
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
  const matches = matchUserToRoles(input, roles, skills);
  const top = matches[0];
  const trackScores = calcTrackScores(matches);
  const topTrack = trackScores
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.track || null;
  const generatedAt = new Date().toISOString().slice(0, 10);

  return {
    cover: {
      title: `${input.currentJob || "你"}的 AI 求职定位报告`,
      currentJob: input.currentJob,
      yearsExp: input.yearsExp,
      education: input.education,
      city: input.city,
      trackScores,
      topRoles: matches.map((m) => ({
        roleName: m.roleName,
        matchScore: m.matchScore,
      })),
      reportId,
      generatedAt,
    },
    roles: {
      topMatches: matches,
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
    },
  };
}
