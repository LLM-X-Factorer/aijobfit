import { SalaryData } from "@/lib/reportGen";

export default function ReportSalary({ data }: { data: SalaryData }) {
  if (data.p50 === 0) return null;

  // 用一个简化的"水平刻度"图：P25 / P50 / P75，加上用户期望（如果有）
  const min = data.p25;
  const max = data.p75;
  const range = max - min || 1;
  const userMid =
    data.userExpectedMin && data.userExpectedMax
      ? ((data.userExpectedMin + data.userExpectedMax) / 2) * 1000
      : null;

  // 把刻度扩展 20% 容纳用户超出区间的情况
  const visMin = userMid !== null ? Math.min(min, userMid) * 0.95 : min * 0.95;
  const visMax = userMid !== null ? Math.max(max, userMid) * 1.05 : max * 1.05;
  const visRange = visMax - visMin || 1;
  const pct = (val: number) => `${Math.max(0, Math.min(100, ((val - visMin) / visRange) * 100))}%`;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8">
      <h2 className="text-2xl font-black text-slate-900 mb-2">第 3 节 · 薪资定位</h2>
      <p className="text-sm text-slate-500 mb-6">{data.message}</p>

      <div className="bg-slate-50 rounded-xl p-6">
        <p className="text-sm font-bold text-slate-700 mb-4">
          {data.topRoleName} 的薪资分布（月薪 / 元）
        </p>

        <div className="relative h-20">
          {/* 主区间 P25 - P75 */}
          <div
            className="absolute top-6 h-6 bg-blue-200 rounded-full"
            style={{
              left: pct(min),
              width: `calc(${pct(max)} - ${pct(min)})`,
            }}
          />
          {/* 中位线 P50 */}
          <div
            className="absolute top-4 h-10 w-1 bg-blue-700"
            style={{ left: pct(data.p50) }}
          />
          {/* 用户期望点 */}
          {userMid !== null && (
            <div
              className="absolute top-2 flex flex-col items-center"
              style={{ left: pct(userMid), transform: "translateX(-50%)" }}
            >
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow" />
              <span className="text-xs font-mono text-red-600 mt-1 whitespace-nowrap">你</span>
            </div>
          )}
        </div>

        <div className="flex justify-between text-xs text-slate-500 mt-3 font-mono">
          <span>P25 · {data.p25.toLocaleString()}</span>
          <span className="text-blue-700 font-bold">P50 · {data.p50.toLocaleString()}</span>
          <span>P75 · {data.p75.toLocaleString()}</span>
        </div>
      </div>

      {data.reality === "above" && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
          ⚠️ 期望偏高：达成 P75+ 通常需要垂直行业 know-how 或 AI 工具组合优势。
        </p>
      )}
      {data.reality === "below" && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-4">
          💡 期望偏低：可以更自信，市场实际可以更高。
        </p>
      )}
    </section>
  );
}
