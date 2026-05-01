import Link from "next/link";
import { Suspense } from "react";
import DiagnosisForm from "@/components/DiagnosisForm";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

const HOWTO_LD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "如何 10 分钟找到适合你的 AI 角色（系统推荐 Top 3）",
  description:
    "用 AIJobFit 三路线诊断的 A 路线（系统推荐）：填技能 + 背景信息，算法基于 5673 条已聚类的国内真实 AI 招聘 JD + 14 角色聚类，匹配并展示最适合你的 Top 3 AI 角色 + 4 主线分布 + Gap + 7/30/90 行动路径。永久免费。",
  totalTime: "PT10M",
  inLanguage: "zh-CN",
  image: `${SITE_URL}/api/og`,
  url: `${SITE_URL}/diagnose`,
  supply: [
    { "@type": "HowToSupply", name: "你已掌握的技能清单（36 项 AI 通用技能可勾选）" },
    { "@type": "HowToSupply", name: "你的背景信息（当前职业 / 年限 / 行业 / 学历 / 期望薪资 / 城市）" },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "填技能 + 背景",
      text: "在表单里勾选你已经掌握的 AI 通用技能（如 prompt engineering / langchain / midjourney），并填写当前职业、工作年限、所在行业、学历、期望薪资、城市等背景信息。约 3 分钟。",
      url: `${SITE_URL}/diagnose#form`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "提交诊断",
      text: "提交后，系统用技能命中 + 稀疏聚类置信度惩罚 + industry hard filter（行业匹配硬过滤）+ 主线指纹扫描算出 Top 3 AI 角色匹配，全部基于真实 JD 数据，不靠经验判断。",
      url: `${SITE_URL}/diagnose#submit`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "看 7 节诊断报告",
      text: "报告含：Top 3 角色匹配率 + 4 主线分布 / 期望薪资达成概率（基于行业 AI 增强薪资 P25/P50/P75）/ 城市 tier 对照 / 缺什么技能 / 7-30-90 日补齐路径 / 自学 + 课程 + 1V1 路径对比 / 免费资源清单。URL 可分享，刷新可重现。",
      url: `${SITE_URL}/diagnose#report`,
    },
  ],
};

export const metadata = {
  title: "AI 求职诊断 · 系统推荐 Top 3 角色（路线 A）",
  description:
    "10 分钟出 7 节诊断报告：填技能 + 背景，算法基于 5673 条真实 AI 招聘 JD + 14 角色聚类推荐最适合你的 Top 3 AI 角色 + 主线分布 + Gap + 7/30/90 行动。永久免费。",
  alternates: { canonical: "/diagnose" },
};

export default function DiagnosePage() {
  return (
    <main className="flex-1 px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_LD) }}
      />
      <div className="max-w-2xl mx-auto mb-8">
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          ← 返回首页
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-3 mb-1">
          AI 求职定位诊断
        </h1>
        <p className="text-sm text-slate-500">
          5 个必填 + 5 个推荐字段，约 3 分钟。提交后立即生成报告，URL 可分享。
        </p>
        <p className="mt-3 text-xs text-slate-500">
          已经有明确目标？
          <Link
            href="/diagnose-target"
            className="ml-1 text-blue-600 hover:underline font-medium"
          >
            切到目标 Gap 诊断（B）→
          </Link>
          {" · "}
          不想转行？
          <Link
            href="/diagnose-augment"
            className="ml-1 text-blue-600 hover:underline font-medium"
          >
            留行 + AI 增强（C）→
          </Link>
        </p>
      </div>
      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto text-center text-sm text-slate-500 py-12">
            正在加载表单…
          </div>
        }
      >
        <DiagnosisForm />
      </Suspense>
    </main>
  );
}
