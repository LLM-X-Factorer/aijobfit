import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadRoles, loadRolesByCity } from "@/lib/serverData";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

const TIER_SLUG_TO_NAME: Record<string, string> = {
  tier1: "一线",
  tier2: "新一线",
};

const TIER_SLUG_TO_LABEL: Record<string, string> = {
  tier1: "一线（北上广深）",
  tier2: "新一线（杭成武苏等）",
};

export const dynamicParams = false;
export const revalidate = 3600;

export async function generateStaticParams() {
  const byCity = await loadRolesByCity();
  const params: { tier: string; role: string }[] = [];
  if (byCity?.domestic) {
    for (const [roleId, data] of Object.entries(byCity.domestic)) {
      for (const t of data.by_tier) {
        if (t.job_count >= 5 && (t.tier === "一线" || t.tier === "新一线")) {
          params.push({
            tier: t.tier === "一线" ? "tier1" : "tier2",
            role: roleId,
          });
        }
      }
    }
  }
  // build 期远程拉不到时，fallback 列全 14×2，让 page 运行时判定是否 notFound
  if (params.length === 0) {
    const roles = await loadRoles();
    for (const r of roles.filter((r) => r.role_id !== "other")) {
      params.push({ tier: "tier1", role: r.role_id });
      params.push({ tier: "tier2", role: r.role_id });
    }
  }
  return params;
}

function fmtK(n: number): string {
  return `¥${Math.round(n / 1000).toLocaleString()}k`;
}

async function loadAll(role: string) {
  const [roles, byCity] = await Promise.all([loadRoles(), loadRolesByCity()]);
  const r = roles.find((x) => x.role_id === role);
  return { role: r, byCity };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tier: string; role: string }>;
}): Promise<Metadata> {
  const { tier, role } = await params;
  const tierName = TIER_SLUG_TO_NAME[tier];
  const tierLabel = TIER_SLUG_TO_LABEL[tier];
  if (!tierName) return {};
  const { role: r, byCity } = await loadAll(role);
  if (!r || r.role_id === "other") return {};
  const cityData = byCity?.domestic[role];
  const tierEntry = cityData?.by_tier.find((t) => t.tier === tierName);
  if (!tierEntry || tierEntry.job_count < 5) {
    return {
      title: `${tierLabel} ${r.role_name} 招聘`,
      description: `${tierLabel} ${r.role_name} 数据稀薄，建议看全国概览。`,
      robots: { index: false, follow: true },
    };
  }
  const median = fmtK(tierEntry.salary.p50);
  return {
    title: `${tierLabel} ${r.role_name} 招聘 · ${tierEntry.job_count} 条 JD · 中位 ${median}`,
    description: `${tierLabel} ${r.role_name} 真实招聘画像：${tierEntry.job_count} 条 JD（中位 ${median}，P25-P75 ${fmtK(tierEntry.salary.p25)}-${fmtK(tierEntry.salary.p75)}）。AIJobFit 用国内招聘真实数据帮你看清这个城市 tier 下该角色的薪资水位线。`,
    alternates: { canonical: `/city/${tier}/${role}` },
    openGraph: {
      title: `${tierLabel} ${r.role_name} · ${tierEntry.job_count} 条真实 JD`,
      description: `中位 ${median} · 国内招聘真实数据`,
      type: "article",
      url: `/city/${tier}/${role}`,
    },
  };
}

export default async function CityRolePage({
  params,
}: {
  params: Promise<{ tier: string; role: string }>;
}) {
  const { tier, role } = await params;
  const tierName = TIER_SLUG_TO_NAME[tier];
  const tierLabel = TIER_SLUG_TO_LABEL[tier];
  if (!tierName) return notFound();

  const { role: r, byCity } = await loadAll(role);
  if (!r || r.role_id === "other") return notFound();
  const cityData = byCity?.domestic[role];
  const tierEntry = cityData?.by_tier.find((t) => t.tier === tierName);
  if (!tierEntry || tierEntry.job_count < 5) {
    // 数据太薄，引导回全国页
    return (
      <main className="flex-1 flex flex-col bg-grid">
        <Breadcrumb tierLabel={tierLabel} roleName={r.role_name} />
        <section className="px-4 py-12 max-w-3xl mx-auto w-full text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-3">
            {tierLabel} {r.role_name}
          </h1>
          <p className="text-slate-500 mb-6">
            这个城市 tier × 角色组合在国内 JD 数据中样本量过小（&lt; 5 条），
            目前无法给出可信的薪资 / 招聘画像。建议看全国概览：
          </p>
          <Link
            href={`/role/${role}`}
            className="inline-block bg-blue-600 text-white font-bold rounded-xl px-5 py-3 hover:bg-blue-700"
          >
            {r.role_name} 全国画像 →
          </Link>
        </section>
        <DataFooter />
      </main>
    );
  }

  const peerTier = tier === "tier1" ? "tier2" : "tier1";
  const peerName = TIER_SLUG_TO_NAME[peerTier];
  const peerLabel = TIER_SLUG_TO_LABEL[peerTier];
  const peerEntry = cityData?.by_tier.find((t) => t.tier === peerName);

  // top cities：过滤到本 tier 包含的城市
  const tierCitySet = new Set(tierEntry.cities_in_tier);
  const topCitiesInTier = (cityData?.top_cities || [])
    .filter((c) => tierCitySet.has(c.city))
    .slice(0, 6);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${tierLabel} ${r.role_name} 招聘画像 · ${tierEntry.job_count} 条真实 JD`,
    description: `${tierLabel} ${r.role_name} 真实招聘数据：JD 数量、薪资 P25/P50/P75、Top 城市分布。`,
    datePublished: "2026-04-29",
    dateModified: new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    publisher: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/city/${tier}/${role}`,
    about: { "@type": "Thing", name: `${tierLabel} ${r.role_name}` },
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
      { "@type": "ListItem", position: 2, name: tierLabel, item: `${SITE_URL}/city/${tier}/${role}` },
      { "@type": "ListItem", position: 3, name: r.role_name },
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

      <Breadcrumb tierLabel={tierLabel} roleName={r.role_name} />

      <section className="px-4 pt-8 sm:pt-12 pb-10 max-w-5xl mx-auto w-full">
        <p className="text-xs font-mono tracking-widest text-blue-600 uppercase mb-3">
          City × Role · 国内真实 JD
        </p>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
          {tierLabel}
          <br />
          <span className="text-blue-600 text-2xl sm:text-3xl font-bold">
            {r.role_name} 招聘画像
          </span>
        </h1>
        <p className="text-base text-slate-600 leading-relaxed mb-4 max-w-3xl">
          覆盖城市：
          <span className="font-medium text-slate-800">
            {tierEntry.cities_in_tier.join(" · ")}
          </span>
        </p>
        <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-3xl">
          基于 {tierEntry.salary.sample_size} 条带薪资的真实 JD 抽取的薪资水位线。
          数据每周从 Agent Hunt 上游同步。
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="本 tier JD" value={tierEntry.job_count.toLocaleString()} />
          <Stat label="P25" value={fmtK(tierEntry.salary.p25)} />
          <Stat label="中位" value={fmtK(tierEntry.salary.p50)} />
          <Stat label="P75" value={fmtK(tierEntry.salary.p75)} />
        </div>
      </section>

      {/* Top cities in this tier */}
      {topCitiesInTier.length > 0 && (
        <Section
          title="Top 招聘城市"
          subtitle="本 tier 内按 JD 数量排序的具体城市分布"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topCitiesInTier.map((c) => (
              <div
                key={c.city}
                className="bg-white border border-blue-100 rounded-xl px-4 py-3"
              >
                <div className="font-bold text-slate-900 mb-0.5">{c.city}</div>
                <div className="text-xs font-mono text-slate-500">
                  {c.count} JD · 中位 {fmtK(c.median)}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Tier 对比 */}
      {peerEntry && peerEntry.job_count >= 5 && (
        <Section
          title="一线 vs 新一线 薪资对比"
          subtitle="同一角色，不同城市 tier 下的薪资差。可以判断是否值得「下沉」"
        >
          <div className="grid grid-cols-2 gap-3">
            <CompareCard
              label={tierLabel}
              jobs={tierEntry.job_count}
              p50={tierEntry.salary.p50}
              p25={tierEntry.salary.p25}
              p75={tierEntry.salary.p75}
              tone="primary"
            />
            <CompareCard
              label={peerLabel}
              jobs={peerEntry.job_count}
              p50={peerEntry.salary.p50}
              p25={peerEntry.salary.p25}
              p75={peerEntry.salary.p75}
              tone="muted"
              href={`/city/${peerTier}/${role}`}
            />
          </div>
        </Section>
      )}

      {/* 全国概览 + CTA */}
      <section className="px-4 py-12 bg-blue-50/40 border-y border-blue-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-3">
            想看 {r.role_name} 全国概览？
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            含技能要求、行业分布、应届口径、学历要求、招聘公司
          </p>
          <Link
            href={`/role/${role}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-3 shadow-lg shadow-blue-600/20"
          >
            {r.role_name} 全国画像 →
          </Link>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link
              href="/diagnose-target"
              className="text-xs sm:text-sm bg-white border border-blue-300 rounded-lg px-3 py-2 text-blue-700 hover:bg-blue-50"
            >
              转行 Gap 诊断
            </Link>
            <Link
              href="/diagnose-augment"
              className="text-xs sm:text-sm bg-white border border-emerald-300 rounded-lg px-3 py-2 text-emerald-700 hover:bg-emerald-50"
            >
              留行 + AI 增强
            </Link>
            <Link
              href="/diagnose"
              className="text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
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

function Breadcrumb({
  tierLabel,
  roleName,
}: {
  tierLabel: string;
  roleName: string;
}) {
  return (
    <nav className="px-4 pt-4 max-w-5xl mx-auto w-full text-xs text-slate-500" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 flex-wrap">
        <li>
          <Link href="/" className="hover:text-blue-700 hover:underline">
            首页
          </Link>
        </li>
        <li>›</li>
        <li>{tierLabel}</li>
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
  jobs,
  p25,
  p50,
  p75,
  tone,
  href,
}: {
  label: string;
  jobs: number;
  p25: number;
  p50: number;
  p75: number;
  tone: "primary" | "muted";
  href?: string;
}) {
  const cls =
    tone === "primary"
      ? "bg-blue-600 text-white border-blue-700"
      : "bg-white text-slate-700 border-slate-200";
  const inner = (
    <div className={`border rounded-2xl p-4 sm:p-5 h-full ${cls}`}>
      <p className="text-xs opacity-80 mb-1 font-medium">{label}</p>
      <p className="text-2xl sm:text-3xl font-black font-mono mb-1">{fmtK(p50)}</p>
      <p className="text-xs opacity-70">
        {jobs} JD · {fmtK(p25)}-{fmtK(p75)}
      </p>
    </div>
  );
  return href ? (
    <Link href={href} className="block hover:opacity-90 transition-opacity">
      {inner}
    </Link>
  ) : (
    inner
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
