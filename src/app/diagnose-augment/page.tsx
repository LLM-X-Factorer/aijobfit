import Link from "next/link";
import { Suspense } from "react";
import DiagnosisFormC from "@/components/DiagnosisFormC";

export default function DiagnoseAugmentPage() {
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
            走目标 Gap 诊断 →
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
