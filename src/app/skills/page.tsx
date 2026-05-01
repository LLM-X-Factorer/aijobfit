import type { Metadata } from "next";
import Link from "next/link";
import { loadRoles, loadSkills } from "@/lib/serverData";
import type { Role, Skill } from "@/lib/fetchAgentHunt";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

export const revalidate = 3600;

interface MatrixCell {
  pct: number;
  required: number;
  preferred: number;
  total: number;
}

function colorFor(pct: number): string {
  if (pct <= 0) return "#f8fafc";
  if (pct < 0.02) return "#eff6ff";
  if (pct < 0.05) return "#dbeafe";
  if (pct < 0.1) return "#93c5fd";
  if (pct < 0.2) return "#3b82f6";
  if (pct < 0.4) return "#1d4ed8";
  return "#1e3a8a";
}

function textColorFor(pct: number): string {
  return pct >= 0.1 ? "#ffffff" : "#1e293b";
}

function buildMatrix(roles: Role[], skills: Skill[]) {
  const matrix: Record<string, Record<string, MatrixCell>> = {};
  for (const skill of skills) {
    matrix[skill.id] = {};
    for (const role of roles) {
      const req = role.required_skills?.find((s) => s.skill_id === skill.id)?.count || 0;
      const pref = role.preferred_skills?.find((s) => s.skill_id === skill.id)?.count || 0;
      const total = req + pref;
      const pct = role.job_count > 0 ? total / role.job_count : 0;
      matrix[skill.id][role.role_id] = { pct, required: req, preferred: pref, total };
    }
  }
  return matrix;
}

export const metadata: Metadata = {
  title: "AI 求职 35 技能 × 14 角色矩阵 · 一图看全国内 AI 岗位技能要求",
  description:
    "AIJobFit 把 5673 条已聚类的国内真实 AI 招聘 JD 拆出 35 项 AI 通用技能 × 14 个 AI 角色聚类的命中矩阵。一张可视化 heatmap 直接告诉你：每个 AI 角色 top 5 必备技能是什么、每项技能在哪 3 个 AI 角色出现频次最高。开源数据集，可被 AI 引擎和研究者直接引用。",
  alternates: { canonical: "/skills" },
  openGraph: {
    title: "AI 求职 35 技能 × 14 角色矩阵",
    description: "5673 条真实 JD 聚类拆出的技能-角色命中 heatmap。",
    type: "article",
    url: "/skills",
    images: [
      { url: "/api/og", width: 1200, height: 630 },
      { url: "/api/og-square", width: 800, height: 800 },
    ],
  },
};

export default async function SkillsPage() {
  const [allRoles, allSkills] = await Promise.all([loadRoles(), loadSkills()]);
  const roles = allRoles.filter((r) => r.role_id !== "other");

  const refSkillIds = new Set<string>();
  for (const role of roles) {
    role.required_skills?.forEach((s) => refSkillIds.add(s.skill_id));
    role.preferred_skills?.forEach((s) => refSkillIds.add(s.skill_id));
  }
  const skills = allSkills
    .filter((s) => refSkillIds.has(s.id))
    .sort((a, b) => (b.domestic_count || 0) - (a.domestic_count || 0));

  const matrix = buildMatrix(roles, skills);

  const skillTopRoles = skills.map((skill) => {
    const top = roles
      .map((role) => ({ role, cell: matrix[skill.id][role.role_id] }))
      .filter((x) => x.cell.total > 0)
      .sort((a, b) => b.cell.pct - a.cell.pct)
      .slice(0, 3);
    return { skill, top };
  });

  const roleTopSkills = roles.map((role) => {
    const top = skills
      .map((skill) => ({ skill, cell: matrix[skill.id][role.role_id] }))
      .filter((x) => x.cell.total > 0)
      .sort((a, b) => b.cell.total - a.cell.total)
      .slice(0, 5);
    return { role, top };
  });

  // SVG layout
  const cellW = 52;
  const cellH = 28;
  const labelW = 200;
  const headerH = 140;
  const matrixW = cellW * roles.length;
  const matrixH = cellH * skills.length;
  const totalW = labelW + matrixW;
  const totalH = headerH + matrixH;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `AI 求职 ${skills.length} 技能 × ${roles.length} 角色矩阵`,
    description: `5673 条已聚类国内真实 AI 招聘 JD 拆出的技能 × 角色命中 heatmap。${skills.length} 项 AI 通用技能 × ${roles.length} 个 AI 角色聚类，cell 颜色深度 = 该技能在该角色 JD 中的命中率。`,
    datePublished: "2026-05-01",
    dateModified: new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    publisher: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/skills`,
    image: `${SITE_URL}/api/og`,
    isBasedOn: {
      "@type": "Dataset",
      name: "Agent Hunt · 中国 AI 岗位真实 JD 数据集",
      url: "https://github.com/LLM-X-Factorer/agent-hunt",
    },
  };

  const datasetLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `AI 通用技能 × AI 角色命中矩阵（${skills.length} × ${roles.length}）`,
    description: `${skills.length * roles.length} 个 cell 的命中率矩阵：每 cell 含 required 技能命中数 + preferred 技能命中数 + 命中率（命中数 / 该角色 JD 总数）。基于 Agent Hunt 5673 条已聚类的国内真实 AI 招聘 JD。`,
    url: `${SITE_URL}/skills`,
    license: "https://github.com/LLM-X-Factorer/agent-hunt/blob/main/LICENSE",
    creator: { "@type": "Organization", name: "Agent Hunt", url: "https://github.com/LLM-X-Factorer/agent-hunt" },
    spatialCoverage: "China",
    temporalCoverage: "2025-10/..",
    variableMeasured: [
      "Required skill count per role",
      "Preferred skill count per role",
      "Skill hit rate per role (count / job_count)",
    ],
    isBasedOn: {
      "@type": "Dataset",
      url: "https://github.com/LLM-X-Factorer/agent-hunt",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "技能矩阵", item: `${SITE_URL}/skills` },
    ],
  };

  return (
    <main className="flex-1 flex flex-col bg-grid">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <nav className="px-4 pt-4 max-w-5xl mx-auto w-full text-xs text-slate-500" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-blue-700 hover:underline">首页</Link>
          </li>
          <li>›</li>
          <li className="text-slate-700 font-medium">技能矩阵</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="px-4 pt-8 sm:pt-12 pb-8 max-w-5xl mx-auto w-full">
        <p className="text-xs font-mono tracking-widest text-blue-600 uppercase mb-3">
          Skill × Role Hit Matrix
        </p>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
          AI 求职 {skills.length} 技能
          <span className="text-blue-600"> × </span>
          {roles.length} 角色矩阵
        </h1>
        <p className="text-base text-slate-600 leading-relaxed mb-2 max-w-3xl">
          基于 5673 条已聚类的国内真实 AI 招聘 JD，把 {skills.length} 项 AI 通用技能在 {roles.length} 个 AI 角色聚类里的命中率拆成一张 heatmap。
          颜色越深，该技能在该角色的 JD 里出现得越多。
        </p>
        <p className="text-sm text-slate-500 mb-4 max-w-3xl">
          每个 cell 命中率 = (required 命中数 + preferred 命中数) / 该角色 JD 总数。点击任一 cell 跳到对应角色页查看完整 JD 拆解。
        </p>

        {/* Color legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-500">命中率：</span>
          {[
            { c: "#f8fafc", l: "0%" },
            { c: "#dbeafe", l: "<5%" },
            { c: "#93c5fd", l: "5-10%" },
            { c: "#3b82f6", l: "10-20%" },
            { c: "#1d4ed8", l: "20-40%" },
            { c: "#1e3a8a", l: "≥40%" },
          ].map((s) => (
            <span key={s.l} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block w-4 h-4 rounded border border-slate-200"
                style={{ background: s.c }}
              />
              <span className="text-slate-600 font-mono">{s.l}</span>
            </span>
          ))}
        </div>
      </section>

      {/* SVG heatmap */}
      <section className="px-4 pb-10 max-w-5xl mx-auto w-full">
        <div className="bg-white border border-blue-100 rounded-2xl p-4 overflow-x-auto">
          <svg
            width={totalW}
            height={totalH}
            viewBox={`0 0 ${totalW} ${totalH}`}
            role="img"
            aria-label={`${skills.length} 技能 × ${roles.length} 角色命中率 heatmap`}
            style={{ minWidth: totalW }}
          >
            {/* Role labels (rotated) */}
            {roles.map((role, i) => (
              <g
                key={role.role_id}
                transform={`translate(${labelW + i * cellW + cellW / 2}, ${headerH - 8})`}
              >
                <text
                  transform="rotate(-50)"
                  textAnchor="start"
                  fontSize={11}
                  fill="#1e293b"
                  fontWeight={600}
                >
                  {role.role_name}
                </text>
              </g>
            ))}

            {/* Skill rows */}
            {skills.map((skill, j) => {
              const rowY = headerH + j * cellH;
              return (
                <g key={skill.id}>
                  {/* Row stripe (alternating bg) */}
                  {j % 2 === 1 && (
                    <rect
                      x={0}
                      y={rowY}
                      width={totalW}
                      height={cellH}
                      fill="#f8fafc"
                    />
                  )}

                  {/* Skill label */}
                  <text
                    x={labelW - 10}
                    y={rowY + cellH / 2 + 4}
                    textAnchor="end"
                    fontSize={11}
                    fill="#334155"
                    fontWeight={500}
                  >
                    {skill.canonical_name.length > 22
                      ? skill.canonical_name.slice(0, 22) + "…"
                      : skill.canonical_name}
                  </text>

                  {/* Cells */}
                  {roles.map((role, i) => {
                    const cell = matrix[skill.id][role.role_id];
                    const cx = labelW + i * cellW;
                    const showPct = cell.pct >= 0.03;
                    return (
                      <a
                        key={role.role_id}
                        href={`/role/${role.role_id}?skill=${skill.id}`}
                      >
                        <rect
                          x={cx + 1}
                          y={rowY + 1}
                          width={cellW - 2}
                          height={cellH - 2}
                          fill={colorFor(cell.pct)}
                          stroke="#e2e8f0"
                          strokeWidth={0.5}
                          rx={2}
                        >
                          <title>{`${role.role_name} × ${skill.canonical_name} · ${cell.total} 命中（required ${cell.required} + preferred ${cell.preferred}）= ${(cell.pct * 100).toFixed(1)}%`}</title>
                        </rect>
                        {showPct && (
                          <text
                            x={cx + cellW / 2}
                            y={rowY + cellH / 2 + 4}
                            textAnchor="middle"
                            fontSize={10}
                            fontWeight={600}
                            fill={textColorFor(cell.pct)}
                            pointerEvents="none"
                          >
                            {(cell.pct * 100).toFixed(0)}%
                          </text>
                        )}
                      </a>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">
          手机端可横向滚动 · 数据来源 Agent Hunt（5673 已聚类 JD · 截至 2026-04-29）
        </p>
      </section>

      {/* Reverse lookup A · 每个角色的 top 5 必备技能 */}
      <section className="px-4 py-8 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-black text-slate-900 mb-1">
          每个 AI 角色 · Top 5 高频技能
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          按 (required + preferred) 命中数排序，括号内为命中率
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roleTopSkills.map(({ role, top }) => (
            <div key={role.role_id} className="bg-white border border-blue-100 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Link
                  href={`/role/${role.role_id}`}
                  className="font-bold text-slate-900 hover:text-blue-700 hover:underline"
                >
                  {role.role_name}
                </Link>
                <span className="text-xs font-mono text-slate-500">
                  {role.job_count} JD
                </span>
              </div>
              {top.length > 0 ? (
                <ul className="space-y-1.5 text-sm">
                  {top.map(({ skill, cell }) => (
                    <li key={skill.id} className="flex items-center justify-between">
                      <Link
                        href={`/role/${role.role_id}?skill=${skill.id}`}
                        className="text-slate-700 hover:text-blue-700 hover:underline"
                      >
                        {skill.canonical_name}
                      </Link>
                      <span className="text-xs font-mono text-slate-500">
                        {cell.total} ({(cell.pct * 100).toFixed(1)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">该角色 JD 未提取到匹配技能</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Reverse lookup B · 每个技能的 Top 3 角色 */}
      <section className="px-4 py-8 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-black text-slate-900 mb-1">
          每项技能 · Top 3 高频角色
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          想学 prompt engineering 适合做哪个角色？这一节按命中率给你直接答案
        </p>
        <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3">技能</th>
                <th className="text-left px-4 py-3">Top 3 高频角色</th>
              </tr>
            </thead>
            <tbody>
              {skillTopRoles.map(({ skill, top }) => (
                <tr key={skill.id} className="border-t border-blue-50">
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                    {skill.canonical_name}
                    <span className="ml-2 text-xs font-mono text-slate-400">
                      {skill.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {top.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {top.map(({ role, cell }) => (
                          <Link
                            key={role.role_id}
                            href={`/role/${role.role_id}?skill=${skill.id}`}
                            className="text-xs bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg px-2.5 py-1 text-blue-700 transition-colors"
                          >
                            {role.role_name} · {(cell.pct * 100).toFixed(1)}%
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">无非零命中</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 bg-blue-50/40 border-y border-blue-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            想知道你掌握的技能能上哪个 AI 角色？
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            10 分钟出 7 节诊断报告：技能匹配率、缺什么、7/30/90 日补齐、薪资分布。永久免费。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/diagnose"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-4 shadow-lg shadow-blue-600/20"
            >
              <div>系统推荐 Top 3</div>
              <div className="text-xs font-normal opacity-90 mt-1">填技能让算法挑</div>
            </Link>
            <Link
              href="/diagnose-target"
              className="bg-white border-2 border-blue-600 text-blue-700 font-bold rounded-xl px-4 py-4 hover:bg-blue-50"
            >
              <div>转行 Gap 诊断</div>
              <div className="text-xs font-normal mt-1 text-slate-500">锁定行业 + 岗位</div>
            </Link>
            <Link
              href="/diagnose-augment"
              className="bg-white border border-slate-300 text-slate-700 font-bold rounded-xl px-4 py-4 hover:border-blue-400"
            >
              <div>留行 + AI 增强</div>
              <div className="text-xs font-normal mt-1 text-slate-500">填原职业看 AI 增强</div>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-4 py-6 text-center text-xs text-slate-500 bg-white">
        <p>
          数据来源{" "}
          <a
            href="https://github.com/LLM-X-Factorer/agent-hunt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Agent Hunt
          </a>
          （开源 · 每周更新） · 截至 2026-04-29
        </p>
      </footer>
    </main>
  );
}
