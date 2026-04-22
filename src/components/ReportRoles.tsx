import { RolesData } from "@/lib/reportGen";

export default function ReportRoles({ data }: { data: RolesData }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-8">
      <h2 className="text-2xl font-black text-slate-900 mb-2">第 2 节 · 市场全景</h2>
      <p className="text-sm text-slate-500 mb-6">
        基于国内 {data.totalJDs.toLocaleString()} 条真实 JD 聚类的 {data.totalRoles} 个 AI
        角色中，与你最匹配的 Top 3。
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
