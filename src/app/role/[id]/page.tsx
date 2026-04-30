import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  loadRoles,
  loadSkills,
  loadRolesByCity,
  loadIndustryAugmentedSalary,
  loadRolesGraduateFriendly,
} from "@/lib/serverData";
import { INDUSTRY_EN_TO_CN } from "@/data/industries";
import { buildOgImages } from "@/lib/ogUrl";
import type { Skill } from "@/lib/fetchAgentHunt";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

export const dynamicParams = false;
export const revalidate = 3600; // 1h

export async function generateStaticParams() {
  const roles = await loadRoles();
  return roles
    .filter((r) => r.role_id !== "other")
    .map((r) => ({ id: r.role_id }));
}

async function loadAll(id: string) {
  const [roles, skills, byCity, indSalary, gradFriendly] = await Promise.all([
    loadRoles(),
    loadSkills(),
    loadRolesByCity(),
    loadIndustryAugmentedSalary(),
    loadRolesGraduateFriendly(),
  ]);
  const role = roles.find((r) => r.role_id === id);
  return { role, skills, byCity, indSalary, gradFriendly };
}

function fmtK(n: number): string {
  return `¥${Math.round(n / 1000).toLocaleString()}k`;
}

function skillName(skills: Skill[], skillId: string): string {
  return skills.find((s) => s.id === skillId)?.canonical_name || skillId;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { role } = await loadAll(id);
  if (!role || role.role_id === "other") return {};
  const median = fmtK(role.salary.median);
  const title = `${role.role_name} 国内招聘画像 · ${role.job_count} 条真实 JD · 中位 ${median}`;
  const description = `${role.role_name}：${role.job_count} 条国内真实 AI 岗位 JD（中位薪资 ${median}）。含必备技能 / 优选技能 / 行业分布 / 一线新一线薪资 / 应届口径 / 学历要求。AIJobFit 基于 8238 条招聘数据帮非程序员判断这个 AI 角色适不适合自己。`;
  return {
    title,
    description,
    alternates: { canonical: `/role/${id}` },
    openGraph: {
      title: `${role.role_name} · ${role.job_count} 条真实 JD`,
      description: `中位 ${median} · 含技能 / 行业 / 城市 / 应届切片`,
      type: "article",
      url: `/role/${id}`,
      images: buildOgImages({
        title: role.role_name,
        subtitle: `国内 AI 招聘画像 · ${role.top_industries.slice(0, 2).map((ti) => INDUSTRY_EN_TO_CN[ti.industry] || ti.industry).join(" / ")}`,
        tag: "AI 角色画像",
        stat1: `${role.job_count.toLocaleString()} 条 JD`,
        stat2: `中位 ${median}`,
        stat3: `经验 ${role.experience.median_min} 年`,
      }),
    },
  };
}

export default async function RolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { role, skills, byCity, indSalary, gradFriendly } = await loadAll(id);
  if (!role || role.role_id === "other") return notFound();

  const cityData = byCity?.domestic[id];
  const tier1 = cityData?.by_tier.find((t) => t.tier === "一线");
  const tier2 = cityData?.by_tier.find((t) => t.tier === "新一线");
  const gradEntry = gradFriendly?.domestic.find((g) => g.roleId === id);

  const topIndustries = role.top_industries.slice(0, 5).map((ti) => {
    const slice = indSalary?.by_industry.find((s) => s.industry === ti.industry);
    return {
      en: ti.industry,
      cn: INDUSTRY_EN_TO_CN[ti.industry] || ti.industry,
      count: ti.count,
      sliceMedian: slice?.p50,
      sliceJobCount: slice?.job_count,
    };
  });

  const required = role.required_skills.slice(0, 8);
  const preferred = role.preferred_skills.slice(0, 8);
  const eduTotal = Object.values(role.education).reduce((a, b) => a + b, 0);
  const eduRows = Object.entries(role.education)
    .map(([k, v]) => ({ label: k, count: v, pct: eduTotal ? v / eduTotal : 0 }))
    .sort((a, b) => b.count - a.count);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${role.role_name} 国内招聘画像 · ${role.job_count} 条真实 JD`,
    description: `${role.role_name}：${role.job_count} 条国内 AI 岗位 JD · 中位 ${fmtK(role.salary.median)} · 技能 / 行业 / 城市 / 应届切片。`,
    datePublished: "2026-04-29",
    dateModified: new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    publisher: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/role/${id}`,
    about: { "@type": "Thing", name: role.role_name },
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
      { "@type": "ListItem", position: 2, name: "AI 角色", item: `${SITE_URL}/role/${id}` },
      { "@type": "ListItem", position: 3, name: role.role_name },
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

      <Breadcrumb roleName={role.role_name} />

      {/* Hero */}
      <section className="px-4 pt-8 sm:pt-12 pb-10 max-w-5xl mx-auto w-full">
        <p className="text-xs font-mono tracking-widest text-blue-600 uppercase mb-3">
          AI Role Profile · 国内真实 JD
        </p>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
          {role.role_name}
          <br className="sm:hidden" />
          <span className="text-blue-600 sm:ml-3 text-2xl sm:text-3xl font-bold">
            国内招聘画像
          </span>
        </h1>
        <p className="text-base text-slate-600 leading-relaxed mb-6 max-w-3xl">
          基于国内主流招聘平台抓取的 {role.job_count} 条真实 JD，给非程序员看「
          {role.role_name}」这个 AI 岗位实际招聘要求、薪资水平、行业分布。
          数据每周从 Agent Hunt 上游同步。
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="JD 数量" value={role.job_count.toLocaleString()} />
          <Stat label="薪资中位" value={fmtK(role.salary.median)} />
          <Stat
            label="P25 - P75"
            value={`${fmtK(role.salary.p25)}-${fmtK(role.salary.p75)}`}
          />
          <Stat
            label="经验要求中位"
            value={`${role.experience.median_min} 年`}
          />
        </div>
      </section>

      {/* Sample titles — 用户搜索词命中区 */}
      {role.sample_titles?.length > 0 && (
        <Section title="实际职位标题样本" subtitle={`从 ${role.job_count} 条 JD 中抽取的真实标题（非编造），覆盖该角色在国内的实际叫法`}>
          <div className="flex flex-wrap gap-2">
            {role.sample_titles.slice(0, 12).map((t) => (
              <span
                key={t}
                className="text-sm bg-white border border-blue-100 rounded-lg px-3 py-2 text-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Required + Preferred skills */}
      <Section
        title="技能要求"
        subtitle={`必备技能（required）由 ${role.job_count} 条 JD 中高频提及构成；优选技能（preferred）是加分项`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkillBlock
            tone="required"
            title="必备技能"
            items={required.map((s) => ({
              name: skillName(skills, s.skill_id),
              count: s.count,
            }))}
            total={role.job_count}
          />
          <SkillBlock
            tone="preferred"
            title="优选技能"
            items={preferred.map((s) => ({
              name: skillName(skills, s.skill_id),
              count: s.count,
            }))}
            total={role.job_count}
          />
        </div>
      </Section>

      {/* Industry breakdown with salary slice */}
      {topIndustries.length > 0 && (
        <Section
          title="行业分布 + AI 增强薪资"
          subtitle="角色在哪些行业开 JD 多、行业整体的 AI 增强薪资中位（来自 industry-augmented-salary 切片）"
        >
          <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-slate-700">
                <tr>
                  <th className="text-left px-4 py-3">行业</th>
                  <th className="text-right px-4 py-3">本角色 JD</th>
                  <th className="text-right px-4 py-3 hidden sm:table-cell">行业 AI 增强 JD</th>
                  <th className="text-right px-4 py-3">行业薪资中位</th>
                </tr>
              </thead>
              <tbody>
                {topIndustries.map((ti) => (
                  <tr key={ti.en} className="border-t border-blue-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link
                        href={`/industry/${ti.en}`}
                        className="hover:text-blue-700 hover:underline"
                      >
                        {ti.cn}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">{ti.count}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500 hidden sm:table-cell">
                      {ti.sliceJobCount ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-blue-700 font-bold">
                      {ti.sliceMedian ? fmtK(ti.sliceMedian) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* City tier */}
      {(tier1 || tier2) && (
        <Section
          title="一线 vs 新一线 薪资"
          subtitle="同一角色在不同城市 tier 下的真实薪资差。数据来自国内招聘 JD 的城市切片"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tier1 && (
              <CityCard
                tier="一线（北上广深）"
                jdCount={tier1.job_count}
                p25={tier1.salary.p25}
                p50={tier1.salary.p50}
                p75={tier1.salary.p75}
                slug="tier1"
                roleId={id}
              />
            )}
            {tier2 && (
              <CityCard
                tier="新一线（杭成武苏等）"
                jdCount={tier2.job_count}
                p25={tier2.salary.p25}
                p50={tier2.salary.p50}
                p75={tier2.salary.p75}
                slug="tier2"
                roleId={id}
              />
            )}
          </div>
        </Section>
      )}

      {/* Graduate slice */}
      {gradEntry && gradEntry.totalJobs > 0 && (
        <Section
          title="应届口径"
          subtitle="如果你是在读 / 应届，看这一节：拆出校招 / 实习 / 应届可投岗位数 + 应届薪资中位"
        >
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <Stat label="应届相关 JD 总数" value={gradEntry.totalJobs.toLocaleString()} accent="emerald" />
              <Stat label="校招岗" value={gradEntry.campusJobCount.toLocaleString()} accent="emerald" />
              <Stat label="实习岗" value={gradEntry.internshipJobCount.toLocaleString()} accent="emerald" />
              <Stat label="应届可投岗" value={gradEntry.freshJobCount.toLocaleString()} accent="emerald" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">应届薪资中位</div>
                <div className="text-2xl font-black text-emerald-700">
                  {fmtK(gradEntry.freshSalaryMedian)}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1">社招薪资中位</div>
                <div className="text-2xl font-black text-slate-700">
                  {fmtK(gradEntry.socialSalaryMedian)}
                </div>
              </div>
            </div>
            {gradEntry.topCampusCities.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-slate-600 mb-2">应届校招主战场城市</div>
                <div className="flex flex-wrap gap-2">
                  {gradEntry.topCampusCities.slice(0, 6).map((c) => (
                    <span
                      key={c.city}
                      className="text-xs bg-white border border-emerald-200 rounded-full px-3 py-1 text-emerald-800"
                    >
                      {c.city} · {c.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Education distribution */}
      {eduRows.length > 0 && (
        <Section title="学历分布" subtitle={`基于 ${eduTotal} 条明确学历要求的 JD`}>
          <div className="space-y-2">
            {eduRows.map((e) => (
              <div key={e.label} className="bg-white border border-blue-100 rounded-lg p-3 flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 w-20 flex-shrink-0">{e.label}</span>
                <div className="flex-1 bg-blue-50 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${e.pct * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-500 w-20 text-right">
                  {(e.pct * 100).toFixed(1)}% · {e.count}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Top companies */}
      {role.top_companies?.length > 0 && (
        <Section title="主要招聘公司" subtitle={`从 ${role.job_count} 条 JD 中按招聘频次排序`}>
          <div className="flex flex-wrap gap-2">
            {role.top_companies.slice(0, 16).map((c) => (
              <span
                key={c}
                className="text-sm bg-white border border-blue-100 rounded-lg px-3 py-2 text-slate-700"
              >
                {c}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* CTA · 三路线 */}
      <section className="px-4 py-12 bg-blue-50/40 border-y border-blue-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">
            想看「我能不能上 {role.role_name}」？
          </h2>
          <p className="text-sm text-slate-500 mb-6 text-center max-w-2xl mx-auto">
            10 分钟出 7 节诊断报告：技能匹配率、缺什么、7/30/90 日补齐路径、薪资分布。永久免费。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            <Link
              href="/diagnose-target"
              className="text-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-4 shadow-lg shadow-blue-600/20"
            >
              <div>转行 Gap 诊断</div>
              <div className="text-xs font-normal opacity-90 mt-1">锁定行业 + 岗位</div>
            </Link>
            <Link
              href="/diagnose-augment"
              className="text-center bg-white border-2 border-blue-600 text-blue-700 font-bold rounded-xl px-4 py-4 hover:bg-blue-50"
            >
              <div>留行 + AI 增强</div>
              <div className="text-xs font-normal mt-1 text-slate-500">填原职业看 AI 增强 JD</div>
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

// ===== UI 子组件（仅这一页用，无重用价值，就地保留） =====

function Breadcrumb({ roleName }: { roleName: string }) {
  return (
    <nav className="px-4 pt-4 max-w-5xl mx-auto w-full text-xs text-slate-500" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/" className="hover:text-blue-700 hover:underline">
            首页
          </Link>
        </li>
        <li>›</li>
        <li>AI 角色</li>
        <li>›</li>
        <li className="text-slate-700 font-medium truncate">{roleName}</li>
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

function Stat({
  label,
  value,
  accent = "blue",
}: {
  label: string;
  value: string;
  accent?: "blue" | "emerald";
}) {
  const numCls = accent === "emerald" ? "text-emerald-700" : "text-blue-700";
  return (
    <div className="bg-white border border-blue-100 rounded-xl px-4 py-3 text-center">
      <p className={`text-xl sm:text-2xl font-black font-mono ${numCls}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function SkillBlock({
  tone,
  title,
  items,
  total,
}: {
  tone: "required" | "preferred";
  title: string;
  items: { name: string; count: number }[];
  total: number;
}) {
  const cls =
    tone === "required"
      ? "bg-blue-600/10 border-blue-300 text-blue-900"
      : "bg-slate-50 border-slate-200 text-slate-700";
  return (
    <div className={`border rounded-2xl p-5 ${cls}`}>
      <h3 className="font-bold mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.name} className="flex items-center justify-between text-sm">
            <span className="font-medium">{it.name}</span>
            <span className="text-xs font-mono opacity-70">
              {it.count} / {total}（{((it.count / total) * 100).toFixed(0)}%）
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CityCard({
  tier,
  jdCount,
  p25,
  p50,
  p75,
  slug,
  roleId,
}: {
  tier: string;
  jdCount: number;
  p25: number;
  p50: number;
  p75: number;
  slug: string;
  roleId: string;
}) {
  return (
    <div className="bg-white border border-blue-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-900">{tier}</h3>
        <span className="text-xs text-slate-500 font-mono">{jdCount} JD</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div>
          <div className="text-xs text-slate-500">P25</div>
          <div className="text-base font-bold font-mono text-slate-700">{fmtK(p25)}</div>
        </div>
        <div className="bg-blue-50 rounded-lg py-1">
          <div className="text-xs text-blue-600">中位</div>
          <div className="text-base font-bold font-mono text-blue-700">{fmtK(p50)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">P75</div>
          <div className="text-base font-bold font-mono text-slate-700">{fmtK(p75)}</div>
        </div>
      </div>
      <Link
        href={`/city/${slug}/${roleId}`}
        className="text-xs text-blue-600 hover:underline"
      >
        查看 {tier} {roleId} 详细页 →
      </Link>
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
        （开源 · 每周更新） · 截至 2026-04-29 · 数据日期反映上游聚类时间
      </p>
    </footer>
  );
}
