"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FORM_FIELDS, STEP_TITLES, FormField } from "@/data/form-fields";
import { encodeInput, UserInput } from "@/lib/encoding";
import { track } from "@/lib/track";
import TrackOverview from "@/components/TrackOverview";

type FormState = Record<string, string | string[] | number>;

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null || v === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

export default function DiagnosisForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [state, setState] = useState<FormState>({
    skills: [],
    targetTrack: [],
    industry: [],
  });
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
          <FieldRender
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

function FieldRender({
  field,
  value,
  onChange,
  onToggleMulti,
  customSkill,
  setCustomSkill,
  addCustomSkill,
}: {
  field: FormField;
  value: string | string[] | number | undefined;
  onChange: (v: string | string[] | number) => void;
  onToggleMulti: (opt: string) => void;
  customSkill: string;
  setCustomSkill: (s: string) => void;
  addCustomSkill: () => void;
}) {
  const label = (
    <label className="block">
      <span className="text-sm font-bold text-slate-900">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {field.hint && <span className="block text-xs text-slate-500 mt-0.5">{field.hint}</span>}
    </label>
  );

  if (field.type === "text" || field.type === "number-range") {
    return (
      <div>
        {label}
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="mt-2 w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 text-base"
        />
      </div>
    );
  }

  if (field.type === "select" || field.type === "single-select") {
    return (
      <div>
        {label}
        <select
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 bg-white text-base"
        >
          <option value="">请选择</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "multi-select" || field.type === "multi-select-custom") {
    const selected = (value as string[]) || [];
    return (
      <div>
        {label}
        {field.id === "targetTrack" && (
          <details className="mt-2 group">
            <summary className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer select-none py-1 list-none flex items-center gap-1">
              <span className="transition-transform group-open:rotate-90">▸</span>
              <span className="hover:underline">4 条主线分别是什么？点开看关键技能、适合人群、JD 数量</span>
            </summary>
            <div className="mt-3 mb-1">
              <TrackOverview />
            </div>
          </details>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {field.options?.map((opt) => {
            const on = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggleMulti(opt)}
                className={`text-sm px-3.5 py-2 rounded-full border transition-colors ${
                  on
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {field.type === "multi-select-custom" && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              placeholder="自定义技能（如：飞书多维表格）"
              className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomSkill();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomSkill}
              className="text-sm bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-lg shrink-0"
            >
              添加
            </button>
          </div>
        )}

        {field.type === "multi-select-custom" && selected.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">已选 {selected.length} 项</p>
        )}
      </div>
    );
  }

  return null;
}
