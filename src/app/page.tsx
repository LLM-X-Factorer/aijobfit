import Link from "next/link";
import TrackOverviewServer from "@/components/TrackOverviewServer";
import { loadNarrativeStats, loadRoles } from "@/lib/serverData";

// 不写死 2370 / 14 — 数据上游在涨。runtime 拉 narrative-stats，远程不可达就用 floor。
async function fetchHomeStats() {
  const [stats, roles] = await Promise.all([loadNarrativeStats(), loadRoles()]);
  const jdLabeled = stats?.totals.labeled_jobs ?? 5673;
  const jdAll = stats?.totals.all_jobs ?? 8238;
  const rolesTotal = roles.filter((r) => r.role_id !== "other").length;
  return { jdLabeled, jdAll, rolesTotal };
}

const SELLING_POINTS = [
  {
    icon: "📊",
    title: "基于真实 JD 数据",
    desc: "不是凭空话术：所有结论都来自 Agent Hunt 平台数千条真实招聘数据反推。",
  },
  {
    icon: "🎯",
    title: "诚实推免费资源",
    desc: "报告里直接给你 Datawhale / 阿里云 ModelScope / 李宏毅 LLM 等免费学习资源。不为了卖课贬低自学。",
  },
  {
    icon: "🚫",
    title: "不催买、不饥饿营销",
    desc: "不打「今晚优惠 1000」「仅剩 2 个名额」。课程只在最后一节作为 3 选 1 路径之一。",
  },
];

export default async function Home() {
  const { jdLabeled, jdAll, rolesTotal } = await fetchHomeStats();
  const highlights = [
    { num: jdAll.toLocaleString(), label: "条真实 JD" },
    { num: String(rolesTotal), label: "个角色聚类" },
    { num: "4", label: "条主线" },
    { num: "10 min", label: "完成诊断" },
  ];
  return (
    <main className="flex-1 flex flex-col bg-grid">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-14 sm:py-20 text-center">
        <p className="text-xs font-mono tracking-widest text-blue-600 uppercase mb-4">
          AI Career Fit Diagnosis · v0.1
        </p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 max-w-3xl mb-5">
          给非程序员的
          <br className="md:hidden" />
          <span className="text-blue-600"> AI 求职定位</span>诊断
        </h1>
        <p className="text-base md:text-lg text-slate-600 max-w-xl mb-2">
          用 {jdAll.toLocaleString()}+ 条真实招聘 JD 数据，10 分钟告诉你适合做什么 AI 岗位、缺什么技能、怎么补。
        </p>
        <p className="text-sm text-slate-500 mb-10">
          运营 / 设计 / HR / 营销 / 咨询 / 传统行业转 AI · 不卖课不催单
        </p>

        <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
          {/* 双主 CTA：转行（B）/ 留行（C） */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Link
              href="/diagnose-target"
              className="flex flex-col items-center text-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-5 py-5 rounded-2xl shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <span className="text-base sm:text-lg">我想转行做 AI 角色</span>
              <span className="text-xs font-normal opacity-90 mt-1.5 leading-relaxed">
                选行业 + 岗位 → 算匹配率 + Gap
              </span>
            </Link>
            <Link
              href="/diagnose-augment"
              className="flex flex-col items-center text-center bg-white hover:bg-slate-50 border-2 border-blue-600 text-blue-700 font-bold px-5 py-5 rounded-2xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <span className="text-base sm:text-lg">我留在原行业 + 加 AI 技能</span>
              <span className="text-xs font-normal opacity-90 mt-1.5 leading-relaxed text-slate-500">
                填原职业 → 看 AI 增强 JD + 缺什么
              </span>
            </Link>
          </div>
          {/* A 兜底链接 */}
          <Link
            href="/diagnose"
            className="text-sm text-slate-500 hover:text-blue-700 underline underline-offset-4 decoration-slate-300 hover:decoration-blue-700"
          >
            两个都不确定？让系统基于你的技能推荐 Top 3
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          永久免费 · 无需注册 · 10 分钟出报告
        </p>
        <div className="mt-4 max-w-xl text-xs text-slate-500 leading-relaxed">
          <p>
            转行 vs 留行的差别：转行算「你能不能上 AI 产品经理」；留行算「电气工程师 +
            AI 技能」这个画像在国内有多少 JD、薪资、你掌握了多少。
          </p>
        </div>

        {/* 数据锚点 */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-2xl w-full">
          {highlights.map((h) => (
            <div key={h.label} className="text-center">
              <p className="text-2xl md:text-3xl font-black text-blue-700 font-mono">{h.num}</p>
              <p className="text-xs text-slate-500 mt-1">{h.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5 主线总览 */}
      <section className="px-4 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 text-center">
            5 条 AI 求职主线
          </h2>
          <p className="text-sm text-slate-500 mb-8 text-center max-w-2xl mx-auto">
            A-D 是转行轨道（系统按你技能 + 行业匹配 14 角色聚类）；E 是留行轨道（保留原职业 + 加 AI 技能）。
          </p>
          <TrackOverviewServer />
        </div>
      </section>

      {/* 卖点 */}
      <section className="px-4 pb-16 sm:pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {SELLING_POINTS.map((p) => (
            <div
              key={p.title}
              className="bg-white border border-blue-100 rounded-2xl p-5 sm:p-6 shadow-sm"
            >
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-4 py-6 text-center text-xs text-slate-500 bg-white">
        <p>
          数据来自{" "}
          <a
            href="https://github.com/LLM-X-Factorer/agent-hunt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Agent Hunt
          </a>
          {" · "}
          {jdLabeled.toLocaleString()} 已聚类 JD / {jdAll.toLocaleString()} 总 JD · {rolesTotal} 角色聚类 · SCI 评分
        </p>
      </footer>
    </main>
  );
}
