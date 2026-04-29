import { RolesData, AugmentTargetData } from "@/lib/reportGen";

export default function ReportRoles({
  data,
  augment,
}: {
  data: RolesData;
  augment?: AugmentTargetData;
}) {
  // 路线 C 完全替换内容：不展示 14 角色 Top 3，改成「原职业 + AI 增强」全景
  if (data.route === "C" && augment) {
    return <RouteCOverview data={data} augment={augment} />;
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-8">
      <h2 className="text-2xl font-black text-slate-900 mb-2">
        {data.route === "B" ? "第 2 节 · 你的目标匹配度" : "第 2 节 · 市场全景"}
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        {data.route === "B"
          ? `基于国内 ${data.totalJDs.toLocaleString()} 条真实 JD 聚类，分析你锁定的目标角色的匹配情况。`
          : `基于国内 ${data.totalJDs.toLocaleString()} 条真实 JD 聚类的 ${data.totalRoles} 个 AI 角色中，与你最匹配的 Top 3。`}
      </p>

      <div className="space-y-4">
        {data.topMatches.map((m, idx) => (
          <div
            key={m.roleId}
            className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-blue-50/30"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-blue-600 font-mono mb-1">#{idx + 1}</p>
                <h3 className="text-lg font-bold text-slate-900">{m.roleName}</h3>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-blue-700">{m.matchScore}%</p>
                <p className="text-xs text-slate-500">匹配度</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm mb-3">
              <div>
                <p className="text-slate-500 text-xs">JD 数量</p>
                <p className="font-bold text-slate-900">{m.role.job_count}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">中位月薪</p>
                <p className="font-bold text-slate-900">
                  {m.role.salary.median.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">P25 / P75</p>
                <p className="font-bold text-slate-900 text-xs">
                  {m.role.salary.p25.toLocaleString()} - {m.role.salary.p75.toLocaleString()}
                </p>
              </div>
            </div>

            {m.matchedSkills.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-500 mb-1">你已匹配的关键技能：</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.matchedSkills.slice(0, 8).map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div
              className={`mt-3 rounded-lg border p-3 text-sm ${
                m.whyMatched.zeroHit
                  ? "border-rose-200 bg-rose-50/50"
                  : m.whyMatched.educationPenalty ||
                      m.whyMatched.lowConfidence ||
                      (m.whyMatched.industryFit && !m.whyMatched.industryFit.match)
                    ? "border-amber-200 bg-amber-50/50"
                    : "border-slate-200 bg-slate-50/60"
              }`}
            >
              <p className="text-xs font-bold text-slate-700 mb-1.5">为什么是你？</p>
              <ul className="space-y-1 text-slate-700 leading-relaxed">
                {m.whyMatched.reasoning.map((line, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-slate-400">·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {m.role.top_industries && m.role.top_industries.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Top 行业：
                {m.role.top_industries
                  .slice(0, 3)
                  .map((i) => `${i.industry}(${i.count})`)
                  .join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function RouteCOverview({
  data,
  augment,
}: {
  data: RolesData;
  augment: AugmentTargetData;
}) {
  if (augment.matchType === "no-match") {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">第 2 节 · 市场全景</h2>
        <p className="text-sm text-slate-600">
          {augment.readiness.message}
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-8">
      <h2 className="text-2xl font-black text-slate-900 mb-2">第 2 节 · 市场全景</h2>
      <p className="text-sm text-slate-500 mb-6">
        基于国内 {data.totalJDs.toLocaleString()} 条 JD 中筛出的「{augment.matchedKey} +
        AI 增强」真实岗位 {augment.vacancyCount} 条。
      </p>

      {/* sampleTitles 真实岗位标题 */}
      {augment.sampleTitles.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-bold text-slate-700 mb-2">真实在招岗位（取样）</p>
          <ul className="space-y-1.5">
            {augment.sampleTitles.map((t) => (
              <li
                key={t}
                className="text-sm text-slate-700 bg-slate-50 rounded px-3 py-2 border border-slate-200"
              >
                · {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* topIndustries 行业占比 */}
      {augment.topIndustries.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-bold text-slate-700 mb-3">该原职业 + AI 增强的 Top 行业</p>
          <div className="space-y-2">
            {augment.topIndustries.map((i) => (
              <div key={i.industry} className="flex items-center gap-2 sm:gap-3">
                <span className="w-20 text-xs sm:text-sm font-medium text-slate-700 shrink-0">
                  {i.industryCN}
                </span>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-700"
                    style={{ width: `${i.pct}%` }}
                  />
                </div>
                <span className="w-16 text-right text-xs font-mono font-bold text-blue-700">
                  {i.count} JD
                </span>
                <span className="w-10 text-right text-xs font-mono text-slate-500">
                  {i.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* augmentSkills 频次 + 命中标记 */}
      {augment.augmentSkills.length > 0 && (
        <div>
          <p className="text-sm font-bold text-slate-700 mb-2">
            该原职业 AI 增强 JD 中出现的关键技能
          </p>
          <div className="flex flex-wrap gap-2">
            {augment.augmentSkills.map((s) => (
              <span
                key={s.skillId}
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  s.userHas
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {s.userHas ? "✓ " : "✗ "}
                {s.skillName} · {s.count}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            ✓ = 你已掌握 · ✗ = 你还缺。数字表示该技能在 {augment.vacancyCount} 条 JD 里出现的次数。
          </p>
        </div>
      )}
    </section>
  );
}
