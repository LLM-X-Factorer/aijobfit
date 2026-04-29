// UserInput + roles → 7 节报告 JSON

import {
  Role,
  Skill,
  IndustryAugmentedSalary,
  RolesByCity,
  NarrativeStats,
  RolesAugmentedByProfession,
} from "./fetchAgentHunt";
import { UserInput } from "./encoding";
import { matchUserToRoles, RoleMatch, normalizeUserSkills } from "./matching";
import { matchProfession } from "./professionMatch";
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
  route: "A" | "B" | "C";
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
  route: "A" | "B" | "C";
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
  // 城市分层：「你所在新一线 ¥32k vs 全国 ¥30k」对照
  citySalary?: {
    tier: string; // 一线 / 新一线 / 其他国内 / 海外 / 远程
    p25: number;
    p50: number;
    p75: number;
    sampleSize: number;
    jobCount: number;
    nationalP50: number;
    deltaPct: number; // (city.p50 - national.p50) / national.p50 * 100
  };
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
  route: "A" | "B" | "C";
  // 路线 C 兜底：用户填的原职业模糊命中数据但 vacancyCount 太少时给提示
  augmentSparse?: boolean;
}

// 路线 C 专属：把原职业「+ AI 增强」诊断打成一份独立数据块
export interface AugmentTargetData {
  matchedKey: string;
  matchType: "exact" | "fuzzy" | "no-match";
  vacancyCount: number;
  salaryMedian: number;
  salarySampleSize: number;
  topIndustries: { industry: string; industryCN: string; count: number; pct: number }[];
  augmentSkills: { skillId: string; skillName: string; count: number; userHas: boolean }[];
  sampleTitles: string[];
  alternatives: { matchedKey: string; vacancyCount: number; salaryMedian: number }[];
  // 准备度分档：matchedCount / totalCount + 文案
  readiness: {
    tier: "first-class" | "mid" | "starter" | "no-data";
    matchedCount: number;
    totalCount: number;
    label: string;
    message: string;
  };
}

export interface Report {
  cover: CoverData;
  roles: RolesData;
  salary: SalaryData;
  gap: GapData;
  paths: PathsData;
  actions: ActionsData;
  meta: MetaData;
  // 路线 C 专属：留行 + AI 增强诊断目标
  augment?: AugmentTargetData;
}

// JD 总数与角色总数现在从 narrative-stats.json runtime 读，远程不可达时回退到
// 「数据源最低保证」（agent-hunt v0.7 时已经 5673 labeled / 8238 raw）。
const JD_TOTAL_FALLBACK = 5673;

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

// 把用户输入的 city（free text）映射到 roles-by-city 数据集里的 tier。
// 数据本身就有 cities_in_tier 列表，直接 lookup。命中条件：用户输入 contains 城市名。
function inferCityTier(
  userCity: string | undefined,
  byTier: RolesByCity["domestic"][string]["by_tier"] | undefined,
): RolesByCity["domestic"][string]["by_tier"][number] | null {
  if (!userCity || !byTier) return null;
  const c = userCity.trim();
  if (!c) return null;
  for (const t of byTier) {
    if (t.cities_in_tier.some((city) => c.includes(city) || city.includes(c))) return t;
  }
  return null;
}

function buildSalary(
  input: UserInput,
  top: RoleMatch | undefined,
  industrySalary: IndustryAugmentedSalary | null,
  rolesByCity: RolesByCity | null = null,
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
      citySalary: buildCitySalary(input, top, rolesByCity, top.role.salary.median),
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
    citySalary: buildCitySalary(input, top, rolesByCity, top.role.salary.median),
  };
}

function buildCitySalary(
  input: UserInput,
  top: RoleMatch,
  rolesByCity: RolesByCity | null,
  nationalP50: number,
): SalaryData["citySalary"] {
  if (!rolesByCity || !input.city) return undefined;
  const roleEntry = rolesByCity.domestic[top.roleId];
  const tier = inferCityTier(input.city, roleEntry?.by_tier);
  if (!tier || tier.salary.sample_size < 10) return undefined;
  const cityP50 = tier.salary.p50;
  const delta = nationalP50 > 0 ? Math.round(((cityP50 - nationalP50) / nationalP50) * 100) : 0;
  return {
    tier: tier.tier,
    p25: tier.salary.p25,
    p50: cityP50,
    p75: tier.salary.p75,
    sampleSize: tier.salary.sample_size,
    jobCount: tier.job_count,
    nationalP50,
    deltaPct: delta,
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
  rolesByCity: RolesByCity | null = null,
  narrativeStats: NarrativeStats | null = null,
  augmentedByProfession: RolesAugmentedByProfession | null = null,
): Report {
  const route: "A" | "B" | "C" =
    input.route === "B" ? "B" : input.route === "C" ? "C" : "A";

  // labeled_jobs 是「带 cluster 标签的 JD」, all_jobs 是「连未聚类的也算」。报告口径用
  // labeled，与 14 角色聚类口径一致。回退到 5673（agent-hunt v0.7 当前最小值）。
  const jdTotal = narrativeStats?.totals.labeled_jobs ?? JD_TOTAL_FALLBACK;
  // 排除 "other" 聚合桶；roles 是数据原文，不再写死 14。
  const rolesTotal = roles.filter((r) => r.role_id !== "other").length;

  if (route === "C") {
    return generateRouteCReport(
      input,
      skills,
      reportId,
      industrySalary,
      augmentedByProfession,
      jdTotal,
      rolesTotal,
    );
  }

  if (route === "B") {
    return generateRouteBReport(
      input,
      roles,
      skills,
      reportId,
      industrySalary,
      rolesByCity,
      jdTotal,
      rolesTotal,
    );
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
      totalRoles: rolesTotal,
      totalJDs: jdTotal,
      route: "A",
    },
    salary: buildSalary(input, top, industrySalary, rolesByCity),
    gap: buildGap(top),
    paths: { topTrack, audience: audienceTypeFromYears(input.yearsExp) },
    actions: buildActions(input, topTrack),
    meta: {
      jdTotal,
      rolesTotal,
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
  rolesByCity: RolesByCity | null,
  jdTotal: number,
  rolesTotal: number,
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
      totalRoles: rolesTotal,
      totalJDs: jdTotal,
      route: "B",
    },
    salary: buildSalary(input, top, industrySalary, rolesByCity),
    gap: buildGap(top),
    paths: { topTrack: lockedTrack, audience: audienceTypeFromYears(input.yearsExp) },
    actions: buildActions(input, lockedTrack),
    meta: {
      jdTotal,
      rolesTotal,
      generatedAt,
      reportId,
      isFallback,
      fallbackTrack: null,
      route: "B",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 路线 C：留行 + AI 增强诊断
// 用户保留原职业（电气工程师 / 教师 / 销售经理 / ...），把已掌握技能 + 缺的 AI 增强技能
// 对照 roles-augmented-by-profession.json 数据集。报告强调「在原岗位变得更值钱」而不是「转
// 行做 AI 角色」。不出 Top 3，不归 4 主线。
// ─────────────────────────────────────────────────────────────────────────

const AUGMENT_SPARSE_THRESHOLD = 10; // vacancyCount 低于此值视为样本稀疏，给 isFallback 提示

function buildAugmentTarget(
  input: UserInput,
  skills: Skill[],
  augmentedByProfession: RolesAugmentedByProfession | null,
): AugmentTargetData {
  const queryKey = (input.originProfession || input.currentJob || "").trim();
  const result = matchProfession(queryKey, augmentedByProfession);
  const userSkillIds = normalizeUserSkills(input.skills, skills);

  if (!result.best) {
    return {
      matchedKey: queryKey || "—",
      matchType: "no-match",
      vacancyCount: 0,
      salaryMedian: 0,
      salarySampleSize: 0,
      topIndustries: [],
      augmentSkills: [],
      sampleTitles: [],
      alternatives: [],
      readiness: {
        tier: "no-data",
        matchedCount: 0,
        totalCount: 0,
        label: "数据不足",
        message: queryKey
          ? `未在数据集里找到「${queryKey}」的 AI 增强真实 JD。建议改用 Route B 锁定一个 AI 角色诊断。`
          : "未填写原职业，无法做留行诊断。",
      },
    };
  }

  const { matchedKey, entry, matchType } = result.best;
  const augSkills = entry.augmentSkills || [];
  const totalCount = augSkills.length;
  const matched = augSkills.filter((s) => userSkillIds.has(s.skillId));
  const matchedCount = matched.length;

  // 准备度分档：augmentSkills 列表本身偏稀（很多原职业只有 1-2 个），按比例 + 绝对值双口径。
  let tier: AugmentTargetData["readiness"]["tier"];
  let label: string;
  let message: string;
  if (totalCount === 0) {
    tier = "no-data";
    label = "AI 增强技能样本稀少";
    message = `「${matchedKey}」的 AI 增强 JD 还没积累到能稳定提取必备技能。可看 sampleTitles 和 topIndustries 判断方向。`;
  } else if (matchedCount === 0) {
    tier = "starter";
    label = "起步";
    message = `「${matchedKey}」的 AI 增强 JD 一共出现过 ${totalCount} 项 AI 技能，你目前 0 项命中。先补 1-2 个高频项，门槛就上来了。`;
  } else if (matchedCount >= Math.max(1, Math.ceil(totalCount * 0.5))) {
    tier = "first-class";
    label = "第一梯队";
    message = `你已掌握 ${matchedCount}/${totalCount} 项「${matchedKey}」AI 增强 JD 出现的技能，在该原职业 + AI 方向已是头部画像。`;
  } else {
    tier = "mid";
    label = "中梯";
    message = `你掌握 ${matchedCount}/${totalCount} 项「${matchedKey}」AI 增强 JD 关键技能，再补 1-2 项就能进第一梯队。`;
  }

  const totalIndustryCount = entry.topIndustries.reduce((sum, i) => sum + i.count, 0) || 1;

  return {
    matchedKey,
    matchType,
    vacancyCount: entry.vacancyCount,
    salaryMedian: entry.salaryMedian,
    salarySampleSize: entry.salarySampleSize,
    topIndustries: entry.topIndustries.slice(0, 5).map((i) => ({
      industry: i.industry,
      industryCN: INDUSTRY_EN_TO_CN[i.industry] ?? i.industry,
      count: i.count,
      pct: Math.round((i.count / totalIndustryCount) * 100),
    })),
    augmentSkills: augSkills.map((s) => ({
      skillId: s.skillId,
      skillName: skills.find((sk) => sk.id === s.skillId)?.canonical_name ?? s.skillId,
      count: s.count,
      userHas: userSkillIds.has(s.skillId),
    })),
    sampleTitles: entry.sampleTitles.slice(0, 5),
    alternatives: result.alternatives
      .filter((a) => a.matchedKey !== matchedKey)
      .slice(0, 4)
      .map((a) => ({
        matchedKey: a.matchedKey,
        vacancyCount: a.entry.vacancyCount,
        salaryMedian: a.entry.salaryMedian,
      })),
    readiness: {
      tier,
      matchedCount,
      totalCount,
      label,
      message,
    },
  };
}

// 留行版薪资：augmented-by-profession 只有 salaryMedian 单值。优先用「该职业 topIndustries[0]
// + industry-augmented-salary」拿 P25/P75，否则 ±30% 估算。
function buildAugmentSalary(
  input: UserInput,
  augment: AugmentTargetData,
  industrySalary: IndustryAugmentedSalary | null,
): SalaryData {
  if (augment.matchType === "no-match" || augment.salaryMedian === 0) {
    return {
      topRoleName: augment.matchedKey,
      p25: 0,
      p50: 0,
      p75: 0,
      source: "role-national",
      reality: "no-input",
      message: "未匹配到原职业的薪资样本，跳过本节。",
    };
  }

  const median = augment.salaryMedian;
  let p25 = Math.round(median * 0.7);
  let p75 = Math.round(median * 1.3);
  let industrySlice: SalaryData["industrySlice"] | undefined;
  let source: SalaryData["source"] = "role-national";

  // 用原职业 top 行业 + industry-augmented-salary 拿真实 P25/P75
  if (industrySalary && augment.topIndustries.length > 0) {
    const topInd = augment.topIndustries[0];
    const slice = industrySalary.by_industry.find(
      (b) => b.industry === topInd.industry && b.salary_sample_size >= 30,
    );
    if (slice) {
      // 锚定原职业中位 + 行业的离散度（spread）：保留 median，但用 industry slice 的相对幅度
      const spreadDown = slice.p50 > 0 ? slice.p25 / slice.p50 : 0.7;
      const spreadUp = slice.p50 > 0 ? slice.p75 / slice.p50 : 1.3;
      p25 = Math.round(median * spreadDown);
      p75 = Math.round(median * spreadUp);
      industrySlice = {
        industryCN: topInd.industryCN,
        sampleSize: slice.salary_sample_size,
      };
      source = "industry-augmented";
    }
  }

  const min = input.expectedSalaryMin;
  const max = input.expectedSalaryMax;
  const sourceLabel = `${augment.matchedKey} + AI 增强 JD`;

  if (!min && !max) {
    return {
      topRoleName: augment.matchedKey,
      p25,
      p50: median,
      p75,
      source,
      industrySlice,
      reality: "no-input",
      message: `${sourceLabel}：中位月薪 ${median.toLocaleString()} 元，区间 ${p25.toLocaleString()} - ${p75.toLocaleString()}（基于 ${augment.salarySampleSize} 条薪资样本，spread 取自 ${industrySlice?.industryCN ?? "粗估"}）。`,
    };
  }

  const userMid = ((min || 0) + (max || 0)) / 2 * 1000;
  let reality: SalaryData["reality"];
  let message: string;
  if (userMid > p75) {
    reality = "above";
    message = `你的期望（约 ${userMid.toLocaleString()} 元）高于 ${sourceLabel} 的 P75（${p75.toLocaleString()}）。`;
  } else if (userMid < p25) {
    reality = "below";
    message = `你的期望（约 ${userMid.toLocaleString()} 元）低于 ${sourceLabel} 的 P25（${p25.toLocaleString()}），市场实际可以更高。`;
  } else {
    reality = "in-range";
    message = `你的期望落在 ${sourceLabel} 的 P25-P75 区间，定位合理。`;
  }
  const rate = achievementRateFor(userMid, p25, median, p75);
  const achMsg = achievementMessageFor(rate, userMid, median, p75);

  return {
    topRoleName: augment.matchedKey,
    p25,
    p50: median,
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

function buildAugmentGap(augment: AugmentTargetData): GapData {
  if (augment.augmentSkills.length === 0) {
    return {
      topRoleName: augment.matchedKey,
      matchedSkills: [],
      missingSkills: [],
      totalRequired: 0,
      matchedCount: 0,
    };
  }
  const matched = augment.augmentSkills.filter((s) => s.userHas).map((s) => s.skillName);
  const missing = augment.augmentSkills
    .filter((s) => !s.userHas)
    .sort((a, b) => b.count - a.count)
    .map((s) => ({
      name: s.skillName,
      importance: s.count,
      // augmentSkills 本身就是该职业 AI 增强 JD 必出现的高价值技能，全部按 high 优先
      priority: "high" as const,
    }));
  return {
    topRoleName: augment.matchedKey,
    matchedSkills: matched,
    missingSkills: missing,
    totalRequired: augment.augmentSkills.length,
    matchedCount: matched.length,
  };
}

function buildAugmentActions(input: UserInput, augment: AugmentTargetData): ActionsData {
  const audience = audienceTypeFromYears(input.yearsExp);
  const profession = augment.matchedKey;
  const topInd = augment.topIndustries[0]?.industryCN || "你的目标行业";
  const topMissing = augment.augmentSkills
    .filter((s) => !s.userHas)
    .sort((a, b) => b.count - a.count)[0]?.skillName;
  const skillNudge = topMissing
    ? `锁定 1 个 AI 工具（推荐：${topMissing}）`
    : "锁定 1 个 AI 工具（Cursor / Claude Code / Dify 任选）";

  if (audience === "fresh-grad") {
    return {
      d7: [
        skillNudge,
        `把上面的 sampleTitles 作为搜索关键词，去看准 / Boss 直聘各搜 5 条「${profession} + AI」实习/校招岗位看 JD`,
      ],
      d30: [
        `用 ${topMissing || "一个 AI 工具"} 做一个 ${profession} 场景的小项目（自动写报告 / 整理课件 / 处理数据）`,
        "在简历里加一行：用 X 工具完成了 Y 工作流的自动化",
      ],
      d90: [
        `投出第一批「${profession} + AI 增强」校招简历，跑 5 个面试拿反馈`,
        "重新做本诊断，看 augmentSkills 命中率是否上来",
      ],
    };
  }

  return {
    d7: [
      skillNudge,
      `把当前工作的 1 个重复任务用 AI 工具改造，记录耗时变化`,
    ],
    d30: [
      `用 ${topMissing || "AI 工具"} 在 ${topInd} 场景做一个小自动化（要能演示给同事 / 上级看）`,
      `去看准 / Boss 直聘搜「${profession} + AI」JD 5 条，对照自己的简历，标出还缺什么`,
    ],
    d90: [
      `把 30 天里做的 AI 改造写进简历 + 内部述职 / 周报，让公司看到你的 AI 杠杆`,
      `重新做本诊断，看你的 augmentSkills 命中率是否从 ${augment.readiness.matchedCount}/${augment.readiness.totalCount} 上来`,
    ],
  };
}

function generateRouteCReport(
  input: UserInput,
  skills: Skill[],
  reportId: string,
  industrySalary: IndustryAugmentedSalary | null,
  augmentedByProfession: RolesAugmentedByProfession | null,
  jdTotal: number,
  rolesTotal: number,
): Report {
  const augment = buildAugmentTarget(input, skills, augmentedByProfession);
  const generatedAt = new Date().toISOString().slice(0, 10);
  const augmentSparse =
    augment.matchType === "no-match" ||
    (augment.vacancyCount > 0 && augment.vacancyCount < AUGMENT_SPARSE_THRESHOLD);

  const title =
    augment.matchType === "no-match"
      ? "AI 求职诊断 · 留行版"
      : `${augment.matchedKey} + AI 增强：${augment.vacancyCount} 条真实 JD 在招`;

  return {
    cover: {
      title,
      currentJob: input.currentJob,
      yearsExp: input.yearsExp,
      education: input.education,
      city: input.city,
      trackScores: [],
      topRoles: [],
      reportId,
      generatedAt,
      route: "C",
      industryContext: buildIndustryContext(input, industrySalary),
    },
    roles: {
      topMatches: [],
      totalRoles: rolesTotal,
      totalJDs: jdTotal,
      route: "C",
    },
    salary: buildAugmentSalary(input, augment, industrySalary),
    gap: buildAugmentGap(augment),
    paths: { topTrack: null, audience: audienceTypeFromYears(input.yearsExp) },
    actions: buildAugmentActions(input, augment),
    meta: {
      jdTotal,
      rolesTotal,
      generatedAt,
      reportId,
      isFallback: augment.matchType === "no-match",
      fallbackTrack: null,
      route: "C",
      augmentSparse,
    },
    augment,
  };
}
