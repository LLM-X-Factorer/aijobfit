"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FORM_FIELDS, STEP_TITLES } from "@/data/form-fields";
import { decodeInput, encodeInput, UserInput } from "@/lib/encoding";
import { track } from "@/lib/track";
import { FormFieldRender } from "@/components/FormFieldRender";

type FormState = Record<string, string | string[] | number>;

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null || v === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

function buildInitialState(fromHash: string | null): FormState {
  const base: FormState = { skills: [], targetTrack: [], industry: [] };
  if (!fromHash) return base;
  try {
    const prev = decodeInput(fromHash);
    return {
      ...base,
      currentJob: prev.currentJob || "",
      yearsExp: prev.yearsExp || "",
      education: prev.education || "",
      city: prev.city || "",
      skills: prev.skills || [],
      targetTrack: prev.targetTrack || [],
      industry: prev.industry || [],
      motivation: prev.motivation || "",
      timeBudget: prev.timeBudget || "",
      expectedSalary:
        prev.expectedSalaryMin && prev.expectedSalaryMax
          ? `${prev.expectedSalaryMin}-${prev.expectedSalaryMax}`
          : "",
    };
  } catch {
    return base;
  }
}

export default function DiagnosisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromHash = searchParams.get("from");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [state, setState] = useState<FormState>(() => buildInitialState(fromHash));
  const [customSkill, setCustomSkill] = useState("");
  const [error, setError] = useState<string | null>(null);
  const startedAtRef = useRef<number>(0);
  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const fieldsForStep = FORM_FIELDS.filter((f) => f.step === step);

  function set(id: string, value: string | string[] | number) {
    setState((s) => ({ ...s, [id]: value }));
  }

  function toggleMulti(id: string, opt: string) {
    const cur = (state[id] as string[]) || [];
    set(id, cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]);
  }

  function addCustomSkill() {
    const t = customSkill.trim();
    if (!t) return;
    const cur = (state.skills as string[]) || [];
    if (!cur.includes(t)) set("skills", [...cur, t]);
    setCustomSkill("");
  }

  function next() {
    setError(null);
    // 验证当前 step 的必填
    for (const f of fieldsForStep) {
      if (f.required && isEmpty(state[f.id])) {
        setError(`请填写：${f.label}`);
        return;
      }
      if (f.id === "skills" && ((state.skills as string[]) || []).length < 3) {
        setError("请至少选择 3 项已掌握的技能（可使用自定义补充）");
        return;
      }
    }
    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submit();
    }
  }

  function prev() {
    setError(null);
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
  }

  function submit() {
    const input: UserInput = {
      currentJob: (state.currentJob as string) || "",
      yearsExp: (state.yearsExp as string) || "",
      education: (state.education as string) || "",
      city: (state.city as string) || undefined,
      skills: (state.skills as string[]) || [],
      targetTrack: (state.targetTrack as string[]) || [],
      motivation: (state.motivation as string) || undefined,
      industry: (state.industry as string[]) || undefined,
      timeBudget: (state.timeBudget as string) || undefined,
    };
    // 期望薪资：用户在 number-range 输入 "min-max"
    const sal = state.expectedSalary as string;
    if (sal && typeof sal === "string") {
      const m = sal.match(/(\d+)\s*[-到~]\s*(\d+)/);
      if (m) {
        input.expectedSalaryMin = parseInt(m[1], 10);
        input.expectedSalaryMax = parseInt(m[2], 10);
      }
    }
    const hash = encodeInput(input);
    const filledCount = Object.values(state).filter((v) =>
      Array.isArray(v) ? v.length > 0 : v !== "" && v != null,
    ).length;
    track("form_submit", {
      // Event handler scope; React 19 rule false-positive on impure calls here
      // eslint-disable-next-line react-hooks/purity
      duration_ms: Date.now() - startedAtRef.current,
      filled_fields: filledCount,
      skills_count: (input.skills || []).length,
      target_tracks: (input.targetTrack || []).join(","),
    });
    router.push(`/result/${hash}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 进度条 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-mono tracking-wide text-blue-700">{STEP_TITLES[step]}</p>
          <p className="text-xs text-slate-500">{step} / 3</p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm space-y-6">
        {fieldsForStep.map((f) => (
          <FormFieldRender
            key={f.id}
            field={f}
            value={state[f.id]}
            onChange={(v) => set(f.id, v)}
            onToggleMulti={(opt) => toggleMulti(f.id, opt)}
            customSkill={customSkill}
            setCustomSkill={setCustomSkill}
            addCustomSkill={addCustomSkill}
          />
        ))}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={prev}
            disabled={step === 1}
            className="text-sm text-slate-500 hover:text-slate-900 disabled:opacity-30"
          >
            ← 上一步
          </button>
          <button
            type="button"
            onClick={next}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            {step === 3 ? "生成诊断报告 →" : "下一步 →"}
          </button>
        </div>
      </div>
    </div>
  );
}

