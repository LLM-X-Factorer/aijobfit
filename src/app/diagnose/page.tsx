import Link from "next/link";
import { Suspense } from "react";
import DiagnosisForm from "@/components/DiagnosisForm";

export default function DiagnosePage() {
  return (
    <main className="flex-1 px-4 py-12 md:py-16">
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
