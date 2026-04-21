import { CoverData } from "@/lib/reportGen";

export default function ReportCover({ data }: { data: CoverData }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8 md:p-12">
      <p className="text-sm font-mono tracking-widest text-blue-600 uppercase mb-3">
        AI Career Diagnosis · Report #{data.reportId}
      </p>
      <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{data.title}</h1>
      <p className="text-sm text-slate-500 mb-6">生成于 {data.generatedAt}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-slate-500">当前职位</p>
          <p className="font-semibold text-slate-900 truncate">{data.currentJob || "—"}</p>
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

      {/* 4 主线匹配度横向 bar */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-3">你和 4 主线的匹配度</h3>
        <div className="space-y-2">
          {data.trackScores.map(({ track, score }) => (
            <div key={track.id} className="flex items-center gap-3">
              <span className="w-32 md:w-40 text-sm font-medium text-slate-700 shrink-0">
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
    </section>
  );
}
