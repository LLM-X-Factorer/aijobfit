import Link from "next/link";
import { Suspense } from "react";
import DiagnosisFormB from "@/components/DiagnosisFormB";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

const HOWTO_LD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "如何评估转 AI 角色的差距和补齐路径（转行 Gap 诊断）",
  description:
    "用 AIJobFit 三路线诊断的 B 路线（转行 Gap）：先锁定目标行业 + 14 个 AI 角色之一，再填技能 + 背景，系统仅算锁定角色的匹配率 + 缺什么技能 + 怎么补，不展示 Top 3。适合已经有明确转行目标的用户。永久免费。",
  totalTime: "PT8M",
  inLanguage: "zh-CN",
  image: `${SITE_URL}/api/og`,
  url: `${SITE_URL}/diagnose-target`,
  supply: [
    { "@type": "HowToSupply", name: "明确的目标行业（12 个一级行业可选）" },
    { "@type": "HowToSupply", name: "明确的目标 AI 角色（14 个聚类角色之一）" },
    { "@type": "HowToSupply", name: "你已掌握的技能清单 + 背景信息" },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "锁定目标行业 + 目标 AI 角色",
      text: "在表单第一步选你想转去的行业（互联网 / 教育 / 医疗 / 制造 / 金融等 12 选 1）和目标 AI 角色（AI 产品经理 / AI 销售 / 提示词工程师 / AIGC 设计 等 14 选 1）。",
      url: `${SITE_URL}/diagnose-target#target`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "填技能 + 背景",
      text: "勾选已掌握的 AI 通用技能 + 填当前职业、年限、学历、期望薪资、城市。约 3 分钟。",
      url: `${SITE_URL}/diagnose-target#form`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "看锁定角色的匹配率 + Gap",
      text: "提交后，系统仅算你对锁定角色的匹配率（不展示 Top 3，避免噪音），并展示：缺哪些 required / preferred 技能、行业是否匹配、应届/社招对照、行业 AI 增强薪资分布、7/30/90 日补齐路径。",
      url: `${SITE_URL}/diagnose-target#report`,
    },
  ],
};

export const metadata = {
  title: "转行 AI Gap 诊断 · 锁定行业 + 角色看匹配率（路线 B）",
  description:
    "已经有转行目标？锁定目标行业（12 选 1）+ 14 个 AI 角色之一，10 分钟看「我离这个目标差什么」：技能匹配率 + Gap + 7/30/90 补齐路径。基于 5673 条真实 AI 招聘 JD。永久免费。",
  alternates: { canonical: "/diagnose-target" },
};

export default function DiagnoseTargetPage() {
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
          目标 Gap 诊断
        </h1>
        <p className="text-sm text-slate-500">
          已经有目标岗位 + 行业？选好后，我们围绕这个目标算匹配率 + 缺什么。
        </p>
        <p className="mt-3 text-xs text-slate-500">
          还不确定目标？
          <Link
            href="/diagnose"
            className="ml-1 text-blue-600 hover:underline font-medium"
          >
            让系统推荐 Top 3（A）→
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
        <DiagnosisFormB />
      </Suspense>
    </main>
  );
}
