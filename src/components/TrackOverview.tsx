import Link from "next/link";
import { TRACKS, Track } from "@/data/tracks";

// Pure presentation — 既能在 server （首页 async fetch E stats 后传入）也能在 client
// （form step 2 折叠面板）使用。
//
// dynamicETrack: 可选，server 端 fetch roles-augmented-by-profession.json 后构造的
// E 主线对象（含运行时 jdCount/medianSalary）。client 渲染时传 undefined，E 卡片显示
// 静态文案（不展示 0 JD 误导）。

interface Props {
  dynamicETrack?: { jdCount: number; medianSalary: number; professionCount: number };
}

export default function TrackOverview({ dynamicETrack }: Props = {}) {
  const tracks: Track[] = TRACKS.map((t) => {
    if (t.id === "E" && dynamicETrack) {
      return { ...t, jdCount: dynamicETrack.jdCount, medianSalary: dynamicETrack.medianSalary };
    }
    return t;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {tracks.map((t) => (
        <div
          key={t.id}
          className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col ${
            t.isAugmentationTrack ? "border-emerald-200 bg-emerald-50/30" : "border-blue-100"
          }`}
        >
          <div className="mb-2">
            <h3 className="font-bold text-slate-900 leading-tight">
              <span
                className={`font-mono mr-1 ${
                  t.isAugmentationTrack ? "text-emerald-700" : "text-blue-600"
                }`}
              >
                {t.id} ·
              </span>
              {t.name}
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">{t.nameEn}</p>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            {t.jdCount > 0 ? (
              <>
                {t.jdCount.toLocaleString()} JD · 中位{" "}
                {(t.medianSalary / 1000).toFixed(1)}K/月
              </>
            ) : t.isAugmentationTrack ? (
              "填原职业看实时 JD 数 + 薪资中位"
            ) : (
              "数据加载中…"
            )}
            {t.isAugmentationTrack && dynamicETrack && dynamicETrack.professionCount > 0 && (
              <span className="block text-emerald-700 mt-0.5">
                覆盖 {dynamicETrack.professionCount} 个原职业
              </span>
            )}
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

          <div className="mb-3">
            <p className="text-[11px] text-slate-500 mb-1">关键技能：</p>
            <div className="flex flex-wrap gap-1">
              {t.keySkills.map((s) => (
                <span
                  key={s}
                  className={`text-[11px] px-1.5 py-0.5 rounded border ${
                    t.isAugmentationTrack
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-2 border-t border-slate-100">
            <Link
              href={t.ctaPath}
              className={`text-xs font-medium hover:underline ${
                t.isAugmentationTrack ? "text-emerald-700" : "text-blue-600"
              }`}
            >
              {t.isAugmentationTrack
                ? "填原职业开始诊断（Route C）→"
                : "走 Route B 锁定这个方向 →"}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
