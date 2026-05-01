import Link from "next/link";
import { Suspense } from "react";
import DiagnosisFormC from "@/components/DiagnosisFormC";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

const HOWTO_LD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "如何不离开原行业用 AI 增强职业竞争力（留行 + AI 增强诊断）",
  description:
    "用 AIJobFit 三路线诊断的 C 路线（留行 + AI 增强）：保留原职业（产品经理 / 教师 / 电气工程师 / 财务等 420 长尾原职业），系统从国内真实 JD 里告诉你这个职业里哪些 AI 技能正在涨薪、你已掌握多少、还缺什么、薪资中位多少。永久免费。",
  totalTime: "PT8M",
  inLanguage: "zh-CN",
  image: `${SITE_URL}/api/og`,
  url: `${SITE_URL}/diagnose-augment`,
  supply: [
    { "@type": "HowToSupply", name: "你的原职业（自由文本，模糊匹配 420 长尾原职业字典）" },
    { "@type": "HowToSupply", name: "（可选）行业 + 已掌握 AI 技能" },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "输入原职业",
      text: "填写你目前的职业（如「电气工程师」「初中数学教师」「内科医生」「门店销售」），系统会模糊匹配 420 个长尾原职业字典，命中后实时显示这个职业的 AI 增强 JD 数据预览（augmentSkills + sampleTitles + topIndustries），未命中会给出近邻 chip 提示。",
      url: `${SITE_URL}/diagnose-augment#profession`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "（可选）填行业 + 技能补充",
      text: "如果想精确算 readiness，可以补充所在行业 + 已掌握的 AI 通用技能。不填也能出报告，只是 readiness 档位会更保守。",
      url: `${SITE_URL}/diagnose-augment#optional`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "看留行版报告",
      text: "提交后看：原职业 + AI 增强 JD readiness 4 档（first-class / mid / starter / no-data）+ augmentSkills ✓/✗ tag cloud + 原职业薪资中位 + 7/30/90 日留行补齐 action。不强行推转行，留行也能加 AI。",
      url: `${SITE_URL}/diagnose-augment#report`,
    },
  ],
};

export const metadata = {
  title: "留行 + AI 增强诊断 · 不转行也能加 AI（路线 C）",
  description:
    "保留原职业（产品经理 / 教师 / 电气工程师 / 财务 / 销售等 420 长尾原职业），系统告诉你这个职业里哪些 AI 技能正在涨薪、你已掌握多少、还缺什么。基于真实 AI 增强 JD 数据。永久免费，不卖课。",
  alternates: { canonical: "/diagnose-augment" },
};

export default function DiagnoseAugmentPage() {
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
          留行 + AI 增强诊断
        </h1>
        <p className="text-sm text-slate-500">
          你保留原职业（产品经理 / 教师 / 电气工程师 / ...），我们告诉你这个职业里哪些 AI 技能正在涨薪、你已经掌握了多少、还缺什么。
        </p>
        <p className="mt-3 text-xs text-slate-500">
          想转行做纯 AI 角色？
          <Link
            href="/diagnose-target"
            className="ml-1 text-blue-600 hover:underline font-medium"
          >
            走目标 Gap 诊断（B）→
          </Link>
          {" · "}
          还不确定？
          <Link
            href="/diagnose"
            className="ml-1 text-blue-600 hover:underline font-medium"
          >
            让系统推荐 Top 3（A）→
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
        <DiagnosisFormC />
      </Suspense>
    </main>
  );
}
