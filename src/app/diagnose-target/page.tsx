import Link from "next/link";
import { Suspense } from "react";
import DiagnosisFormB from "@/components/DiagnosisFormB";

export default function DiagnoseTargetPage() {
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
          目标 Gap 诊断
        </h1>
        <p className="text-sm text-slate-500">
          已经有目标岗位 + 行业？选好后，我们围绕这个目标算匹配率 + 缺什么。
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
