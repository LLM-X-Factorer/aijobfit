import type { Metadata } from "next";
import Link from "next/link";
import TrackOverviewServer from "@/components/TrackOverviewServer";
import { loadNarrativeStats, loadRoles } from "@/lib/serverData";
import { BLOG_POSTS, CATEGORY_LABELS } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "非程序员 AI 求职定位诊断 · 8238 条真实 JD · 14 角色聚类",
  description:
    "运营 / HR / 设计 / 教师 / 电气工程师 / 财务 / 销售想转 AI 或留行加 AI 技能？AIJobFit 用 8238 条国内真实 JD + 14 角色聚类，10 分钟告诉你适合哪个 AI 岗位、缺什么技能、薪资多少。三路线诊断（转行 / 留行 + AI / 系统 Top 3），永久免费，不卖课。",
  alternates: { canonical: "/" },
};

async function fetchHomeStats() {
  const [stats, roles] = await Promise.all([loadNarrativeStats(), loadRoles()]);
  const jdLabeled = stats?.totals.labeled_jobs ?? 5673;
  const jdAll = stats?.totals.all_jobs ?? 8238;
  const rolesTotal = roles.filter((r) => r.role_id !== "other").length;
  return { jdLabeled, jdAll, rolesTotal };
}

const FAQ: { q: string; a: string }[] = [
  {
    q: "AIJobFit 是免费的吗？要付费解锁吗？",
    a: "永久免费。报告 7 节里前 3 节（封面 / Top 3 角色 / 薪资）直接看，后 4 节（Gap / 路径 / 7-30-90 Action / 资源）扫码加小助理微信领统一激活码 AIJOB-2026 解锁，整个产品不收费。1V1 咨询、社群、课程在产品外独立运营，与本工具解耦。",
  },
  {
    q: "数据从哪来？为什么说是真实 JD？",
    a: "数据来自开源仓库 Agent Hunt（github.com/LLM-X-Factorer/agent-hunt），从国内主流招聘平台抓取 8238 条 AI 相关岗位 JD（截至 2026-04-29 已聚类 5673 条），每周更新。每个角色页都附带 JD 数量、薪资 P25/P50/P75、行业分布、城市 tier 分布，所有结论可追溯到样本量。",
  },
  {
    q: "我是电气工程师 / 教师 / 医生 / 销售 / 设计师，能转 AI 吗？",
    a: "AIJobFit 覆盖 420 条长尾原职业，每条都有「原职业 + AI 增强」真实 JD 数据。比如电气工程师对应制造 / 能源行业的智能制造 AI 岗位，教师对应教育 AI，销售对应 AI 销售 / 商务，设计师对应 AIGC 创意。你既可以选「转行」路线（看自己能不能上 AI 产品经理 / AI 运营），也可以选「留行 + AI 增强」路线（保留原职业，看 AI 增强后的岗位画像）。",
  },
  {
    q: "应届生 / 在读学生可以用吗？",
    a: "可以。表单分支会问你是「在读学生 / 应届无实习 / 应届有实习」，报告会切换为应届口径：每个角色拆出校招岗 / 实习岗 / 应届可投岗位数 + 应届薪资中位（社招中位的 60%-80%），并标注哪些角色的应届友好度更高。",
  },
  {
    q: "三条路线（转行 / 留行 + AI / 系统推荐）我该选哪个？",
    a: "首页两个主 CTA 二选一即可：(1) 想转去做 AI 角色 → 选「转行 Gap 诊断」，自己锁定行业 + 岗位看匹配率；(2) 不想离开原行业但想加 AI 技能 → 选「留行 + AI 增强」，填原职业看 AI 增强 JD。如果两个都不确定，走兜底「让系统基于你的技能推荐 Top 3」。三条路线的算法和数据切片不同，结论不互相替代。",
  },
  {
    q: "10 分钟出报告，AI 生成的吗？质量靠谱吗？",
    a: "不是 AI 生成。报告 7 节全部由确定性算法生成：技能命中 + 稀疏聚类置信度惩罚 + 行业 hard filter + 学历惩罚 + targetTrack 加成；whyMatched 推理链可解释（你能看到为什么是这个推荐，而不是黑盒）。整体逻辑 + 数据切片在 GitHub 公开。",
  },
  {
    q: "报告里推荐的课程是付费的吗？会强行卖课吗？",
    a: "不会。第 6 节是「自学 / 课程 / 1V1」3 选 1 路径，其中自学路径会诚实推 Datawhale / 阿里云 ModelScope / 李宏毅 LLM 课等免费资源，绝不为了卖课贬低自学。报告里完全没有「今晚优惠」「仅剩 X 名额」的催单。",
  },
  {
    q: "5 主线（A 产品 / B 运营 / C 转型咨询 / D AIGC / E 留行 + AI）的差别？",
    a: "A-D 是转行轨道，背后对应 14 角色聚类的不同子集：A AI 产品经理（293 JD · 中位 ¥32.5k），B AI 运营 / 训练师（95 JD · ¥23k），C AI 转型咨询（71 JD · ¥35k），D AIGC 创意（剪映 / SD / Midjourney 工具方向）。E 是留行 + AI 增强轨道，不参与 A-D 匹配，单独从 420 长尾原职业 + AI 增强 JD 算准备度档位。",
  },
];

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

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

      {/* Blog · 深度文章入口 */}
      <section className="px-4 pb-10 sm:pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            深度文章 · {BLOG_POSTS.length} 篇
          </h2>
          <p className="text-sm text-slate-500 mb-5">
            基于真实 JD 的数据深度分析，永久免费阅读
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {BLOG_POSTS.slice(0, 4).map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="bg-white border border-blue-100 rounded-xl px-4 py-3 text-left hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <p className="text-xs text-slate-500 font-mono mb-1">
                  {p.publishedAt} · {CATEGORY_LABELS[p.category]}
                </p>
                <p className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {p.title}
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/blog"
            className="inline-block text-sm text-blue-600 hover:underline"
          >
            查看全部 {BLOG_POSTS.length} 篇 →
          </Link>
        </div>
      </section>

      {/* FAQ — 可见 + FAQPage schema 双重作用：用户答疑 + AI / 搜索引擎引用 */}
      <section className="px-4 pb-16 sm:pb-20" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 text-center">
            常见问题
          </h2>
          <p className="text-sm text-slate-500 mb-8 text-center">
            非程序员转 AI / 留行 + AI 增强 / 应届生 AI 求职 — 高频疑问
          </p>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group bg-white border border-blue-100 rounded-xl px-5 py-4 shadow-sm open:shadow-md transition-shadow"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-slate-900 text-sm sm:text-base">
                  <span>{f.q}</span>
                  <span className="ml-4 text-blue-600 transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />

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
