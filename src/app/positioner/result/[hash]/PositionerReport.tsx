"use client";

import { useEffect } from "react";
import Link from "next/link";
import { track } from "@/lib/track";
import {
  POSITIONER_QUESTIONS,
  PositionerInput,
  QUADRANTS,
  QuadrantId,
  scoreAnswers,
} from "@/lib/positioner";
import PositionerQuadrantChart from "@/components/PositionerQuadrantChart";
import PositionerCtaCard from "@/components/PositionerCtaCard";

export default function PositionerReport({
  code,
  input,
  quadrantId,
}: {
  code: string;
  input: PositionerInput;
  quadrantId: QuadrantId;
}) {
  const q = QUADRANTS[quadrantId];
  const { positive, uncertain } = scoreAnswers(input);

  useEffect(() => {
    track("positioner_report_view", {
      code,
      quadrant: quadrantId,
      positive,
      uncertain,
    });
  }, [code, quadrantId, positive, uncertain]);

  return (
    <main className="flex-1 bg-grid">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-500 hover:text-blue-600">
            ← AIJobFit
          </Link>
          <Link
            href="/positioner"
            className="text-xs text-slate-500 hover:text-blue-600"
          >
            重新测一次
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 fade-up">
        {/* Section 1 · 你的位置 */}
        <section className="bg-white border border-blue-100 rounded-2xl p-5 sm:p-8 shadow-sm">
          <p className="text-xs font-mono text-blue-700 tracking-wide mb-2">
            01 · 你的位置
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-snug mb-4">
            {q.name}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            正向回答 {positive} / 4 · 不确定 {uncertain} / 4
          </p>
          <PositionerQuadrantChart active={q} />
        </section>

        {/* Section 2 · 这意味着什么 */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-sm">
          <p className="text-xs font-mono text-blue-700 tracking-wide mb-2">
            02 · 这意味着什么
          </p>
          <p className="text-base text-slate-800 leading-relaxed whitespace-pre-line">
            {q.meaning}
          </p>
        </section>

        {/* Section 3 · 接下来你需要的是 */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-sm">
          <p className="text-xs font-mono text-blue-700 tracking-wide mb-2">
            03 · 接下来你需要的是
          </p>
          <ol className="space-y-3 list-decimal list-outside ml-5">
            {q.advice.map((a) => (
              <li key={a} className="text-base text-slate-800 leading-relaxed">
                {a}
              </li>
            ))}
          </ol>
        </section>

        {/* Section 4 · CTA */}
        <section
          className={`rounded-2xl p-5 sm:p-8 ${
            quadrantId === "Q4"
              ? "bg-amber-50 border-2 border-amber-300"
              : "bg-blue-50 border-2 border-blue-200"
          }`}
        >
          <p className="text-xs font-mono text-blue-700 tracking-wide mb-2">
            04 · 接下来怎么走
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-5">
            {quadrantId === "Q4"
              ? "唯一推荐：先做一次 1v1 诊断对话"
              : "下一步推荐"}
          </h2>
          <PositionerCtaCard q={q} />
        </section>

        {/* 你的 4 题答复（机制透明） */}
        <details className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-sm text-slate-600">
          <summary className="cursor-pointer font-medium text-slate-700">
            你的 4 题答复（点击展开）
          </summary>
          <ul className="mt-4 space-y-3">
            {POSITIONER_QUESTIONS.map((qi, i) => {
              const ans = input[qi.id];
              const isPositive = ans === 0;
              const isUncertain = ans === 2;
              return (
                <li key={qi.id} className="leading-relaxed">
                  <span className="text-xs font-mono text-slate-400">
                    Q{i + 1} · {qi.label}
                  </span>
                  <div className="text-slate-800">{qi.title}</div>
                  <div
                    className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${
                      isPositive
                        ? "bg-emerald-100 text-emerald-700"
                        : isUncertain
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    你选：{qi.options[ans]}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            判定规则：「不确定 ≥ 3」直接归第四象限；否则按正向分数推（≥3 = Q1，
            =2 = Q2，≤1 = Q3）。
          </p>
        </details>

        <p className="text-center text-xs text-slate-500">
          AIJobFit · AI 工程师位置诊断 · 报告代码 #{code}
        </p>
      </div>
    </main>
  );
}
