import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadRoles, loadRolesByIndustry } from "@/lib/serverData";
import { INDUSTRY_LIST, getIndustry } from "@/data/industries";
import type { RolesByIndustry, RolesByIndustryEntry } from "@/lib/fetchAgentHunt";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

// vacancyCount 阈值低于这个不出独立页（避免薄内容）
const MIN_VACANCY = 5;

export const dynamicParams = false;
export const revalidate = 3600;

export async function generateStaticParams() {
  const byIndustry = await loadRolesByIndustry();
  const params: { id: string; role: string }[] = [];
  if (byIndustry?.data?.domestic) {
    for (const [industry, roles] of Object.entries(byIndustry.data.domestic)) {
      // 只生成 INDUSTRY_LIST 包含的 industry（other 不出页）
      if (!INDUSTRY_LIST.some((i) => i.en === industry)) continue;
      for (const [roleId, entry] of Object.entries(roles)) {
        if (entry.vacancyCount >= MIN_VACANCY) {
          params.push({ id: industry, role: roleId });
        }
      }
    }
  }
  return params;
}

function fmtK(n: number): string {
  return `¥${Math.round(n / 1000).toLocaleString()}k`;
}

async function loadAll() {
  const [roles, byIndustry] = await Promise.all([
    loadRoles(),
    loadRolesByIndustry(),
  ]);
  return { roles, byIndustry };
}

function getCellEntry(
  byIndustry: RolesByIndustry | null,
  industry: string,
  role: string,
): RolesByIndustryEntry | undefined {
  return byIndustry?.data?.domestic?.[industry]?.[role];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; role: string }>;
}): Promise<Metadata> {
  const { id, role } = await params;
  const ind = getIndustry(id);
  if (!ind) return {};
  const { byIndustry } = await loadAll();
  const entry = getCellEntry(byIndustry, id, role);
  if (!entry || entry.vacancyCount < MIN_VACANCY) return {};
  const median = fmtK(entry.salaryMedian);
  return {
    title: `${ind.cn}行业 × ${entry.roleName} · ${entry.vacancyCount} 条 JD · 中位 ${median}`,
    description: `${ind.cn}行业里 ${entry.roleName} 真实招聘画像：${entry.vacancyCount} 条 JD（${entry.salarySampleSize} 条带薪资样本，中位 ${median}）。主战场城市：${entry.topRegions.slice(0, 3).join(" / ")}。${ind.blurb}。AIJobFit 提供二维切片数据让你判断这个细分细方向适不适合自己。`,
    alternates: { canonical: `/industry/${id}/${role}` },
    openGraph: {
      title: `${ind.cn} × ${entry.roleName} · ${entry.vacancyCount} 条真实 JD`,
      description: `中位 ${median} · ${entry.topRegions.slice(0, 3).join(" / ")}`,
      type: "article",
      url: `/industry/${id}/${role}`,
    },
  };
}

export default async function IndustryRolePage({
  params,
}: {
  params: Promise<{ id: string; role: string }>;
}) {
  const { id, role } = await params;
  const ind = getIndustry(id);
  if (!ind) return notFound();

  const { roles, byIndustry } = await loadAll();
  const entry = getCellEntry(byIndustry, id, role);
  if (!entry || entry.vacancyCount < MIN_VACANCY) return notFound();

  const roleAtNational = roles.find((r) => r.role_id === role);
  const roleName = entry.roleName;

  // 同行业其他角色（按 vacancyCount 排序）
  const peerRoles = byIndustry
    ? Object.entries(byIndustry.data.domestic[id] || {})
        .filter(([rid, e]) => rid !== role && e.vacancyCount >= MIN_VACANCY)
        .sort(([, a], [, b]) => b.vacancyCount - a.vacancyCount)
        .slice(0, 6)
    : [];

  // 同角色其他行业（按 vacancyCount 排序）
  const peerIndustries = byIndustry
    ? Object.entries(byIndustry.data.domestic)
        .filter(([iid]) => iid !== id && INDUSTRY_LIST.some((i) => i.en === iid))
        .map(([iid, roleMap]) => ({
          industryEn: iid,
          industryCn: getIndustry(iid)?.cn || iid,
          entry: roleMap[role],
        }))
        .filter((x) => x.entry && x.entry.vacancyCount >= MIN_VACANCY)
        .sort((a, b) => b.entry!.vacancyCount - a.entry!.vacancyCount)
        .slice(0, 6)
    : [];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${ind.cn}行业 × ${roleName} · ${entry.vacancyCount} 条真实 JD`,
    description: `${ind.cn}行业 × ${roleName} 二维切片真实数据：JD 数量、薪资中位、主战场城市、同行业其他角色 / 同角色其他行业对比。`,
    datePublished: "2026-04-29",
    dateModified: new Date().toISOString().slice(0, 10),
    author: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    publisher: { "@type": "Organization", name: "AIJobFit", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/industry/${id}/${role}`,
    about: { "@type": "Thing", name: `${ind.cn} ${roleName}` },
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
      { "@type": "ListItem", position: 2, name: ind.cn, item: `${SITE_URL}/industry/${id}` },
      { "@type": "ListItem", position: 3, name: roleName, item: `${SITE_URL}/industry/${id}/${role}` },
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

      <Breadcrumb industryCn={ind.cn} industryEn={id} roleName={roleName} />

      <section className="px-4 pt-8 sm:pt-12 pb-10 max-w-5xl mx-auto w-full">
        <p className="text-xs font-mono tracking-widest text-blue-600 uppercase mb-3">
          Industry × Role · 二维切片真实 JD
        </p>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
          {ind.cn}行业 ×<br />
          <span className="text-blue-600 text-2xl sm:text-3xl font-bold">
            {roleName} 招聘画像
          </span>
        </h1>
        <p className="text-base text-slate-600 leading-relaxed mb-4 max-w-3xl">
          这是「行业 × 角色」二维切片：在 {ind.cn} 行业里，{roleName}{" "}
          这个角色真实有多少 JD、薪资多少、主战场在哪些城市。
          数据来自 {entry.salarySampleSize} 条带薪资样本（vacancyCount 总数 {entry.vacancyCount}）。
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="行业 × 角色 JD" value={entry.vacancyCount.toLocaleString()} />
          <Stat label="薪资中位" value={fmtK(entry.salaryMedian)} />
          <Stat label="样本量" value={entry.salarySampleSize.toLocaleString()} />
          <Stat
            label={
              roleAtNational
                ? "vs 全国 " + roleName + " 中位"
                : "全国对照"
            }
            value={
              roleAtNational
                ? `${entry.salaryMedian >= roleAtNational.salary.median ? "+" : ""}${
                    Math.round(((entry.salaryMedian - roleAtNational.salary.median) / roleAtNational.salary.median) * 100)
                  }%`
                : "—"
            }
          />
        </div>

        {entry.lowSample && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
            ⚠️ 样本稀薄：vacancyCount 低于上游 lowSampleThreshold 阈值，看趋势别看精确数字
          </div>
        )}
      </section>

      {/* Top regions */}
      {entry.topRegions.length > 0 && (
        <Section title="主战场城市" subtitle="本切片下 JD 最集中的城市（按计数排序）">
          <div className="flex flex-wrap gap-2">
            {entry.topRegions.slice(0, 8).map((r) => (
              <span
                key={r}
                className="bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm text-slate-700"
              >
                {r}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* 同行业其他 AI 角色 */}
      {peerRoles.length > 0 && (
        <Section
          title={`${ind.cn}行业里其他 AI 角色`}
          subtitle="同一行业下其他角色的招聘强度，帮你横向对比"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {peerRoles.map(([rid, e]) => (
              <Link
                key={rid}
                href={`/industry/${id}/${rid}`}
                className="bg-white border border-blue-100 rounded-2xl p-4 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-bold text-slate-900 text-base">{e.roleName}</h3>
                  <span className="text-xs font-mono text-blue-700 font-bold">
                    {e.vacancyCount} JD
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  中位 {fmtK(e.salaryMedian)} · {e.topRegions.slice(0, 2).join(" / ")}
                </p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* 同角色其他行业 */}
      {peerIndustries.length > 0 && (
        <Section
          title={`${roleName} 在其他行业`}
          subtitle="同一角色在其他行业的画像，帮你判断「这个角色是不是只有互联网招」"
        >
          <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-slate-700">
                <tr>
                  <th className="text-left px-4 py-3">行业</th>
                  <th className="text-right px-4 py-3">JD</th>
                  <th className="text-right px-4 py-3">中位</th>
                  <th className="text-right px-4 py-3 hidden sm:table-cell">vs 当前</th>
                </tr>
              </thead>
              <tbody>
                {peerIndustries.map((p) => {
                  const delta = Math.round(
                    ((p.entry!.salaryMedian - entry.salaryMedian) / entry.salaryMedian) * 100,
                  );
                  return (
                    <tr key={p.industryEn} className="border-t border-blue-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <Link
                          href={`/industry/${p.industryEn}/${role}`}
                          className="hover:text-blue-700 hover:underline"
                        >
                          {p.industryCn}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        {p.entry!.vacancyCount}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        {fmtK(p.entry!.salaryMedian)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono hidden sm:table-cell">
                        <span
                          className={
                            delta > 0 ? "text-emerald-700" : delta < 0 ? "text-amber-700" : "text-slate-500"
                          }
                        >
                          {delta > 0 ? "+" : ""}
                          {delta}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* National role page link */}
      {roleAtNational && (
        <Section
          title={`${roleName} 全国概览`}
          subtitle="跳出本行业，看该角色全国总画像（含技能 / 学历 / 应届口径）"
        >
          <Link
            href={`/role/${role}`}
            className="inline-block bg-white border border-blue-200 rounded-xl px-5 py-4 hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="font-bold text-slate-900 mb-1">{roleName} · 全国画像</div>
            <div className="text-xs text-slate-500">
              {roleAtNational.job_count.toLocaleString()} 条全国 JD · 中位 {fmtK(roleAtNational.salary.median)}
            </div>
          </Link>
        </Section>
      )}

      {/* CTA · 三路线 */}
      <section className="px-4 py-12 bg-blue-50/40 border-y border-blue-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">
            想看自己能不能上 {ind.cn} × {roleName}？
          </h2>
          <p className="text-sm text-slate-500 mb-6 text-center max-w-2xl mx-auto">
            10 分钟出 7 节诊断报告：技能匹配率 / Gap / 7-30-90 日补齐路径 / 薪资分布。永久免费。
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

function Breadcrumb({
  industryCn,
  industryEn,
  roleName,
}: {
  industryCn: string;
  industryEn: string;
  roleName: string;
}) {
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
        <li>
          <Link href={`/industry/${industryEn}`} className="hover:text-blue-700 hover:underline">
            {industryCn}
          </Link>
        </li>
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
        （开源 · 每周更新） · roles-by-industry endpoint（issue #9）
      </p>
    </footer>
  );
}
