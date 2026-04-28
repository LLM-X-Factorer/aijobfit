import { TRACKS } from "@/data/tracks";

export default function TrackOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {TRACKS.map((t) => (
        <div
          key={t.id}
          className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm flex flex-col"
        >
          <div className="mb-2">
            <h3 className="font-bold text-slate-900 leading-tight">
              <span className="text-blue-600 font-mono mr-1">{t.id} ·</span>
              {t.name}
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">{t.nameEn}</p>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            {t.jdCount} JD · 中位 {(t.medianSalary / 1000).toFixed(1)}K/月
          </p>

          <div className="mb-2.5">
            <p className="text-[11px] text-slate-500 mb-1">适合：</p>
            <div className="flex flex-wrap gap-1">
              {t.targetUsers.map((u) => (
                <span
                  key={u}
                  className="text-[11px] bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                >
                  {u}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] text-slate-500 mb-1">关键技能：</p>
            <div className="flex flex-wrap gap-1">
              {t.keySkills.map((s) => (
                <span
                  key={s}
                  className="text-[11px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
