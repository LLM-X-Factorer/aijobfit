// 简历材料体检：纯客户端规则诊断，零 LLM 调用。
// 输入用户的一段实习/项目描述，按句切分后做四项诊断：
//   1. 技能命中：句子里有没有出现目标角色的 keySkills / required_skills
//   2. 量化检测：句子里有没有数字 + 单位（%, ms, s, 分钟, 倍, …）
//   3. 大词检测：黑名单关键词（赋能 / 闭环 / 抓手 / …）触发
//   4. 句长检测：> 60 字的句子简历 bullet 写不下，会被面试官追问
// 算法精神延用 matching.ts/matchTrackKeySkills 的 case-insensitive 子串命中。

import { Role, Skill } from "./fetchAgentHunt";
import { TRACKS } from "@/data/tracks";

export interface SentenceAudit {
  text: string;
  hitSkills: string[];
  needsQuantification: boolean;
  overclaimWords: string[];
  tooLong: boolean;
}

export interface MaterialAuditSummary {
  totalSentences: number;
  uniqueSkillsHit: string[];
  missedKeySkills: string[];
  sentencesNeedingQuant: number;
  sentencesWithOverclaim: number;
  sentencesTooLong: number;
  targetSkillsTotal: number;
}

export interface MaterialAuditResult {
  targetName: string;
  targetSkills: string[];
  sentences: SentenceAudit[];
  summary: MaterialAuditSummary;
}

const OVERCLAIM_WORDS = [
  "赋能",
  "全链路",
  "闭环",
  "降本增效",
  "打通",
  "抓手",
  "深度结合",
  "全方位",
  "一站式",
  "端到端",
];

const QUANT_PATTERN = /\d+(\.\d+)?\s*(%|ms|s|分钟|小时|天|倍|条|人|次)/;

const SENTENCE_SPLITTER = /[。；;.!?！？\n]+/;

const MAX_SENTENCE_LEN = 60;

const ROLE_REQUIRED_TOPN = 10;

function uniqByLower(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const k = s.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

function findHits(sentence: string, keywords: string[]): string[] {
  const lc = sentence.toLowerCase();
  const hits: string[] = [];
  for (const kw of keywords) {
    const k = kw.toLowerCase();
    if (!k) continue;
    if (lc.includes(k)) hits.push(kw);
  }
  return uniqByLower(hits);
}

function findOverclaims(sentence: string): string[] {
  return OVERCLAIM_WORDS.filter((w) => sentence.includes(w));
}

function splitSentences(text: string): string[] {
  return text
    .split(SENTENCE_SPLITTER)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function buildSentenceAudit(sentence: string, keywords: string[]): SentenceAudit {
  return {
    text: sentence,
    hitSkills: findHits(sentence, keywords),
    needsQuantification: !QUANT_PATTERN.test(sentence),
    overclaimWords: findOverclaims(sentence),
    tooLong: sentence.length > MAX_SENTENCE_LEN,
  };
}

function summarize(
  sentences: SentenceAudit[],
  keySkills: string[],
  allKeywords: string[],
): MaterialAuditSummary {
  const allHits = new Set<string>();
  for (const s of sentences) for (const h of s.hitSkills) allHits.add(h.toLowerCase());

  const missedKeySkills = keySkills.filter((k) => !allHits.has(k.toLowerCase()));

  return {
    totalSentences: sentences.length,
    uniqueSkillsHit: Array.from(
      new Set(sentences.flatMap((s) => s.hitSkills)),
    ),
    missedKeySkills,
    sentencesNeedingQuant: sentences.filter((s) => s.needsQuantification).length,
    sentencesWithOverclaim: sentences.filter((s) => s.overclaimWords.length > 0).length,
    sentencesTooLong: sentences.filter((s) => s.tooLong).length,
    targetSkillsTotal: allKeywords.length,
  };
}

// 主入口：基于 targetRoleId 解析出 keySkills（来自 Track）+ required_skills 前 N 项
// 拼成 keywords，再做逐句诊断。
export function auditMaterial(
  text: string,
  targetRoleId: string,
  roles: Role[],
  skills: Skill[],
): MaterialAuditResult {
  const role = roles.find((r) => r.role_id === targetRoleId);
  const track = TRACKS.find((t) => t.roleIds.includes(targetRoleId));
  const trackKeySkills = track ? track.keySkills : [];

  const roleRequiredNames: string[] = [];
  if (role) {
    for (const s of role.required_skills.slice(0, ROLE_REQUIRED_TOPN)) {
      const sk = skills.find((x) => x.id === s.skill_id);
      if (sk) roleRequiredNames.push(sk.canonical_name);
    }
  }

  const keywords = uniqByLower([...trackKeySkills, ...roleRequiredNames]);
  const sentences = splitSentences(text).map((s) => buildSentenceAudit(s, keywords));
  const summary = summarize(sentences, trackKeySkills, keywords);

  return {
    targetName: role?.role_name ?? "目标角色",
    targetSkills: keywords,
    sentences,
    summary,
  };
}

// 辅助入口：直接传一组目标技能名（Route C 用 augmentSkills.skillName 拼）。
export function auditMaterialAgainstSkills(
  text: string,
  targetName: string,
  targetSkills: string[],
): MaterialAuditResult {
  const keywords = uniqByLower(targetSkills);
  const sentences = splitSentences(text).map((s) => buildSentenceAudit(s, keywords));
  const summary = summarize(sentences, keywords, keywords);
  return { targetName, targetSkills: keywords, sentences, summary };
}
