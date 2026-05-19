import Link from "next/link";
import PositionerForm from "@/components/PositionerForm";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

export const metadata = {
  title: "AI 工程师位置诊断 · 4 题看你在 AI 时代的位置",
  description:
    "已经在写代码、想往 AI 工程师方向走？4 道题、凭直觉答，看清你当下在 AI 时代的位置——是方向已对、缺位置、要补认知框架，还是先停下来。",
  alternates: { canonical: "/positioner" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "AI 工程师位置诊断 · 4 题",
    description:
      "4 道题，看清你在 AI 时代的位置（不是再学一门技术，而是看你站在哪里）。",
    url: `${SITE_URL}/positioner`,
    type: "website",
  },
};

export default function PositionerPage() {
  return (
    <main className="flex-1 px-4 py-12 md:py-16">
      <div className="max-w-2xl mx-auto mb-8">
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          ← 返回首页
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-3 mb-2">
          AI 工程师位置诊断
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          已经在写代码、想往 AI 工程师方向走？4 道题、约 1
          分钟，看清你当下在 AI 时代的位置——
          不是「再学一门技术」，而是「你站在哪里」。
        </p>
      </div>

      <PositionerForm />
    </main>
  );
}
