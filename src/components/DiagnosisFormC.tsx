"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FORM_FIELDS } from "@/data/form-fields";
import { decodeInput, encodeInput, UserInput } from "@/lib/encoding";
import { track } from "@/lib/track";
import { fetchRolesAugmentedByProfession, RolesAugmentedByProfession } from "@/lib/fetchAgentHunt";
import { matchProfession } from "@/lib/professionMatch";
import { FormFieldRender } from "@/components/FormFieldRender";

type FormState = Record<string, string | string[] | number>;

const INDUSTRY_OPTIONS = ["互联网", "金融", "医疗", "制造", "零售", "教育", "其他"];

const STEP_TITLES_C: Record<1 | 2 | 3, string> = {
  1: "1 / 3 · 锁定原职业",
  2: "2 / 3 · 你的背景与技能",
  3: "3 / 3 · 偏好（全部可选，可跳过）",
};

const STEP_2_FIELD_IDS = ["yearsExp", "education", "city", "skills"];
const STEP_3_FIELD_IDS = ["motivation", "expectedSalary", "timeBudget"];

function buildInitialState(fromHash: string | null): FormState {
  const base: FormState = { skills: [], originProfession: "", industry: "" };
  if (!fromHash) return base;
  try {
    const prev = decodeInput(fromHash);
    return {
      ...base,
      // 留行版默认把 currentJob 作为 originProfession 起点
      originProfession: prev.originProfession || prev.currentJob || "",
      yearsExp: prev.yearsExp || "",
      education: prev.education || "",
      city: prev.city || "",
      skills: prev.skills || [],
      motivation: prev.motivation || "",
      timeBudget: prev.timeBudget || "",
      industry: (prev.industry && prev.industry[0]) || "",
      expectedSalary:
        prev.expectedSalaryMin && prev.expectedSalaryMax
          ? `${prev.expectedSalaryMin}-${prev.expectedSalaryMax}`
          : "",
    };
  } catch {
    return base;
  }
}

export default function DiagnosisFormC() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromHash = searchParams.get("from");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [state, setState] = useState<FormState>(() => buildInitialState(fromHash));
  const [customSkill, setCustomSkill] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [augData, setAugData] = useState<RolesAugmentedByProfession | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    startedAtRef.current = Date.now();
    fetchRolesAugmentedByProfession()
      .then(setAugData)
      .catch(() => setAugData(null));
  }, []);

  // 实时模糊匹配预览：用户在 step 1 输入原职业时即时看到数据集里命中的 key
  const matchPreview = useMemo(() => {
    const q = (state.originProfession as string) || "";
    if (!augData || !q.trim()) return null;
    return matchProfession(q, augData);
  }, [augData, state.originProfession]);

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
    if (step === 1) {
      if (!((state.originProfession as string) || "").trim()) {
        setError("请填写你的原职业");
        return;
      }
    }
    if (step === 2) {
      if (!state.yearsExp) {
        setError("请填写工作年限");
        return;
      }
      if (!state.education) {
        setError("请填写学历");
        return;
      }
      if (((state.skills as string[]) || []).length < 3) {
        setError("请至少选择 3 项已掌握的技能");
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
    const origProf = ((state.originProfession as string) || "").trim();
    const industry = (state.industry as string) || "";
    const input: UserInput = {
      // currentJob 用 origProf 兜底，让封面 metadata 仍能显示
      currentJob: origProf,
      yearsExp: (state.yearsExp as string) || "",
      education: (state.education as string) || "",
      city: (state.city as string) || undefined,
      skills: (state.skills as string[]) || [],
      targetTrack: [],
      motivation: (state.motivation as string) || undefined,
      industry: industry ? [industry] : undefined,
      timeBudget: (state.timeBudget as string) || undefined,
      route: "C",
      originProfession: origProf,
    };
    const sal = state.expectedSalary as string;
    if (sal) {
      const m = sal.match(/(\d+)\s*[-到~]\s*(\d+)/);
      if (m) {
        input.expectedSalaryMin = parseInt(m[1], 10);
        input.expectedSalaryMax = parseInt(m[2], 10);
      }
    }
    const hash = encodeInput(input);
    track("route_c_submit", {
      duration_ms: Date.now() - startedAtRef.current,
      origin_profession: origProf,
      matched_key: matchPreview?.best?.matchedKey ?? undefined,
      match_type: matchPreview?.best?.matchType ?? "no-match",
      industry,
      skills_count: input.skills.length,
    });
    router.push(`/result/${hash}`);
  }

  const fieldIdsForStep = step === 2 ? STEP_2_FIELD_IDS : step === 3 ? STEP_3_FIELD_IDS : [];
  const fieldsForStep = fieldIdsForStep
    .map((id) => FORM_FIELDS.find((f) => f.id === id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-mono tracking-wide text-blue-700">{STEP_TITLES_C[step]}</p>
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
        {step === 1 && (
          <>
            <p className="text-xs text-slate-500 leading-relaxed">
              你保留原职业，不转行。我们会拿你填的原职业去 agent-hunt 数据集里找「{"<原职业>"} +
              AI 增强」的真实在招 JD，告诉你哪些 AI 技能在涨薪、你掌握了多少。
            </p>

            <div>
              <label className="block">
                <span className="text-sm font-bold text-slate-900">
                  你的原职业<span className="text-red-500 ml-1">*</span>
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  例：电气工程师 / 产品经理 / 教师 / 销售经理 / 设计师 / 视频剪辑师 ...
                </span>
              </label>
              <input
                type="text"
                value={(state.originProfession as string) || ""}
                onChange={(e) => set("originProfession", e.target.value)}
                placeholder="如：电气工程师"
                className="mt-2 w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 bg-white text-base"
              />
              {/* 实时数据集预览 */}
              {matchPreview && matchPreview.best && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="text-xs text-slate-500 mb-1.5">
                    数据集匹配（{matchPreview.best.matchType === "exact" ? "精确" : "模糊"}）：
                  </p>
                  <p className="font-bold text-slate-900 mb-1">
                    {matchPreview.best.matchedKey} · {matchPreview.best.entry.vacancyCount} 条 AI 增强 JD · 中位 ¥
                    {Math.round(matchPreview.best.entry.salaryMedian / 1000)}k
                  </p>
                  {matchPreview.alternatives.length > 1 && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 mb-1">同义近邻：</p>
                      <div className="flex flex-wrap gap-1.5">
                        {matchPreview.alternatives
                          .filter((a) => a.matchedKey !== matchPreview.best?.matchedKey)
                          .slice(0, 4)
                          .map((a) => (
                            <button
                              key={a.matchedKey}
                              type="button"
                              onClick={() => set("originProfession", a.matchedKey)}
                              className="text-xs bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full hover:border-blue-400"
                            >
                              {a.matchedKey} · {a.entry.vacancyCount} JD
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {matchPreview && !matchPreview.best && (state.originProfession as string).trim() && (
                <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  数据集里没找到「{state.originProfession as string}
                  」精确或模糊命中。你可以继续提交，报告会用诚实兜底口径；或换个写法（如
                  「电气」/「产品」/「教师」）再试。
                </p>
              )}
            </div>

            <div>
              <label className="block">
                <span className="text-sm font-bold text-slate-900">行业偏好（可选）</span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  锁一个行业能让薪资 P25/P75 更准（金融 30k vs 媒体 12.5k 中位差很多）
                </span>
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {INDUSTRY_OPTIONS.map((opt) => {
                  const on = state.industry === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set("industry", on ? "" : opt)}
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
            </div>
          </>
        )}

        {step !== 1 && (
          <div className="-mt-2 -mb-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm">
            <span className="text-slate-500 mr-1.5">已锁原职业：</span>
            <span className="font-bold text-slate-900">
              {(state.originProfession as string) || "—"}
              {state.industry && <> · {state.industry as string}</>}
            </span>
          </div>
        )}

        {step !== 1 &&
          fieldsForStep.map((f) => (
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
            {step === 3 ? "生成留行报告 →" : "下一步 →"}
          </button>
        </div>
      </div>
    </div>
  );
}
