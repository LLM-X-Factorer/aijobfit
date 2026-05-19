"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/track";
import {
  Answer,
  POSITIONER_QUESTIONS,
  PositionerInput,
  classifyQuadrant,
  encodeAnswers,
} from "@/lib/positioner";

type Partial = Record<keyof PositionerInput, Answer | undefined>;

const TOTAL = POSITIONER_QUESTIONS.length;

export default function PositionerForm() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0..3
  const [state, setState] = useState<Partial>({
    q1: undefined,
    q2: undefined,
    q3: undefined,
    q4: undefined,
  });
  const [error, setError] = useState<string | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    startedAtRef.current = Date.now();
    track("positioner_form_view");
  }, []);

  const current = POSITIONER_QUESTIONS[step];
  const value = state[current.id];

  function choose(idx: Answer) {
    setState((s) => ({ ...s, [current.id]: idx }));
    setError(null);
  }

  function next() {
    if (value === undefined) {
      setError("请先选一项（凭直觉答，不确定也是答案）");
      return;
    }
    if (step < TOTAL - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submit();
    }
  }

  function prev() {
    setError(null);
    if (step > 0) setStep(step - 1);
  }

  function submit() {
    const input: PositionerInput = {
      q1: state.q1 as Answer,
      q2: state.q2 as Answer,
      q3: state.q3 as Answer,
      q4: state.q4 as Answer,
    };
    const code = encodeAnswers(input);
    const quadrant = classifyQuadrant(input);
    const duration_ms = Date.now() - startedAtRef.current;
    track("positioner_form_submit", {
      code,
      quadrant,
      duration_ms,
      q1: input.q1,
      q2: input.q2,
      q3: input.q3,
      q4: input.q4,
    });
    router.push(`/positioner/result/${code}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-mono tracking-wide text-blue-700">
            {current.label}
          </p>
          <p className="text-xs text-slate-500">
            {step + 1} / {TOTAL}
          </p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all"
            style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm space-y-6">
        <p className="text-xs text-slate-500">凭直觉答，没有标准答案。</p>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {current.title}
        </h2>

        <div className="space-y-3">
          {current.options.map((opt, idx) => {
            const selected = value === (idx as Answer);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => choose(idx as Answer)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                  selected
                    ? "border-blue-600 bg-blue-50 text-blue-900 font-semibold"
                    : "border-slate-200 bg-white hover:border-blue-300 text-slate-700"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0}
            className="text-sm text-slate-500 hover:text-slate-900 disabled:opacity-30"
          >
            ← 上一题
          </button>
          <button
            type="button"
            onClick={next}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            {step === TOTAL - 1 ? "看我的位置 →" : "下一题 →"}
          </button>
        </div>
      </div>
    </div>
  );
}
