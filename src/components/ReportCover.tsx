import { CoverData, AugmentTargetData } from "@/lib/reportGen";

export default function ReportCover({
  data,
  augment,
}: {
  data: CoverData;
  augment?: AugmentTargetData;
}) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-8 md:p-12">
      <p className="text-sm font-mono tracking-widest text-blue-600 uppercase mb-3">
        AI Career Diagnosis · Report #{data.reportId}
      </p>
      <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{data.title}</h1>
      <p className="text-sm text-slate-500 mb-2">生成于 {data.generatedAt}</p>
      {data.industryContext && (
        <p className="text-xs sm:text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-6 inline-block">
          {data.industryContext.inferred ? "🔎 推断行业 · " : "📊 "}
          {data.industryContext.industryCN}行业 {data.industryContext.jobCount} 条 AI 增强 JD
          （薪资样本 {data.industryContext.salarySampleSize}）· 其他行业对照见 Section 2
        </p>
      )}
      {!data.industryContext && <div className="mb-6" />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-slate-500">当前职位</p>
          <p className="font-semibold text-slate-900 break-words">{data.currentJob || "—"}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-slate-500">工作年限</p>
          <p className="font-semibold text-slate-900">{data.yearsExp}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-slate-500">学历</p>
          <p className="font-semibold text-slate-900">{data.education}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-slate-500">城市</p>
          <p className="font-semibold text-slate-900">{data.city || "—"}</p>
        </div>
      </div>

      {data.route === "A" && (
        <>
          {/* 4 主线匹配度横向 bar */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-700 mb-3">你和 4 主线的匹配度</h3>
            <div className="space-y-2">
              {data.trackScores.map(({ track, score }) => (
                <div key={track.id} className="flex items-center gap-2 sm:gap-3">
                  <span className="w-24 sm:w-32 md:w-40 text-xs sm:text-sm font-medium text-slate-700 shrink-0">
                    {track.id} · {track.name}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-700"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-mono font-bold text-blue-700">
                    {score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 3 角色 */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">你最匹配的 3 个角色</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.topRoles.map((r, idx) => (
                <div
                  key={r.roleName}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <p className="text-xs text-blue-600 font-mono mb-1">#{idx + 1}</p>
                  <p className="font-bold text-slate-900 text-sm mb-1">{r.roleName}</p>
                  <p className="text-2xl font-black text-blue-700">{r.matchScore}%</p>
                  <p className="text-xs text-slate-500 mt-1">匹配度</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {data.route === "B" && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3">你锁定的目标</h3>
          {data.lockedTarget && data.topRoles[0] ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-xs text-blue-600 font-mono mb-1">TARGET</p>
              <div className="flex items-baseline justify-between flex-wrap gap-3">
                <div>
                  {data.lockedTarget.industry && (
                    <p className="text-sm text-slate-600 mb-1">
                      {data.lockedTarget.industry} 行业
                    </p>
                  )}
                  <p className="text-xl sm:text-2xl font-black text-slate-900">
                    {data.lockedTarget.roleName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl sm:text-5xl font-black text-blue-700">
                    {data.topRoles[0].matchScore}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">综合匹配度</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">未锁定目标，请回到 /diagnose-target 重新选择</p>
          )}
        </div>
      )}

      {data.route === "C" && augment && (
        <div className="space-y-4">
          {/* 留行版：原职业 + AI 增强 头条 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-xs text-blue-600 font-mono mb-1">
              留行 + AI 增强 · {augment.matchType === "fuzzy" ? "模糊匹配" : "精确匹配"}
            </p>
            <div className="flex items-baseline justify-between flex-wrap gap-3 mb-3">
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">
                  {augment.matchedKey}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  原职业 · 不转行 · 在原岗位加 AI 杠杆
                </p>
              </div>
              {augment.vacancyCount > 0 && (
                <div className="text-right">
                  <p className="text-3xl sm:text-4xl font-black text-blue-700">
                    {augment.vacancyCount}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">条 AI 增强真实 JD</p>
                </div>
              )}
            </div>

            {/* 准备度档位 */}
            {augment.readiness.tier !== "no-data" && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  augment.readiness.tier === "first-class"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                    : augment.readiness.tier === "mid"
                      ? "bg-amber-50 border border-amber-200 text-amber-900"
                      : "bg-rose-50 border border-rose-200 text-rose-900"
                }`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-base font-black">{augment.readiness.label}</span>
                  <span className="text-xs font-mono">
                    {augment.readiness.matchedCount} / {augment.readiness.totalCount} 项 AI 技能命中
                  </span>
                </div>
                <p className="text-xs leading-relaxed">{augment.readiness.message}</p>
              </div>
            )}
            {augment.readiness.tier === "no-data" && (
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                {augment.readiness.message}
              </p>
            )}
          </div>

          {/* 模糊匹配的同义近邻：「你是不是想说…」*/}
          {augment.alternatives.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-2">数据集里相近的原职业：</p>
              <div className="flex flex-wrap gap-2">
                {augment.alternatives.map((a) => (
                  <span
                    key={a.matchedKey}
                    className="text-xs bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-full"
                  >
                    {a.matchedKey} · {a.vacancyCount} JD · ¥
                    {Math.round(a.salaryMedian / 1000)}k
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
