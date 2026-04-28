import { PathsData } from "@/lib/reportGen";
import {
  COMMON_RESOURCES,
  TRACK_RESOURCES,
  SELF_STUDY_PLAN,
  Resource,
} from "@/data/free-resources";

function ResourceItem({ r }: { r: Resource }) {
  const inner = (
    <span className="flex items-start gap-2">
      <span className="shrink-0">{r.emoji}</span>
      <span>
        <span className="font-medium text-slate-900">{r.name}</span>
        {r.paid && (
          <span className="ml-2 text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
            付费
          </span>
        )}
        <span className="block text-xs text-slate-500">{r.description}</span>
      </span>
    </span>
  );
  return r.url ? (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block text-sm py-2 hover:bg-blue-50 rounded px-2 -mx-2 transition-colors"
    >
      {inner}
    </a>
  ) : (
    <div className="text-sm py-2 px-2 -mx-2">{inner}</div>
  );
}

export default function ReportPaths({ data }: { data: PathsData }) {
  const track = data.topTrack;
  const trackKey = track?.id || "A";
  const isFreshGrad = data.audience === "fresh-grad";

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-8">
      <h2 className="text-2xl font-black text-slate-900 mb-2">第 5 节 · 3 种学习路径</h2>
      <p className="text-sm text-slate-500 mb-6">
        我们诚实推荐 3 种路径，包括你完全可以自学的免费资源。不为了卖课贬低自学。
      </p>

      {/* 路径 A：自学 */}
      <div className="border border-slate-200 rounded-xl p-4 sm:p-5 mb-4">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {isFreshGrad
            ? "路径 A · 自学（免费 / 应届校招前的黄金窗口）"
            : "路径 A · 自学（免费 / 适合时间充裕 + 自驱力强）"}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {isFreshGrad
            ? "在校时间充裕 · 不影响应届身份 · 适合做 portfolio 项目积累"
            : "每周 10h+ · 历史上完成过自学项目 · 经济敏感"}
        </p>

        <div className="mb-4">
          <p className="text-sm font-bold text-slate-700 mb-2">3 个月学习路线</p>
          <div className="space-y-2">
            {SELF_STUDY_PLAN.map((m) => (
              <div key={m.month} className="bg-slate-50 rounded-lg p-3 text-sm">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-bold text-slate-900">{m.month}</span>
                  <span className="text-xs font-mono text-slate-500">{m.hours}</span>
                </div>
                <p className="text-slate-700 mb-1">{m.topic}</p>
                <ul className="text-xs text-slate-500 list-disc pl-4 space-y-0.5">
                  {m.resources.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-bold text-slate-700 mb-1">通用资源（所有人都该看）</p>
          <div className="divide-y divide-slate-100">
            {COMMON_RESOURCES.map((r) => (
              <ResourceItem key={r.name} r={r} />
            ))}
          </div>
        </div>

        {track && (
          <div>
            <p className="text-sm font-bold text-slate-700 mb-1">
              {TRACK_RESOURCES[trackKey].title} 专项资源
            </p>
            <div className="divide-y divide-slate-100">
              {TRACK_RESOURCES[trackKey].resources.map((r) => (
                <ResourceItem key={r.name} r={r} />
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
          ⚠️ 自学风险：80% 自学者中途放弃；缺反馈循环、孤单。如果你属于「自己很难逼自己」那一类，可以看路径 B。
        </p>
      </div>

      {/* 路径 B：3800 就业班 */}
      <div className="border border-blue-200 rounded-xl p-4 sm:p-5 mb-4 bg-blue-50/30">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {isFreshGrad
            ? "路径 B · 3800 就业班（应届秋招 / 春招冲刺最佳节奏）"
            : "路径 B · 3800 就业班（适合需要节奏感 + 教练 + 同伴）"}
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          {isFreshGrad
            ? "12 周陪跑刚好衔接秋招 / 春招 · 同班分流 · 不打饥饿营销"
            : "12 周陪跑 · 同班分流 · 每月开 1 期 · 不打饥饿营销"}
        </p>

        <div className="text-sm text-slate-700 space-y-1.5 mb-3">
          <p>· 12 周陪跑（每周 1 次群直播 + 1 次 1V1 教练 + 班主任督学）</p>
          <p>· 一个真实项目（按你主线方向定制）</p>
          <p>· 完整 portfolio（简历改造 + Demo 视频 + 模拟面试录像）</p>
          <p>· 加入校友社群</p>
        </div>

        <div className="text-xs text-slate-600 space-y-1 bg-white rounded p-3">
          <p>❌ 不承诺包就业</p>
          <p>✅ 承诺毕业 90 天后公布全班真实就业数据（offer 率 / 薪资 / 失败案例）</p>
          <p>✅ 不挂续费班</p>
        </div>
      </div>

      {/* 路径 C：1V1 */}
      <div className="border border-slate-200 rounded-xl p-4 sm:p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          路径 C · 1V1 深度服务（999+，规划中）
        </h3>
        <p className="text-xs text-slate-500 mb-2">
          适合已有清晰目标 / 时间稀缺 / 需要个性化求职策略的人
        </p>
        <p className="text-sm text-slate-700">预计 2026 年底上线。当前阶段建议先选 A 或 B。</p>
      </div>
    </section>
  );
}
