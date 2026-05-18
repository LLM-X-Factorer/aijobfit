"use client";

import { useMemo, useState } from "react";
import {
  auditMaterial,
  auditMaterialAgainstSkills,
  MaterialAuditResult,
  SentenceAudit,
} from "@/lib/materialAudit";
import type { Role, Skill } from "@/lib/fetchAgentHunt";
import type { AudienceType } from "@/lib/audience";
import { track } from "@/lib/track";

interface Props {
  targetRoleId?: string;
  targetRoleName?: string;
  augmentSkills?: string[];
  roles: Role[];
  skills: Skill[];
  audience: AudienceType;
  route: "A" | "B" | "C";
  reportId: string;
}

const PLACEHOLDER = `示例：
负责某教育产品的用户增长项目，3 个月内将活跃用户从 5000 提升到 12000，提升 140%。
搭建 RAG 知识库，平均响应时间从 1200ms 降到 400ms，准确率 85%。
赋能业务全链路，打通端到端闭环。`;

function HitChip({ text, tone }: { text: string; tone: "emerald" | "amber" | "rose" | "slate" }) {
  const toneStyle: Record<typeof tone, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span
      className={`inline-block text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-full border ${toneStyle[tone]}`}
    >
      {text}
    </span>
  );
}

function SentenceRow({ idx, audit }: { idx: number; audit: SentenceAudit }) {
  const chips: { tone: "emerald" | "amber" | "rose" | "slate"; text: string }[] = [];
  for (const s of audit.hitSkills) chips.push({ tone: "emerald", text: `命中 · ${s}` });
  if (audit.overclaimWords.length > 0)
    chips.push({ tone: "rose", text: `大词 · ${audit.overclaimWords.join("、")}` });
  if (audit.needsQuantification) chips.push({ tone: "amber", text: "缺数字 / 量化" });
  if (audit.tooLong) chips.push({ tone: "slate", text: `${audit.text.length} 字 · 过长` });

  return (
    <li className="border border-slate-200 rounded-lg p-3 bg-white">
      <div className="flex gap-2 items-start">
        <span className="font-mono text-xs text-slate-400 shrink-0 mt-0.5">#{idx + 1}</span>
        <p className="text-sm text-slate-800 leading-relaxed break-words flex-1">{audit.text}</p>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2 pl-7">
          {chips.map((c, i) => (
            <HitChip key={i} text={c.text} tone={c.tone} />
          ))}
        </div>
      )}
    </li>
  );
}

export default function ReportMaterialAudit(props: Props) {
  const { targetRoleId, targetRoleName, augmentSkills, roles, skills, audience, route, reportId } =
    props;
  const [text, setText] = useState("");
  const [result, setResult] = useState<MaterialAuditResult | null>(null);

  const sectionLabel = audience === "fresh-grad" ? "实习经历体检" : "项目经历体检";

  const canRun = useMemo(() => text.trim().length > 0, [text]);

  function runAudit() {
    if (!canRun) return;
    let r: MaterialAuditResult;
    if (targetRoleId) {
      r = auditMaterial(text, targetRoleId, roles, skills);
    } else if (augmentSkills && augmentSkills.length > 0) {
      r = auditMaterialAgainstSkills(text, targetRoleName ?? "目标方向", augmentSkills);
    } else {
      r = auditMaterialAgainstSkills(text, targetRoleName ?? "目标方向", []);
    }
    setResult(r);
    track("material_audit_run", {
      route,
      report_id: reportId,
      sentences: r.summary.totalSentences,
      hit_skills: r.summary.uniqueSkillsHit.length,
      need_quant: r.summary.sentencesNeedingQuant,
      overclaim: r.summary.sentencesWithOverclaim,
      too_long: r.summary.sentencesTooLong,
    });
  }

  function resetAudit() {
    setText("");
    setResult(null);
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-8">
      <h2 className="text-2xl font-black text-slate-900 mb-2">
        附加 · {sectionLabel}
      </h2>
      <p className="text-sm text-slate-500 mb-4 leading-relaxed">
        把你已有的一段{audience === "fresh-grad" ? "实习" : "项目"}描述贴进来，
        系统按句逐条标出问题：哪句命中了「{result?.targetName ?? targetRoleName ?? "目标角色"}」的关键技能、哪句缺数字、哪句堆了大词。
        <span className="text-slate-400">不替你改写、不存服务端，只做诊断。</span>
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={PLACEHOLDER}
        className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 resize-y font-mono"
      />

      <div className="flex flex-wrap items-center gap-3 mt-3">
        <button
          type="button"
          onClick={runAudit}
          disabled={!canRun}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm px-5 py-2 rounded-full transition-all"
        >
          体检
        </button>
        {result && (
          <button
            type="button"
            onClick={resetAudit}
            className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2"
          >
            清空重填
          </button>
        )}
        <span className="text-xs text-slate-400">
          {text.length} 字 · {text.trim() ? text.split(/[。；;.!?！？\n]+/).filter((s) => s.trim()).length : 0} 句
        </span>
      </div>

      {result && result.sentences.length > 0 && (
        <>
          <div className="mt-5 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-blue-900">汇总：</span>
            命中目标技能{" "}
            <span className="font-mono font-bold text-emerald-700">
              {result.summary.uniqueSkillsHit.length}
            </span>
            {" / "}
            <span className="font-mono text-slate-500">{result.summary.targetSkillsTotal}</span>
            <span className="text-slate-400 mx-1.5">·</span>
            待补量化{" "}
            <span className="font-mono font-bold text-amber-700">
              {result.summary.sentencesNeedingQuant}
            </span>{" "}
            句
            <span className="text-slate-400 mx-1.5">·</span>
            大词风险{" "}
            <span className="font-mono font-bold text-rose-700">
              {result.summary.sentencesWithOverclaim}
            </span>{" "}
            句
            <span className="text-slate-400 mx-1.5">·</span>
            过长{" "}
            <span className="font-mono font-bold text-slate-600">
              {result.summary.sentencesTooLong}
            </span>{" "}
            句
            {result.summary.missedKeySkills.length > 0 && (
              <div className="mt-2 text-slate-700">
                <span className="font-bold">未提到的目标 keySkills：</span>
                <span className="ml-1">
                  {result.summary.missedKeySkills.map((s) => (
                    <span
                      key={s}
                      className="inline-block text-[11px] bg-white border border-slate-300 text-slate-600 px-1.5 py-0.5 rounded mx-0.5"
                    >
                      {s}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>

          <ul className="mt-4 space-y-2">
            {result.sentences.map((s, i) => (
              <SentenceRow key={i} idx={i} audit={s} />
            ))}
          </ul>

          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            诊断口径：绿 = 命中目标技能 · 黄 = 句中缺数字/单位（建议加 % / 倍 / 分钟 / 人 / 次 等量化）
            · 红 = 命中大词黑名单（赋能 / 闭环 / 抓手 / …，HR 会追问具体做了什么）·
            灰 = 单句超过 60 字（简历 bullet 写不下，建议拆短）。零 LLM 调用，全部本地规则。
          </p>
        </>
      )}

      {result && result.sentences.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">没有解析到句子，请检查输入是否为空或缺少句号 / 换行。</p>
      )}
    </section>
  );
}
