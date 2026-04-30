import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  loadRoles,
  loadIndustryAugmentedSalary,
  loadRolesAugmentedByProfession,
  loadRolesByIndustry,
} from "@/lib/serverData";
import { INDUSTRY_LIST, getIndustry } from "@/data/industries";
import { buildOgImages } from "@/lib/ogUrl";
import type {
  Role,
  ProfessionEntry,
  RolesByIndustry,
} from "@/lib/fetchAgentHunt";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

export const dynamicParams = false;
export const revalidate = 3600;

export async function generateStaticParams() {
  return INDUSTRY_LIST.map((i) => ({ id: i.en }));
}

function fmtK(n: number): string {
  return `¥${Math.round(n / 1000).toLocaleString()}k`;
}

async function loadAll() {
  const [roles, indSalary, profession, byIndustry] = await Promise.all([
    loadRoles(),
    loadIndustryAugmentedSalary(),
    loadRolesAugmentedByProfession(),
    loadRolesByIndustry(),
  ]);
  return { roles, indSalary, profession, byIndustry };
}

// 优先用 roles-by-industry（agent-hunt #9 二维切片）拿原生 vacancyCount + salary
// + topRegions；远程拉不到时降级到 reverse-lookup top_industries.count。
function rolesInIndustry(
  roles: Role[],
  byIndustry: RolesByIndustry | null,
  industry: string,
) {
  const cell = byIndustry?.data?.domestic?.[industry];
  if (cell && Object.keys(cell).length > 0) {
    return Object.entries(cell)
      .filter(([rid, e]) => rid !== "other" && e.vacancyCount >= 5)
      .map(([rid, e]) => ({
        roleId: rid,
        roleName: e.roleName,
        countInIndustry: e.vacancyCount,
        salaryMedian: e.salaryMedian,
        salarySampleSize: e.salarySampleSize,
        topRegions: e.topRegions,
        nationalRole: roles.find((r) => r.role_id === rid),
      }))
      .sort((a, b) => b.countInIndustry - a.countInIndustry);
  }
  // 兜底：reverse-lookup（旧逻辑）
  return roles
    .filter((r) => r.role_id !== "other")
    .map((r) => ({
      roleId: r.role_id,
      roleName: r.role_name,
      countInIndustry:
        r.top_industries.find((ti) => ti.industry === industry)?.count || 0,
      salaryMedian: r.salary.median,
      salarySampleSize: r.salary.sample_size,
      topRegions: [] as string[],
      nationalRole: r as Role | undefined,
    }))
    .filter((x) => x.countInIndustry > 0)
    .sort((a, b) => b.countInIndustry - a.countInIndustry);
}

// 在 420 长尾原职业字典里找 topIndustries 命中本行业的 entry，按 vacancyCount 排序，
// 给 industry 页面提供「这个行业的常见原职业 + AI 增强 JD」入口 → 导流 Route C。
function professionsInIndustry(
  profession: { domestic: Record<string, ProfessionEntry> } | null,
  industry: string,
) {
  if (!profession) return [];
  return Object.entries(profession.domestic)
    .map(([name, entry]) => {
      const inThis = entry.topIndustries.find((ti) => ti.industry === industry)?.count || 0;
      return { name, entry, inThisIndustry: inThis };
    })
    .filter((x) => x.inThisIndustry > 0 && x.entry.vacancyCount >= 5)
    .sort((a, b) => b.inThisIndustry - a.inThisIndustry);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ind = getIndustry(id);
  if (!ind) return {};
  const { indSalary } = await loadAll();
  const slice = indSalary?.by_industry.find((s) => s.industry === id);
  const median = slice ? fmtK(slice.p50) : "—";
  const jc = slice?.job_count ?? 0;
  return {
    title: `${ind.cn}行业 AI 求职 · ${jc} 条 AI 增强真实 JD · 中位 ${median}`,
    description: `${ind.cn}行业 AI 招聘画像：${jc} 条 AI 增强真实 JD（中位薪资 ${median}）。${ind.blurb}。AIJobFit 列出该行业 Top AI 角色 + 常见原职业 + AI 增强技能要求 + 转行 / 留行两条诊断路径。`,
    alternates: { canonical: `/industry/${id}` },
    openGraph: {
      title: `${ind.cn}行业 · ${jc} 条 AI 增强真实 JD`,
      description: `${ind.blurb} · 中位 ${median}`,
      type: "article",
      url: `/industry/${id}`,
      images: buildOgImages({
        title: `${ind.cn}行业 AI 求职画像`,
        subtitle: ind.blurb,
        tag: "行业切片",
        stat1: `${jc.toLocaleString()} 条 AI 增强 JD`,
        stat2: `中位 ${median}`,
        stat3: "12 行业切片",
      }),
    },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ind = getIndustry(id);
  if (!ind) return notFound();

  const { roles, indSalary, profession, byIndustry } = await loadAll();
  const slice = indSalary?.by_industry.find((s) => s.industry === id);
  const topRoles = rolesInIndustry(roles, byIndustry, id).slice(0, 8);
  const topProfessions = professionsInIndustry(profession, id).slice(0, 12);
  const cmp = indSalary?.comparison;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${ind.cn}行业 AI 求职画像 · ${slice?.job_count ?? 0} 条真实 AI 增强 JD`,
    description: `${ind.cn}行业 AI 招聘真实数据：JD 数量、薪资分布、Top 角色、常见原职业 + AI 增强映射。`,
    datePublished: "2026-04-29",
    dateModified: new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    publisher: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/industry/${id}`,
    about: { "@type": "Thing", name: `${ind.cn} 行业 AI 求职` },
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
      { "@type": "ListItem", position: 2, name: "行业", item: `${SITE_URL}/industry/${id}` },
      { "@type": "ListItem", position: 3, name: ind.cn },
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

      <Breadcrumb name={ind.cn} />

      <section className="px-4 pt-8 sm:pt-12 pb-10 max-w-5xl mx-auto w-full">
        <p className="text-xs font-mono tracking-widest text-blue-600 uppercase mb-3">
          Industry Profile · 国内真实 AI 增强 JD
        </p>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
          {ind.cn}行业
          <br className="sm:hidden" />
          <span className="text-blue-600 sm:ml-3 text-2xl sm:text-3xl font-bold">
            AI 求职画像
          </span>
        </h1>
        <p className="text-base text-slate-600 leading-relaxed mb-6 max-w-3xl">
          {ind.blurb}。基于国内招聘平台的「{ind.cn} × AI 相关」真实 JD 数据，
          给非程序员看这个行业 AI 招聘的真实画像、薪资水平、Top 角色和留行机会。
        </p>

        {slice && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="AI 增强 JD" value={slice.job_count.toLocaleString()} />
            <Stat label="薪资中位" value={fmtK(slice.p50)} />
            <Stat label="P25" value={fmtK(slice.p25)} />
            <Stat label="P75" value={fmtK(slice.p75)} />
          </div>
        )}
      </section>

      {/* 行业 vs 互联网薪资对比 */}
      {slice && cmp && (
        <Section
          title={`${ind.cn} vs 互联网行业薪资对比`}
          subtitle="同样做 AI 增强相关岗位，传统行业 vs 互联网行业的薪资差。数据来自 industry-augmented-salary.comparison"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CompareCard
              label={`${ind.cn} · AI 增强中位`}
              value={fmtK(slice.p50)}
              sub={`${slice.salary_sample_size} 条样本`}
              tone="primary"
            />
            <CompareCard
              label="互联网 · AI 增强中位"
              value={fmtK(cmp.internet_median)}
              sub={`${cmp.internet_sample_size} 条样本`}
              tone="muted"
            />
          </div>
          <p className="text-xs text-slate-500 mt-3 max-w-3xl">
            注：传统行业（金融 / 制造 / 医疗 / 能源等）AI 增强中位 {fmtK(cmp.premium_traditional_median)}，
            互联网中位 {fmtK(cmp.internet_median)}，相对差 {(cmp.delta_pct * 100).toFixed(1)}%。
            「传统行业 AI 待遇低」是常见误解，部分行业（金融 / 能源）实际持平甚至高于互联网。
          </p>
        </Section>
      )}

      {/* Top AI roles in this industry */}
      {topRoles.length > 0 && (
        <Section
          title={`${ind.cn}行业 Top AI 角色`}
          subtitle="数据来自 roles-by-industry 二维切片（agent-hunt #9）：直接报「该行业 × 该角色」原生 vacancyCount + 中位 + 主战场城市，比反向查找更准"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topRoles.map((r) => (
              <Link
                key={r.roleId}
                href={`/industry/${id}/${r.roleId}`}
                className="bg-white border border-blue-100 rounded-2xl p-4 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-bold text-slate-900 text-base">
                    {r.roleName}
                  </h3>
                  <span className="text-xs font-mono text-blue-700 font-bold">
                    {r.countInIndustry} JD
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  中位 {fmtK(r.salaryMedian)}
                  {r.topRegions.length > 0 && ` · 主战场 ${r.topRegions.slice(0, 2).join(" / ")}`}
                </p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* 常见原职业 → AI 增强（导流 Route C） */}
      {topProfessions.length > 0 && (
        <Section
          title={`${ind.cn}行业常见原职业 + AI 增强`}
          subtitle="如果你属于这些原职业，可以走「留行 + AI 增强」路线，保留原行业身份的同时学 AI 工具"
        >
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topProfessions.map(({ name, entry, inThisIndustry }) => (
                <div
                  key={name}
                  className="bg-white rounded-xl p-3 border border-emerald-100"
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-bold text-slate-900 text-sm">{name}</span>
                    <span className="text-xs font-mono text-emerald-700">
                      {inThisIndustry} JD
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    全行业 {entry.vacancyCount} JD · 中位 {fmtK(entry.salaryMedian)}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/diagnose-augment"
              className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-5 py-2.5 text-sm"
            >
              开始留行 + AI 增强诊断 →
            </Link>
          </div>
        </Section>
      )}

      {/* CTA · 三路线 */}
      <section className="px-4 py-12 bg-blue-50/40 border-y border-blue-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">
            想看自己在 {ind.cn}行业能上哪个 AI 角色？
          </h2>
          <p className="text-sm text-slate-500 mb-6 text-center max-w-2xl mx-auto">
            10 分钟出 7 节诊断报告：技能匹配率、Gap、补齐路径、薪资分布。永久免费。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            <Link
              href="/diagnose-target"
              className="text-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-4"
            >
              <div>转行 Gap 诊断</div>
              <div className="text-xs font-normal opacity-90 mt-1">锁定行业 + 岗位</div>
            </Link>
            <Link
              href="/diagnose-augment"
              className="text-center bg-white border-2 border-emerald-600 text-emerald-700 font-bold rounded-xl px-4 py-4 hover:bg-emerald-50"
            >
              <div>留行 + AI 增强</div>
              <div className="text-xs font-normal mt-1 text-slate-500">填原职业看 AI 增强</div>
            </Link>
            <Link
              href="/diagnose"
              className="text-center bg-white border border-slate-300 text-slate-700 font-bold rounded-xl px-4 py-4 hover:border-blue-400"
            >
              <div>系统推荐 Top 3</div>
              <div className="text-xs font-normal mt-1 text-slate-500">填技能让算法挑</div>
            </Link>
          </div>
        </div>
      </section>

      <DataFooter />
    </main>
  );
}

function Breadcrumb({ name }: { name: string }) {
  return (
    <nav className="px-4 pt-4 max-w-5xl mx-auto w-full text-xs text-slate-500" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/" className="hover:text-blue-700 hover:underline">
            首页
          </Link>
        </li>
        <li>›</li>
        <li>行业</li>
        <li>›</li>
        <li className="text-slate-700 font-medium">{name}</li>
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
    <section className="px-4 py-8 max-w-5xl mx-auto w-full">
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
        {title}
      </h2>
      {subtitle && <p className="text-sm text-slate-500 mb-5 max-w-3xl">{subtitle}</p>}
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-blue-100 rounded-xl px-4 py-3 text-center">
      <p className="text-xl sm:text-2xl font-black font-mono text-blue-700">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function CompareCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "primary" | "muted";
}) {
  const cls =
    tone === "primary"
      ? "bg-blue-600 text-white border-blue-700"
      : "bg-white text-slate-700 border-slate-200";
  return (
    <div className={`border rounded-2xl p-5 ${cls}`}>
      <p className="text-xs opacity-80 mb-1">{label}</p>
      <p className="text-3xl font-black font-mono mb-1">{value}</p>
      <p className="text-xs opacity-70">{sub}</p>
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
        （开源 · 每周更新） · 截至 2026-04-29
      </p>
    </footer>
  );
}
