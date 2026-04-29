// UserInput + roles → 7 节报告 JSON

import { Role, Skill, IndustryAugmentedSalary } from "./fetchAgentHunt";
import { UserInput } from "./encoding";
import { matchUserToRoles, RoleMatch } from "./matching";
import { TRACKS, Track } from "@/data/tracks";
import { AudienceType, audienceTypeFromYears } from "./audience";
import { inferIndustryFromProfession } from "@/data/profession-to-industry";

// 与 matching.ts 同表，保持就地映射避免循环依赖
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
  telecom: "通信",
};

// 用户的行业信号 = 表单 industry + currentJob 推断（去重）
function userIndustriesEN(input: UserInput): string[] {
  const fromForm = (input.industry || [])
    .filter((i) => i && i !== "其他" && i.trim())
    .map((cn) => INDUSTRY_CN_TO_EN[cn])
    .filter((v): v is string => Boolean(v));
  const inferred = inferIndustryFromProfession(input.currentJob);
  return inferred ? Array.from(new Set([...fromForm, inferred])) : fromForm;
}

export interface CoverData {
  title: string;
  currentJob: string;
  yearsExp: string;
  education: string;
  city?: string;
  trackScores: { track: Track; score: number }[]; // 4 主线匹配度（路线 B 时为空）
  topRoles: { roleName: string; matchScore: number }[];
  reportId: string;
  generatedAt: string;
  route: "A" | "B";
  // 路线 B：用户锁定的目标
  lockedTarget?: { industry?: string; roleName: string };
  // 用户行业 → AI 增强 JD 切片，让封面带行业 context（"教育行业 59 条 AI 增强 JD"）
  industryContext?: {
    industryCN: string;
    industryEN: string;
    jobCount: number;
    salarySampleSize: number;
    inferred: boolean; // 来自 currentJob 推断而非表单
  };
}

export interface RolesData {
  topMatches: RoleMatch[];
  totalRoles: number;
  totalJDs: number;
  route: "A" | "B";
}

export interface SalaryData {
  topRoleName: string;
  p25: number;
  p50: number;
  p75: number;
  // 当 p25/p50/p75 来自行业切片而非角色全国时，标注切片来源
  source: "role-national" | "industry-augmented";
  industrySlice?: {
    industryCN: string;
    sampleSize: number;
  };
  userExpectedMin?: number;
  userExpectedMax?: number;
  reality: "above" | "below" | "in-range" | "no-input";
  message: string;
  // 期望薪资达成概率（基于 percentile 桶）
  achievementRate?: number; // 0-100
  achievementMessage?: string;
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
  audience: AudienceType;
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
  route: "A" | "B";
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

// 期望薪资达成概率：把用户期望中位与 P25/P50/P75 桶对照，给一个粗粒度落点。
// 不是真正的 CDF，只是诚实告诉用户「你期望相对市场分布在哪个段」。
function achievementRateFor(userMid: number, p25: number, p50: number, p75: number): number {
  if (userMid <= p25) return 75;
  if (userMid <= p50) return 50;
  if (userMid <= p75) return 25;
  if (userMid <= p75 * 1.3) return 10;
  return 5;
}

function achievementMessageFor(rate: number, userMid: number, p50: number, p75: number): string {
  const userMidK = Math.round(userMid / 1000);
  const p50K = Math.round(p50 / 1000);
  const p75K = Math.round(p75 / 1000);
  if (rate >= 75)
    return `约 ${rate}% 岗位能开到你期望的 ¥${userMidK}k —— 落在 P25 以下，门槛较低，重点放在拿到 offer 而不是议价。`;
  if (rate >= 50)
    return `约 ${rate}% 岗位能开到你期望的 ¥${userMidK}k —— 落在 P25-P50 之间（中位 ¥${p50K}k），是合理目标。`;
  if (rate >= 25)
    return `约 ${rate}% 岗位能开到你期望的 ¥${userMidK}k —— 落在 P50-P75 上半区（P75 ¥${p75K}k），需要稀缺技能 / 行业 know-how。`;
  if (rate >= 10)
    return `约 ${rate}% 岗位能开到你期望的 ¥${userMidK}k —— 略高于 P75（中位 ¥${p50K}k），建议下调期望 20% 或加强深度技能。`;
  return `约 ${rate}% 岗位能开到你期望的 ¥${userMidK}k —— 显著高于市场 P75 ¥${p75K}k，建议重新校准，或锁定垂直行业（金融 / 医疗）头部岗位。`;
}

function buildSalary(
  input: UserInput,
  top: RoleMatch | undefined,
  industrySalary: IndustryAugmentedSalary | null,
): SalaryData {
  if (!top) {
    return {
      topRoleName: "—",
      p25: 0,
      p50: 0,
      p75: 0,
      source: "role-national",
      reality: "no-input",
      message: "暂无足够数据",
    };
  }

  // 默认用角色全国分布。当用户行业（form + 推断）有匹配的切片且 sample_size 足够时，
  // 替换为「该行业 AI 增强真实 JD」分布 —— 让金融用户看到金融 30k 中位，而不是泛 25k。
  let p25 = top.role.salary.p25;
  let p50 = top.role.salary.median;
  let p75 = top.role.salary.p75;
  let source: SalaryData["source"] = "role-national";
  let industrySlice: SalaryData["industrySlice"] | undefined;

  const userIndsEN = userIndustriesEN(input);
  if (industrySalary && userIndsEN.length > 0) {
    const matched = industrySalary.by_industry.find(
      (b) => userIndsEN.includes(b.industry) && b.salary_sample_size >= 30,
    );
    if (matched) {
      p25 = matched.p25;
      p50 = matched.p50;
      p75 = matched.p75;
      source = "industry-augmented";
      industrySlice = {
        industryCN: INDUSTRY_EN_TO_CN[matched.industry] ?? matched.industry,
        sampleSize: matched.salary_sample_size,
      };
    }
  }

  const min = input.expectedSalaryMin;
  const max = input.expectedSalaryMax;
  const sourceLabel = industrySlice
    ? `${industrySlice.industryCN}行业 AI 增强 JD`
    : `${top.roleName} 全国`;

  if (!min && !max) {
    return {
      topRoleName: top.roleName,
      p25,
      p50,
      p75,
      source,
      industrySlice,
      reality: "no-input",
      message: `${sourceLabel}：中位月薪 ${p50.toLocaleString()} 元，区间 ${p25.toLocaleString()} - ${p75.toLocaleString()}。`,
    };
  }

  const userMid = ((min || 0) + (max || 0)) / 2 * 1000; // K → 元

  let reality: SalaryData["reality"];
  let message: string;
  if (userMid > p75) {
    reality = "above";
    message = `你的期望（约 ${userMid.toLocaleString()} 元）高于 ${sourceLabel} 的 P75（${p75.toLocaleString()}）。要达成需要进入 Top 25%。`;
  } else if (userMid < p25) {
    reality = "below";
    message = `你的期望（约 ${userMid.toLocaleString()} 元）低于 ${sourceLabel} 的 P25（${p25.toLocaleString()}），市场实际可以更高。`;
  } else {
    reality = "in-range";
    message = `你的期望落在 ${sourceLabel} 的 P25-P75 区间，定位合理。`;
  }

  const rate = achievementRateFor(userMid, p25, p50, p75);
  const achMsg = achievementMessageFor(rate, userMid, p50, p75);

  return {
    topRoleName: top.roleName,
    p25,
    p50,
    p75,
    source,
    industrySlice,
    userExpectedMin: min,
    userExpectedMax: max,
    reality,
    message,
    achievementRate: rate,
    achievementMessage: achMsg,
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
  const audience = audienceTypeFromYears(input.yearsExp);
  if (audience === "fresh-grad") {
    return {
      d7: [
        "用 Cursor / Claude Code 完成 1 个小自动化（写邮件脚本、整理课件、爬数据都行）",
        "加入 1 个 AI 校招 / 实习社群（看准 / 牛客 / 即刻 AI Agent 玩家 / 任选）",
      ],
      d30: [
        "完成 Datawhale 一期公益训练营（免费）",
        "投出第一份 AI 实习 / 校招简历，跑 3-5 个真实面试拿反馈",
      ],
      d90: [
        `1 段 AI 实习经验或 1 个能演示的 ${trackName} 项目，进入秋招 / 春招`,
        "重新做一次本诊断报告，对比你的 Gap 缩小了多少",
      ],
    };
  }
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

function buildIndustryContext(
  input: UserInput,
  industrySalary: IndustryAugmentedSalary | null,
): CoverData["industryContext"] {
  if (!industrySalary) return undefined;
  const fromForm = (input.industry || [])
    .filter((i) => i && i !== "其他" && i.trim())
    .map((cn) => INDUSTRY_CN_TO_EN[cn])
    .filter((v): v is string => Boolean(v));
  const inferred = inferIndustryFromProfession(input.currentJob);
  const candidate = fromForm[0] || inferred || null;
  if (!candidate) return undefined;
  const slice = industrySalary.by_industry.find((b) => b.industry === candidate);
  if (!slice) return undefined;
  return {
    industryCN: INDUSTRY_EN_TO_CN[candidate] ?? candidate,
    industryEN: candidate,
    jobCount: slice.job_count,
    salarySampleSize: slice.salary_sample_size,
    inferred: !fromForm.includes(candidate),
  };
}

export function generateReport(
  input: UserInput,
  roles: Role[],
  skills: Skill[],
  reportId: string,
  industrySalary: IndustryAugmentedSalary | null = null,
): Report {
  const route: "A" | "B" = input.route === "B" ? "B" : "A";

  if (route === "B") {
    return generateRouteBReport(input, roles, skills, reportId, industrySalary);
  }

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

  // 行业切片：先尝试 in-industry 优先排序。把用户行业（form + 推断）与角色 Top 3 行业
  // 求交，至少有 3 个 in-industry 角色才用切片，否则保留全量 Top 3 防止数据过稀。
  const userIndsEN = userIndustriesEN(input);
  const inIndustry =
    userIndsEN.length > 0
      ? allMatches.filter((m) => {
          const top3 = (m.role.top_industries || []).slice(0, 3).map((t) => t.industry);
          return userIndsEN.some((en) => top3.includes(en));
        })
      : [];

  // Fallback 模式下把锚点角色（例如 B 主线 = operations）hoist 到 top，
  // 避免后续 section 以字典序最靠前的 0% 角色（e.g. AI/LLM 工程师）为主角，
  // 让运营用户看到的 Gap/薪资/Top 3 全部围绕错误角色。
  let topMatches =
    inIndustry.length >= 3 ? inIndustry.slice(0, 3) : allMatches.slice(0, 3);
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
      route: "A",
      industryContext: buildIndustryContext(input, industrySalary),
    },
    roles: {
      topMatches,
      totalRoles: 14,
      totalJDs: JD_TOTAL,
      route: "A",
    },
    salary: buildSalary(input, top, industrySalary),
    gap: buildGap(top),
    paths: { topTrack, audience: audienceTypeFromYears(input.yearsExp) },
    actions: buildActions(input, topTrack),
    meta: {
      jdTotal: JD_TOTAL,
      rolesTotal: 14,
      generatedAt,
      reportId,
      isFallback,
      fallbackTrack,
      route: "A",
    },
  };
}

// 路线 B：用户锁定行业 + 岗位，仅诊断该锁定角色的匹配率
function generateRouteBReport(
  input: UserInput,
  roles: Role[],
  skills: Skill[],
  reportId: string,
  industrySalary: IndustryAugmentedSalary | null,
): Report {
  const lockedRoleId = input.targetRoleId || "";
  const matches = matchUserToRoles(input, roles, skills, { lockedRoleId });
  const top = matches[0];
  const lockedTrack = TRACKS.find((t) => t.roleIds.includes(lockedRoleId)) || null;
  const generatedAt = new Date().toISOString().slice(0, 10);
  const lockedIndustry = (input.industry || []).find((i) => i && i !== "其他");

  // 路线 B 不做兜底锚点切换 — 用户已锁，不替换。0 命中由 whyMatched 诚实告知。
  const isFallback = false;

  return {
    cover: {
      title: top
        ? `你能不能上「${lockedIndustry ? lockedIndustry + " · " : ""}${top.roleName}」`
        : "AI 求职目标 Gap 诊断",
      currentJob: input.currentJob,
      yearsExp: input.yearsExp,
      education: input.education,
      city: input.city,
      trackScores: [],
      topRoles: top
        ? [{ roleName: top.roleName, matchScore: top.matchScore }]
        : [],
      reportId,
      generatedAt,
      route: "B",
      lockedTarget: top
        ? { industry: lockedIndustry, roleName: top.roleName }
        : undefined,
      industryContext: buildIndustryContext(input, industrySalary),
    },
    roles: {
      topMatches: matches,
      totalRoles: 14,
      totalJDs: JD_TOTAL,
      route: "B",
    },
    salary: buildSalary(input, top, industrySalary),
    gap: buildGap(top),
    paths: { topTrack: lockedTrack, audience: audienceTypeFromYears(input.yearsExp) },
    actions: buildActions(input, lockedTrack),
    meta: {
      jdTotal: JD_TOTAL,
      rolesTotal: 14,
      generatedAt,
      reportId,
      isFallback,
      fallbackTrack: null,
      route: "B",
    },
  };
}
