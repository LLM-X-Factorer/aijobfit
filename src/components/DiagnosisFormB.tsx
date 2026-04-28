"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FORM_FIELDS } from "@/data/form-fields";
import { decodeInput, encodeInput, UserInput } from "@/lib/encoding";
import { track } from "@/lib/track";
import { fetchRoles, Role } from "@/lib/fetchAgentHunt";
import { FormFieldRender } from "@/components/FormFieldRender";

type FormState = Record<string, string | string[] | number>;

const INDUSTRY_OPTIONS = ["互联网", "金融", "医疗", "制造", "零售", "教育", "其他"];

// 路线 B 三步：锁定目标 / 背景 + 技能 / 偏好
const STEP_TITLES_B: Record<1 | 2 | 3, string> = {
  1: "1 / 3 · 锁定你的目标",
  2: "2 / 3 · 你的背景与技能",
  3: "3 / 3 · 偏好（全部可选，可跳过）",
};

const STEP_2_FIELD_IDS = ["yearsExp", "education", "currentJob", "city", "skills"];
const STEP_3_FIELD_IDS = ["motivation", "expectedSalary", "timeBudget"];

function buildInitialState(fromHash: string | null): FormState {
  const base: FormState = { skills: [], targetIndustry: "", targetRoleId: "" };
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
      motivation: prev.motivation || "",
      timeBudget: prev.timeBudget || "",
      targetIndustry: (prev.industry && prev.industry[0]) || "",
      targetRoleId: prev.targetRoleId || "",
      expectedSalary:
        prev.expectedSalaryMin && prev.expectedSalaryMax
          ? `${prev.expectedSalaryMin}-${prev.expectedSalaryMax}`
          : "",
    };
  } catch {
    return base;
  }
}

export default function DiagnosisFormB() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromHash = searchParams.get("from");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [state, setState] = useState<FormState>(() => buildInitialState(fromHash));
  const [customSkill, setCustomSkill] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    startedAtRef.current = Date.now();
    fetchRoles()
      .then((rs) => setRoles(rs.filter((r) => r.role_id !== "other")))
      .catch((e) => setError(`角色列表加载失败：${e instanceof Error ? e.message : String(e)}`))
      .finally(() => setRolesLoading(false));
  }, []);

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
      if (!state.targetIndustry) {
        setError("请选择目标行业");
        return;
      }
      if (!state.targetRoleId) {
        setError("请选择目标岗位");
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
    const targetIndustry = state.targetIndustry as string;
    const input: UserInput = {
      currentJob: (state.currentJob as string) || "",
      yearsExp: (state.yearsExp as string) || "",
      education: (state.education as string) || "",
      city: (state.city as string) || undefined,
      skills: (state.skills as string[]) || [],
      targetTrack: [],
      motivation: (state.motivation as string) || undefined,
      industry: targetIndustry ? [targetIndustry] : undefined,
      timeBudget: (state.timeBudget as string) || undefined,
      route: "B",
      targetRoleId: (state.targetRoleId as string) || undefined,
    };
    const sal = state.expectedSalary as string;
    if (sal && typeof sal === "string") {
      const m = sal.match(/(\d+)\s*[-到~]\s*(\d+)/);
      if (m) {
        input.expectedSalaryMin = parseInt(m[1], 10);
        input.expectedSalaryMax = parseInt(m[2], 10);
      }
    }
    const hash = encodeInput(input);
    track("route_b_submit", {
      duration_ms: Date.now() - startedAtRef.current,
      target_industry: targetIndustry,
      target_role_id: input.targetRoleId,
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
          <p className="text-sm font-mono tracking-wide text-blue-700">{STEP_TITLES_B[step]}</p>
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
            <div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                你已经有明确的求职目标 → 我们围绕这个目标算匹配率 + Gap，不再给你推 Top 3。
              </p>
            </div>

            <div>
              <label className="block">
                <span className="text-sm font-bold text-slate-900">
                  目标行业<span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {INDUSTRY_OPTIONS.map((opt) => {
                  const on = state.targetIndustry === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set("targetIndustry", opt)}
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

            <div>
              <label className="block">
                <span className="text-sm font-bold text-slate-900">
                  目标岗位<span className="text-red-500 ml-1">*</span>
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  从 14 个真实 JD 聚类的角色中选 1 个
                </span>
              </label>
              {rolesLoading ? (
                <p className="mt-2 text-sm text-slate-500">加载岗位列表中…</p>
              ) : (
                <select
                  value={(state.targetRoleId as string) || ""}
                  onChange={(e) => set("targetRoleId", e.target.value)}
                  className="mt-2 w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 bg-white text-base"
                >
                  <option value="">请选择</option>
                  {roles
                    .slice()
                    .sort((a, b) => b.job_count - a.job_count)
                    .map((r) => (
                      <option key={r.role_id} value={r.role_id}>
                        {r.role_name}（{r.job_count} JD · 中位{" "}
                        {(r.salary.median / 1000).toFixed(1)}K）
                      </option>
                    ))}
                </select>
              )}
            </div>
          </>
        )}

        {step !== 1 && (() => {
          const lockedRole = roles.find((r) => r.role_id === state.targetRoleId);
          const industry = state.targetIndustry as string;
          if (!lockedRole && !industry) return null;
          return (
            <div className="-mt-2 -mb-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm">
              <span className="text-slate-500 mr-1.5">已锁目标：</span>
              <span className="font-bold text-slate-900">
                {industry && <>{industry} · </>}
                {lockedRole?.role_name || "—"}
              </span>
            </div>
          );
        })()}

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
            {step === 3 ? "生成 Gap 报告 →" : "下一步 →"}
          </button>
        </div>
      </div>
    </div>
  );
}
