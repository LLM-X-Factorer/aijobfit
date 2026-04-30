import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadRoles, loadSkills } from "@/lib/serverData";
import { INDUSTRY_EN_TO_CN } from "@/data/industries";
import { buildOgImages } from "@/lib/ogUrl";
import type { Role, Skill } from "@/lib/fetchAgentHunt";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

export const dynamicParams = false;
export const revalidate = 3600;

// slug = "{roleA}-vs-{roleB}"，roleA 字母序 < roleB（避免 a-vs-b 与 b-vs-a 重复 SSG）
function parseSlug(slug: string): [string, string] | null {
  const parts = slug.split("-vs-");
  if (parts.length !== 2) return null;
  const [a, b] = parts;
  if (!a || !b || a >= b) return null; // 强制字母序
  return [a, b];
}

export async function generateStaticParams() {
  const roles = await loadRoles();
  const ids = roles
    .filter((r) => r.role_id !== "other")
    .map((r) => r.role_id)
    .sort();
  const params: { slug: string }[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      params.push({ slug: `${ids[i]}-vs-${ids[j]}` });
    }
  }
  return params;
}

function fmtK(n: number): string {
  return `¥${Math.round(n / 1000).toLocaleString()}k`;
}

function skillName(skills: Skill[], skillId: string): string {
  return skills.find((s) => s.id === skillId)?.canonical_name || skillId;
}

async function loadCompareRoles(idA: string, idB: string) {
  const [roles, skills] = await Promise.all([loadRoles(), loadSkills()]);
  const a = roles.find((r) => r.role_id === idA);
  const b = roles.find((r) => r.role_id === idB);
  return { a, b, skills };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};
  const [idA, idB] = parsed;
  const { a, b } = await loadCompareRoles(idA, idB);
  if (!a || !b) return {};
  const title = `${a.role_name} vs ${b.role_name} · 真实 JD 对比 · 哪个更适合你？`;
  const description = `${a.role_name}（${a.job_count} 条 JD · 中位 ${fmtK(a.salary.median)}）vs ${b.role_name}（${b.job_count} 条 JD · 中位 ${fmtK(b.salary.median)}）：技能要求、行业分布、城市、应届口径、决策路径全维度对比。AIJobFit 用 8238 条真实 JD 帮你判断 2 个 AI 角色哪个更匹配你。`;
  return {
    title,
    description,
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title: `${a.role_name} vs ${b.role_name}`,
      description: `${a.job_count} vs ${b.job_count} 条真实 JD · 中位 ${fmtK(a.salary.median)} vs ${fmtK(b.salary.median)}`,
      type: "article",
      url: `/compare/${slug}`,
      images: buildOgImages({
        title: `${a.role_name} vs ${b.role_name}`,
        subtitle: "哪个 AI 角色更适合你？",
        tag: "角色对比",
        stat1: `${a.job_count} vs ${b.job_count} JD`,
        stat2: `中位 ${fmtK(a.salary.median)} vs ${fmtK(b.salary.median)}`,
        stat3: `经验 ${a.experience.median_min} vs ${b.experience.median_min} 年`,
      }),
    },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return notFound();
  const [idA, idB] = parsed;
  const { a, b, skills } = await loadCompareRoles(idA, idB);
  if (!a || !b) return notFound();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${a.role_name} vs ${b.role_name} · 真实 JD 对比`,
    description: `两个 AI 角色的全维度对比：JD 数 / 薪资 / 技能 / 行业 / 城市 / 决策路径`,
    datePublished: "2026-04-29",
    dateModified: new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    publisher: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/compare/${slug}`,
    isBasedOn: {
      "@type": "Dataset",
      name: "Agent Hunt · 中国 AI 岗位真实 JD 数据集",
      url: "https://github.com/LLM-X-Factorer/agent-hunt",
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "对比", item: `${SITE_URL}/compare/${slug}` },
      { "@type": "ListItem", position: 3, name: `${a.role_name} vs ${b.role_name}` },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Breadcrumb a={a.role_name} b={b.role_name} />

      <header className="px-4 pt-6 sm:pt-12 pb-6 max-w-5xl mx-auto w-full">
        <p className="text-xs font-mono tracking-widest text-blue-600 uppercase mb-3">
          AI Role Compare · 真实 JD 全维度对比
        </p>
        <h1 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3 leading-tight">
          <span className="text-blue-700">{a.role_name}</span>
          <span className="text-slate-400 mx-2 sm:mx-3 text-xl sm:text-3xl font-bold">vs</span>
          <span className="text-emerald-700">{b.role_name}</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          基于 {(a.job_count + b.job_count).toLocaleString()} 条真实 JD（{a.job_count} + {b.job_count}），
          帮你判断这两个 AI 角色哪个更匹配你的背景、薪资预期和长期发展。
        </p>
      </header>

      {/* Top stat 双栏卡 — mobile 上下堆叠 */}
      <section className="px-4 pb-2 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-3">
          <RoleStatCard role={a} tone="blue" />
          <RoleStatCard role={b} tone="emerald" />
        </div>
      </section>

      {/* 横条对比 4 维度 */}
      <Section title="4 维度横条对比" subtitle="左蓝 = A 角色 / 右绿 = B 角色，按更大值标准化到 100%">
        <div className="space-y-4">
          <BarRow
            label="JD 数量（市场需求）"
            valA={a.job_count}
            valB={b.job_count}
            fmt={(n) => n.toLocaleString()}
          />
          <BarRow
            label="薪资中位"
            valA={a.salary.median}
            valB={b.salary.median}
            fmt={fmtK}
          />
          <BarRow
            label="P75（高薪天花板）"
            valA={a.salary.p75}
            valB={b.salary.p75}
            fmt={fmtK}
          />
          <BarRow
            label="经验要求中位（年）"
            valA={a.experience.median_min}
            valB={b.experience.median_min}
            invertGood
            fmt={(n) => `${n} 年`}
          />
        </div>
      </Section>

      {/* Required skills 对比 */}
      <Section title="必备技能对比" subtitle="JD 中高频提及的必备技能 Top 5（按命中频次）">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SkillBlock
            tone="blue"
            roleName={a.role_name}
            items={a.required_skills.slice(0, 5).map((s) => ({
              name: skillName(skills, s.skill_id),
              count: s.count,
              total: a.job_count,
            }))}
          />
          <SkillBlock
            tone="emerald"
            roleName={b.role_name}
            items={b.required_skills.slice(0, 5).map((s) => ({
              name: skillName(skills, s.skill_id),
              count: s.count,
              total: b.job_count,
            }))}
          />
        </div>
      </Section>

      {/* Industry 对比 */}
      <Section title="主要行业对比" subtitle="角色 JD 集中的 Top 3 行业">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <IndustryBlock tone="blue" roleName={a.role_name} industries={a.top_industries} />
          <IndustryBlock tone="emerald" roleName={b.role_name} industries={b.top_industries} />
        </div>
      </Section>

      {/* 决策路径 */}
      <Section title="你应该选哪个？" subtitle="基于背景画像 + 短期 / 长期目标的决策路径">
        <DecisionTree a={a} b={b} />
      </Section>

      {/* 跨链 */}
      <Section title="单独看每个角色">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/role/${a.role_id}`}
            className="block bg-white border border-blue-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="text-xs text-blue-600 font-mono mb-1">/role/{a.role_id}</div>
            <div className="font-bold text-slate-900 text-sm sm:text-base">{a.role_name} 全国画像</div>
            <div className="text-xs text-slate-500 mt-1">含技能 / 行业 / 城市 / 应届</div>
          </Link>
          <Link
            href={`/role/${b.role_id}`}
            className="block bg-white border border-emerald-200 rounded-xl p-4 hover:border-emerald-400 hover:shadow-md transition-all"
          >
            <div className="text-xs text-emerald-600 font-mono mb-1">/role/{b.role_id}</div>
            <div className="font-bold text-slate-900 text-sm sm:text-base">{b.role_name} 全国画像</div>
            <div className="text-xs text-slate-500 mt-1">含技能 / 行业 / 城市 / 应届</div>
          </Link>
        </div>
      </Section>

      {/* CTA · 三路线 */}
      <section className="px-4 py-10 sm:py-12 bg-blue-50/40 border-y border-blue-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            想 10 分钟出诊断报告？
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-5 max-w-xl mx-auto">
            填技能 + 背景，系统在 14 角色里算 Top 3 + 4 主线分布 + 应届口径
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-2xl mx-auto">
            <Link
              href="/diagnose-target"
              className="text-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-3 py-3 text-sm"
            >
              转行 Gap 诊断
            </Link>
            <Link
              href="/diagnose-augment"
              className="text-center bg-white border-2 border-emerald-600 text-emerald-700 font-bold rounded-xl px-3 py-3 text-sm"
            >
              留行 + AI 增强
            </Link>
            <Link
              href="/diagnose"
              className="text-center bg-white border border-slate-300 text-slate-700 font-bold rounded-xl px-3 py-3 text-sm"
            >
              系统推荐 Top 3
            </Link>
          </div>
        </div>
      </section>

      <DataFooter />
    </main>
  );
}

// ============ UI 子组件（移动端优先） ============

function Breadcrumb({ a, b }: { a: string; b: string }) {
  return (
    <nav
      className="px-4 pt-4 max-w-5xl mx-auto w-full text-xs text-slate-500"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2 flex-wrap">
        <li>
          <Link href="/" className="hover:text-blue-700 hover:underline">
            首页
          </Link>
        </li>
        <li>›</li>
        <li>对比</li>
        <li>›</li>
        <li className="text-slate-700 font-medium truncate">
          {a} vs {b}
        </li>
      </ol>
    </nav>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 py-6 sm:py-8 max-w-5xl mx-auto w-full">
      <h2 className="text-lg sm:text-2xl font-black text-slate-900 mb-1">
        {title}
      </h2>
      {subtitle && <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-5">{subtitle}</p>}
      {children}
    </section>
  );
}

function RoleStatCard({ role, tone }: { role: Role; tone: "blue" | "emerald" }) {
  const cls = tone === "blue"
    ? "bg-blue-600 text-white border-blue-700"
    : "bg-emerald-600 text-white border-emerald-700";
  return (
    <div className={`border rounded-2xl p-4 sm:p-5 ${cls}`}>
      <p className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80 mb-1">
        {tone === "blue" ? "Role A" : "Role B"}
      </p>
      <h3 className="font-black text-base sm:text-xl mb-2 leading-tight">
        {role.role_name}
      </h3>
      <div className="space-y-1 text-xs sm:text-sm font-mono">
        <p>{role.job_count.toLocaleString()} 条 JD</p>
        <p>中位 {fmtK(role.salary.median)}</p>
        <p className="opacity-80">
          {fmtK(role.salary.p25)} - {fmtK(role.salary.p75)}
        </p>
      </div>
    </div>
  );
}

function BarRow({
  label,
  valA,
  valB,
  fmt,
  invertGood = false,
}: {
  label: string;
  valA: number;
  valB: number;
  fmt: (n: number) => string;
  invertGood?: boolean; // 经验年限低更好
}) {
  const max = Math.max(valA, valB, 1);
  const pctA = (valA / max) * 100;
  const pctB = (valB / max) * 100;
  const aBetter = invertGood ? valA < valB : valA > valB;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5 gap-2">
        <span className="text-xs sm:text-sm font-medium text-slate-700">{label}</span>
        <span className="text-[10px] sm:text-xs text-slate-400">
          A {fmt(valA)} · B {fmt(valB)}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] w-4 text-blue-700 font-bold">A</span>
          <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full ${aBetter ? "bg-blue-600" : "bg-blue-400"}`}
              style={{ width: `${pctA}%` }}
            />
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-slate-600 w-14 text-right">
            {fmt(valA)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] w-4 text-emerald-700 font-bold">B</span>
          <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full ${aBetter ? "bg-emerald-400" : "bg-emerald-600"}`}
              style={{ width: `${pctB}%` }}
            />
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-slate-600 w-14 text-right">
            {fmt(valB)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SkillBlock({
  tone,
  roleName,
  items,
}: {
  tone: "blue" | "emerald";
  roleName: string;
  items: { name: string; count: number; total: number }[];
}) {
  const cls = tone === "blue"
    ? "bg-blue-50 border-blue-200"
    : "bg-emerald-50 border-emerald-200";
  const txt = tone === "blue" ? "text-blue-900" : "text-emerald-900";
  return (
    <div className={`border rounded-2xl p-4 ${cls}`}>
      <h3 className={`font-bold text-sm mb-3 ${txt}`}>{roleName}</h3>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.name} className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium text-slate-800 truncate mr-2">{it.name}</span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-500 flex-shrink-0">
              {Math.round((it.count / it.total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IndustryBlock({
  tone,
  roleName,
  industries,
}: {
  tone: "blue" | "emerald";
  roleName: string;
  industries: { industry: string; count: number }[];
}) {
  const cls = tone === "blue"
    ? "bg-blue-50 border-blue-200"
    : "bg-emerald-50 border-emerald-200";
  const txt = tone === "blue" ? "text-blue-900" : "text-emerald-900";
  return (
    <div className={`border rounded-2xl p-4 ${cls}`}>
      <h3 className={`font-bold text-sm mb-3 ${txt}`}>{roleName}</h3>
      <ul className="space-y-2">
        {industries.slice(0, 3).map((ti) => (
          <li key={ti.industry} className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium text-slate-800">
              {INDUSTRY_EN_TO_CN[ti.industry] || ti.industry}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-500">
              {ti.count} JD
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DecisionTree({ a, b }: { a: Role; b: Role }) {
  // 启发式决策规则（基于数据差异）
  const aMoreJobs = a.job_count > b.job_count;
  const aHigherSalary = a.salary.median > b.salary.median;
  const aLowerExp = a.experience.median_min < b.experience.median_min;
  const lessExpRole = aLowerExp ? a : b;
  const moreJobsRole = aMoreJobs ? a : b;
  const higherSalaryRole = aHigherSalary ? a : b;
  return (
    <div className="space-y-3">
      <DecisionRow
        condition="如果你刚入行 / 应届 / 想门槛低先上岸"
        recommendation={`选 ${lessExpRole.role_name}（经验中位 ${lessExpRole.experience.median_min} 年）`}
      />
      <DecisionRow
        condition="如果你看重市场 JD 数量 / 招聘机会多"
        recommendation={`选 ${moreJobsRole.role_name}（${moreJobsRole.job_count.toLocaleString()} 条 JD vs 对方 ${(moreJobsRole === a ? b : a).job_count.toLocaleString()}）`}
      />
      <DecisionRow
        condition="如果你看重高薪天花板 / 长期回报"
        recommendation={`选 ${higherSalaryRole.role_name}（中位 ${fmtK(higherSalaryRole.salary.median)} vs 对方 ${fmtK((higherSalaryRole === a ? b : a).salary.median)}）`}
      />
      <DecisionRow
        condition={`如果你已有 ${a.role_name === "AI 产品经理" || b.role_name === "AI 产品经理" ? "产品 / 项目管理" : "原行业"} 背景`}
        recommendation="走「转行 Gap 诊断」算自己上不上得了具体角色"
        isRoute
      />
      <DecisionRow
        condition="如果都不确定 / 想留在原行业 + 加 AI 技能"
        recommendation="走「留行 + AI 增强」看原职业匹配度"
        isRoute
      />
    </div>
  );
}

function DecisionRow({
  condition,
  recommendation,
  isRoute = false,
}: {
  condition: string;
  recommendation: string;
  isRoute?: boolean;
}) {
  const cls = isRoute
    ? "bg-amber-50 border-amber-200 text-amber-900"
    : "bg-white border-blue-100 text-slate-800";
  return (
    <div className={`border rounded-xl p-3 sm:p-4 ${cls}`}>
      <div className="text-xs sm:text-sm font-medium mb-1">{condition}</div>
      <div className="text-sm sm:text-base font-bold">→ {recommendation}</div>
    </div>
  );
}

function DataFooter() {
  return (
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
        （开源 · 每周更新）
      </p>
    </footer>
  );
}
