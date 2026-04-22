import { GapData } from "@/lib/reportGen";

const priorityStyle = {
  high: "bg-red-50 text-red-700 border-red-200",
  mid: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-600 border-slate-200",
};

const priorityLabel = {
  high: "先补",
  mid: "后补",
  low: "锦上添花",
};

export default function ReportGap({ data }: { data: GapData }) {
  if (data.totalRequired === 0) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-8">
      <h2 className="text-2xl font-black text-slate-900 mb-2">第 4 节 · 技能 Gap 分析</h2>
      <p className="text-sm text-slate-500 mb-6">
        基于你最匹配的角色「{data.topRoleName}」的真实 JD 关键词频次。
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm">
          <span className="font-bold text-blue-900">已掌握：</span>
          <span className="font-black text-2xl text-blue-700 mx-2">{data.matchedCount}</span>
          <span className="text-slate-500">/ {data.totalRequired} 项 required 技能</span>
        </p>
      </div>

      {data.matchedSkills.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-bold text-slate-700 mb-2">✅ 你已掌握</p>
          <div className="flex flex-wrap gap-2">
            {data.matchedSkills.map((s) => (
              <span
                key={s}
                className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.missingSkills.length > 0 && (
        <div>
          <p className="text-sm font-bold text-slate-700 mb-3">❌ 主要 Gap（按 JD 出现频次排序）</p>
          <div className="space-y-2">
            {data.missingSkills.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between gap-3 bg-slate-50 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-medium text-slate-900 truncate">{s.name}</span>
                  <span className="text-xs font-mono text-slate-400 shrink-0">
                    JD 出现 {s.importance} 次
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${priorityStyle[s.priority]}`}
                >
                  {priorityLabel[s.priority]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
