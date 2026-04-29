// 用户的 free-text 原职业 → roles-augmented-by-profession.json 数据集里的具体 entry。
//
// 上游数据有 ~420 个长尾原职业 key（"电气工程师" / "电气设计师" / "电气机械/器材" 等都各自存
// 在），exact 匹配命中率会很低。所以分两层：
//   1. exact key match（用户填的字符串与某个 key 完全一致）
//   2. fuzzy contains（双向 substring：userInput.includes(key) 或 key.includes(userInput)），
//      按 vacancyCount 降序取 top N — 越大的样本越稳定。
//
// 质量门槛 vacancyCount >= MIN_VACANCY 才放进 fuzzy 结果，避免推 1-2 条 JD 的极小职业。

import type { ProfessionEntry, RolesAugmentedByProfession } from "./fetchAgentHunt";

const MIN_VACANCY = 5;

export interface ProfessionMatch {
  matchedKey: string;
  entry: ProfessionEntry;
  matchType: "exact" | "fuzzy";
}

export interface ProfessionMatchResult {
  best: ProfessionMatch | null;
  // 候选列表（含 best），按 vacancyCount 降序，至多 5 条 — UI 可展示「你是不是想说…」
  alternatives: ProfessionMatch[];
  totalCandidates: number;
}

export function matchProfession(
  userInput: string | undefined,
  data: RolesAugmentedByProfession | null,
  market: "domestic" | "international" = "domestic",
): ProfessionMatchResult {
  const empty: ProfessionMatchResult = { best: null, alternatives: [], totalCandidates: 0 };
  if (!data || !userInput) return empty;
  const q = userInput.trim();
  if (!q) return empty;

  const dict = data[market];
  if (!dict) return empty;

  // 1) exact match
  if (dict[q]) {
    const exact: ProfessionMatch = { matchedKey: q, entry: dict[q], matchType: "exact" };
    // 仍然算一次 fuzzy，把同义近邻一起返回
    const others = collectFuzzy(q, dict).filter((m) => m.matchedKey !== q);
    return {
      best: exact,
      alternatives: [exact, ...others].slice(0, 5),
      totalCandidates: 1 + others.length,
    };
  }

  // 2) fuzzy
  const fuzzy = collectFuzzy(q, dict);
  return {
    best: fuzzy[0] || null,
    alternatives: fuzzy.slice(0, 5),
    totalCandidates: fuzzy.length,
  };
}

function collectFuzzy(q: string, dict: Record<string, ProfessionEntry>): ProfessionMatch[] {
  const hits: ProfessionMatch[] = [];
  for (const [key, entry] of Object.entries(dict)) {
    if (entry.vacancyCount < MIN_VACANCY) continue;
    if (key === q) continue;
    if (key.includes(q) || q.includes(key)) {
      hits.push({ matchedKey: key, entry, matchType: "fuzzy" });
    }
  }
  hits.sort((a, b) => b.entry.vacancyCount - a.entry.vacancyCount);
  return hits;
}
