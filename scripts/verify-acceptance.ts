// Acceptance verification for P0/P1 + P2 refactor.
// Run: npx tsx scripts/verify-acceptance.ts
//
// P0/P1 cases:
//  C1 「电气工程师 + 教育」不应推 AI 销售
//  C2 「教育 + 产品经理」市场全景只展示教育切片
//  C3 期望 35k 应该看到「约 X% 岗位能开到」
//  C4 JD 总数应 ~8000+ 不是 2370
//
// P2 留行 cases:
//  C5 电气工程师留行 — 不推 AI 销售，看到原职业 + 增强诊断
//  C6 产品经理留行 — augmentSkills 命中度
//  C7 教师留行 — readiness 档位
//
// P2 应届 cases:
//  C8 应届无实习 + Route A 推荐 — gradContext / gradBreakdown / freshComparison 是否注入
//  C9 在读学生 + Route B 锁定 — fresh slice 替换显示
//
// Pulls live agent-hunt data, runs generateReport, and prints key fields.

import { generateReport } from "../src/lib/reportGen";
import {
  fetchRoles,
  fetchSkills,
  fetchIndustryAugmentedSalary,
  fetchRolesByCity,
  fetchNarrativeStats,
  fetchRolesAugmentedByProfession,
  fetchRolesGraduateFriendly,
} from "../src/lib/fetchAgentHunt";
import type { UserInput } from "../src/lib/encoding";

const BANNER = "─".repeat(80);

function print(label: string, value: unknown) {
  console.log(`  ${label}:`, typeof value === "object" ? JSON.stringify(value) : value);
}

async function main() {
  const [
    roles,
    skills,
    industrySalary,
    rolesByCity,
    narrativeStats,
    augmentedByProfession,
    gradFriendly,
  ] = await Promise.all([
    fetchRoles(),
    fetchSkills(),
    fetchIndustryAugmentedSalary(),
    fetchRolesByCity(),
    fetchNarrativeStats(),
    fetchRolesAugmentedByProfession(),
    fetchRolesGraduateFriendly(),
  ]);

  const baseInput: UserInput = {
    currentJob: "",
    yearsExp: "3-5",
    education: "本科",
    city: "上海",
    skills: ["Python", "Data Analysis", "数据分析"],
    targetTrack: ["A · AI 产品经理"],
    industry: [],
    expectedSalaryMin: 0,
    expectedSalaryMax: 0,
  };

  // ── C1 「电气工程师 + 教育」不应推 AI 销售 ──────────────────────────
  console.log(BANNER);
  console.log("C1 · 电气工程师 + 教育行业");
  const c1: UserInput = {
    ...baseInput,
    currentJob: "电气工程师",
    industry: ["教育"],
    skills: ["AutoCAD", "电路设计", "PLC"],
  };
  const r1 = generateReport(
    c1,
    roles,
    skills,
    "C1TEST",
    industrySalary,
    rolesByCity,
    narrativeStats,
    augmentedByProfession,
    gradFriendly,
  );
  print("Top 3 角色", r1.cover.topRoles);
  print("行业 context", r1.cover.industryContext);
  const hasAISales = r1.cover.topRoles.some((r) => /销售|sales/i.test(r.roleName));
  print("✓ 没推 AI 销售？", !hasAISales);

  // ── C2 「教育 + 产品经理」 ─────────────────────────────────────
  console.log(BANNER);
  console.log("C2 · 教育 + 产品经理（路线 B 锁定）");
  const c2: UserInput = {
    ...baseInput,
    currentJob: "产品经理",
    industry: ["教育"],
    skills: ["产品经理", "用户研究", "Python"],
    route: "B",
    targetRoleId: "product_manager",
  };
  const r2 = generateReport(
    c2,
    roles,
    skills,
    "C2TEST",
    industrySalary,
    rolesByCity,
    narrativeStats,
    augmentedByProfession,
    gradFriendly,
  );
  print("封面标题", r2.cover.title);
  print("行业 context", r2.cover.industryContext);
  print("薪资 source", r2.salary.source);
  print("薪资 industrySlice", r2.salary.industrySlice);
  print("薪资 P25/P50/P75", `${r2.salary.p25} / ${r2.salary.p50} / ${r2.salary.p75}`);

  // ── C3 期望 35k 看到达成率 ──────────────────────────────────
  console.log(BANNER);
  console.log("C3 · 期望 35k 达成概率");
  const c3: UserInput = {
    ...baseInput,
    currentJob: "运营",
    industry: ["金融"],
    skills: ["Python", "数据分析"],
    expectedSalaryMin: 30,
    expectedSalaryMax: 40,
    route: "B",
    targetRoleId: "product_manager",
  };
  const r3 = generateReport(
    c3,
    roles,
    skills,
    "C3TEST",
    industrySalary,
    rolesByCity,
    narrativeStats,
    augmentedByProfession,
    gradFriendly,
  );
  print("薪资 source", r3.salary.source);
  print("薪资 industrySlice", r3.salary.industrySlice);
  print("薪资 P25/P50/P75", `${r3.salary.p25} / ${r3.salary.p50} / ${r3.salary.p75}`);
  print("用户期望中位 (元)", ((r3.salary.userExpectedMin || 0) + (r3.salary.userExpectedMax || 0)) / 2 * 1000);
  print("achievementRate", r3.salary.achievementRate);
  print("achievementMessage", r3.salary.achievementMessage);
  print("citySalary", r3.salary.citySalary);

  // ── C4 JD 总数 ──────────────────────────────────────────
  console.log(BANNER);
  console.log("C4 · JD 总数 / 角色总数");
  print("meta.jdTotal", r1.meta.jdTotal);
  print("meta.rolesTotal", r1.meta.rolesTotal);
  print("narrativeStats.totals", narrativeStats?.totals);

  // ── C5 电气工程师留行（Route C） ──────────────────────────
  console.log(BANNER);
  console.log("C5 · 电气工程师留行（Route C）");
  const c5: UserInput = {
    ...baseInput,
    currentJob: "电气工程师",
    skills: ["AutoCAD", "电路设计", "PLC"],
    route: "C",
    originProfession: "电气工程师",
  };
  const r5 = generateReport(
    c5,
    roles,
    skills,
    "C5TEST",
    industrySalary,
    rolesByCity,
    narrativeStats,
    augmentedByProfession,
    gradFriendly,
  );
  print("封面标题", r5.cover.title);
  print("matchedKey", r5.augment?.matchedKey);
  print("matchType", r5.augment?.matchType);
  print("vacancyCount", r5.augment?.vacancyCount);
  print("salaryMedian", r5.augment?.salaryMedian);
  print("readiness", r5.augment?.readiness);
  print("topIndustries (top 2)", r5.augment?.topIndustries.slice(0, 2));
  print("augmentSkills (top 5)", r5.augment?.augmentSkills.slice(0, 5));
  print("sampleTitles (top 3)", r5.augment?.sampleTitles.slice(0, 3));

  // ── C6 产品经理留行 + Python（Route C），用户已有 augmentSkill 命中 ──
  console.log(BANNER);
  console.log("C6 · 产品经理留行 · 已掌握 Python/llm（Route C）");
  const c6: UserInput = {
    ...baseInput,
    currentJob: "产品经理",
    skills: ["Python", "Data Analysis", "ChatGPT"],
    route: "C",
    originProfession: "产品经理",
  };
  const r6 = generateReport(
    c6,
    roles,
    skills,
    "C6TEST",
    industrySalary,
    rolesByCity,
    narrativeStats,
    augmentedByProfession,
    gradFriendly,
  );
  print("matchedKey", r6.augment?.matchedKey);
  print("readiness", r6.augment?.readiness);
  print("命中 augmentSkills", r6.augment?.augmentSkills.filter((s) => s.userHas).map((s) => s.skillName));
  print("缺的 augmentSkills", r6.augment?.augmentSkills.filter((s) => !s.userHas).map((s) => s.skillName));
  print("salary p25/p50/p75", `${r6.salary.p25} / ${r6.salary.p50} / ${r6.salary.p75}`);
  print("salary source", r6.salary.source);

  // ── C7 教师留行（Route C） ──────────────────────────
  console.log(BANNER);
  console.log("C7 · 教师留行（Route C）");
  const c7: UserInput = {
    ...baseInput,
    currentJob: "教师",
    industry: ["教育"],
    skills: ["教学设计", "PPT"],
    expectedSalaryMin: 18,
    expectedSalaryMax: 25,
    route: "C",
    originProfession: "教师",
  };
  const r7 = generateReport(
    c7,
    roles,
    skills,
    "C7TEST",
    industrySalary,
    rolesByCity,
    narrativeStats,
    augmentedByProfession,
    gradFriendly,
  );
  print("封面标题", r7.cover.title);
  print("matchedKey", r7.augment?.matchedKey);
  print("vacancyCount", r7.augment?.vacancyCount);
  print("topIndustries (top 3)", r7.augment?.topIndustries.slice(0, 3));
  print("readiness", r7.augment?.readiness);
  print("achievementRate", r7.salary.achievementRate);
  print("achievementMessage", r7.salary.achievementMessage);
  print("第 6 节 d7 actions", r7.actions.d7);

  // ── C8 应届无实习 + Route A 推荐 ───────────────────────────
  console.log(BANNER);
  console.log("C8 · 应届无实习 + Python（Route A）");
  const c8: UserInput = {
    ...baseInput,
    currentJob: "在校学生",
    yearsExp: "应届生（无实习）",
    education: "本科",
    skills: ["Python", "Data Analysis", "ChatGPT", "Prompt Engineering"],
    targetTrack: ["A · AI 产品经理"],
    industry: ["互联网"],
  };
  const r8 = generateReport(
    c8,
    roles,
    skills,
    "C8TEST",
    industrySalary,
    rolesByCity,
    narrativeStats,
    augmentedByProfession,
    gradFriendly,
  );
  print("Top 3", r8.cover.topRoles.map((r) => `${r.roleName} ${r.matchScore}%`));
  print("audience", r8.paths.audience);
  print("gradContext", r8.cover.gradContext);
  print("gradBreakdown", r8.roles.gradBreakdown);
  print("freshComparison", r8.salary.freshComparison);

  // ── CT 主线指纹：「我会剪映就推 AIGC？」业务方质疑 ──────────
  console.log(BANNER);
  console.log("CT · 主线指纹：剪映 / Stable Diffusion 应触发 D 主线 reasoning");
  const ct: UserInput = {
    ...baseInput,
    currentJob: "短视频剪辑师",
    yearsExp: "1-3",
    education: "本科",
    skills: ["剪映", "Stable Diffusion", "Midjourney"],
    targetTrack: ["我不知道"], // 不显式选主线
    industry: ["互联网"],
  };
  const rt = generateReport(
    ct,
    roles,
    skills,
    "CTTEST",
    industrySalary,
    rolesByCity,
    narrativeStats,
    augmentedByProfession,
    gradFriendly,
  );
  print("Top 3", rt.cover.topRoles.map((r) => `${r.roleName} ${r.matchScore}%`));
  print("cover.trackFingerprints", rt.cover.trackFingerprints);
  for (const m of rt.roles.topMatches.slice(0, 2)) {
    console.log(`  ─ ${m.roleName}:`);
    console.log(`     trackFingerprint:`, m.whyMatched.trackFingerprint);
    const fpReason = m.whyMatched.reasoning.find((r) => r.includes("主线指纹"));
    if (fpReason) console.log(`     reasoning含指纹: ${fpReason.slice(0, 120)}...`);
  }

  // ── C9 在读学生 + Route B 锁定 algorithm ────────────────
  console.log(BANNER);
  console.log("C9 · 在读学生 + Route B 锁定 algorithm");
  const c9: UserInput = {
    ...baseInput,
    currentJob: "在读硕士",
    yearsExp: "在读学生",
    education: "硕士",
    skills: ["Python", "PyTorch", "数据分析"],
    industry: [],
    route: "B",
    targetRoleId: "algorithm",
  };
  const r9 = generateReport(
    c9,
    roles,
    skills,
    "C9TEST",
    industrySalary,
    rolesByCity,
    narrativeStats,
    augmentedByProfession,
    gradFriendly,
  );
  print("封面标题", r9.cover.title);
  print("audience", r9.paths.audience);
  print("gradContext.roleName", r9.cover.gradContext?.roleName);
  print("gradContext fresh ¥k", r9.cover.gradContext?.freshSalaryMedian);
  print("gradContext social ¥k", r9.cover.gradContext?.socialSalaryMedian);
  print("gradContext deltaPct", r9.cover.gradContext?.deltaPct);
  print("gradContext topCampusCities", r9.cover.gradContext?.topCampusCities);
  print("gradBreakdown", r9.roles.gradBreakdown);

  console.log(BANNER);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
