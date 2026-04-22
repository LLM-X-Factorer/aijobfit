import Link from "next/link";

const HIGHLIGHTS = [
  { num: "2,370", label: "条真实 JD" },
  { num: "14", label: "个角色聚类" },
  { num: "4", label: "条主线" },
  { num: "10 min", label: "完成诊断" },
];

const SELLING_POINTS = [
  {
    icon: "📊",
    title: "基于真实 JD 数据",
    desc: "不是凭空话术：所有结论都来自 Agent Hunt 平台 2370 条真实招聘数据反推。",
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

export default function Home() {
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
          用 2370+ 条真实招聘 JD 数据，10 分钟告诉你适合做什么 AI 岗位、缺什么技能、怎么补。
        </p>
        <p className="text-sm text-slate-500 mb-10">
          运营 / 设计 / HR / 营销 / 咨询 / 传统行业转 AI · 不卖课不催单
        </p>

        <Link
          href="/diagnose"
          className="inline-block bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-4 rounded-full shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
        >
          免费做一次诊断 →
        </Link>
        <p className="text-xs text-slate-400 mt-3">
          永久免费 · 无需注册 · 10 分钟出报告
        </p>

        {/* 数据锚点 */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-2xl w-full">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="text-center">
              <p className="text-2xl md:text-3xl font-black text-blue-700 font-mono">{h.num}</p>
              <p className="text-xs text-slate-500 mt-1">{h.label}</p>
            </div>
          ))}
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
          v0.6（2370 JD · 14 角色聚类 · SCI 评分）
        </p>
      </footer>
    </main>
  );
}
