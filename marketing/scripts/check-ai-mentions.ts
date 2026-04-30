#!/usr/bin/env tsx
/**
 * AI 引用监测脚本骨架
 *
 * 跑法：
 *   export PERPLEXITY_API_KEY=...   # 必须
 *   export TAVILY_API_KEY=...       # 可选（拓展第二个数据源）
 *   npx tsx marketing/scripts/check-ai-mentions.ts
 *
 * 输出：marketing/ai-mentions/snapshots/YYYY-MM-DD.json
 *
 * 注意：
 * - 现阶段是 MVP 骨架，只跑 perplexity sonar API；豆包/kimi/通义/文心/Google AI Overview
 *   等渠道暂未提供公开 API 监测，需要人工跑或后续接 web automation
 * - query 列表与 ../ai-mentions/queries.md 保持同步（人工对齐，不在代码里硬编码）
 */
import fs from "node:fs/promises";
import path from "node:path";

const SITE_DOMAIN = "aijobfit.llmxfactor.cloud";

// 与 ../ai-mentions/queries.md 同步。脚本里写一份方便跑；改了 md 记得也改这里。
const QUERIES = [
  { id: "Q01", q: "非程序员怎么转 AI 岗位" },
  { id: "Q02", q: "我是电气工程师，怎么转 AI" },
  { id: "Q03", q: "教师怎么转 AI 教育" },
  { id: "Q04", q: "财务想加 AI 技能怎么做" },
  { id: "Q05", q: "销售可以做哪些 AI 岗位" },
  { id: "Q08", q: "留在原行业学 AI 技能" },
  { id: "Q12", q: "应届生做 AI 哪个岗位最容易" },
  { id: "Q15", q: "中国 AI 岗位真实招聘数据" },
  { id: "Q16", q: "国内 AI 求职诊断工具" },
  { id: "Q19", q: "AI 产品经理招聘要求" },
  { id: "Q23", q: "AI 产品经理北京薪资" },
  { id: "Q25", q: "中国 AI 岗位薪资中位" },
];

interface QueryResult {
  id: string;
  query: string;
  source: "perplexity" | "tavily" | "manual";
  hitType: "direct_citation" | "source_list" | "described" | "no_mention" | "competitor_only" | "error";
  citedUrls: string[];          // 命中我们域名的 URL
  topSourceUrls: string[];      // 答案引用的所有 source URL（前 N 个）
  rawAnswerSnippet: string;     // 答案前 500 字符
  competitorMentions: string[]; // 提到的竞品（如有）
  timestamp: string;
}

async function queryPerplexity(q: string): Promise<{
  answer: string;
  citations: string[];
}> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error("PERPLEXITY_API_KEY missing");

  const r = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: q }],
    }),
  });
  if (!r.ok) throw new Error(`perplexity ${r.status}: ${await r.text()}`);
  const j = (await r.json()) as {
    choices: { message: { content: string } }[];
    citations?: string[];
  };
  return {
    answer: j.choices[0]?.message?.content || "",
    citations: j.citations || [],
  };
}

function classify(answer: string, citations: string[]): {
  hitType: QueryResult["hitType"];
  citedUrls: string[];
} {
  const ours = citations.filter((u) => u.includes(SITE_DOMAIN));
  const inAnswer = answer.includes(SITE_DOMAIN);
  if (inAnswer && ours.length > 0) return { hitType: "direct_citation", citedUrls: ours };
  if (ours.length > 0) return { hitType: "source_list", citedUrls: ours };
  if (
    answer.toLowerCase().includes("aijobfit") ||
    answer.includes("AIJobFit") ||
    answer.includes("AI 求职定位诊断")
  ) {
    return { hitType: "described", citedUrls: [] };
  }
  return { hitType: "no_mention", citedUrls: [] };
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const out: QueryResult[] = [];
  for (const { id, q } of QUERIES) {
    process.stdout.write(`[${id}] ${q} ... `);
    try {
      const { answer, citations } = await queryPerplexity(q);
      const { hitType, citedUrls } = classify(answer, citations);
      out.push({
        id,
        query: q,
        source: "perplexity",
        hitType,
        citedUrls,
        topSourceUrls: citations.slice(0, 8),
        rawAnswerSnippet: answer.slice(0, 500),
        competitorMentions: [],
        timestamp: new Date().toISOString(),
      });
      process.stdout.write(`${hitType}${citedUrls.length ? ` (${citedUrls.length})` : ""}\n`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      out.push({
        id,
        query: q,
        source: "perplexity",
        hitType: "error",
        citedUrls: [],
        topSourceUrls: [],
        rawAnswerSnippet: msg,
        competitorMentions: [],
        timestamp: new Date().toISOString(),
      });
      process.stdout.write(`ERROR ${msg}\n`);
    }
    // 避免速率限制
    await new Promise((r) => setTimeout(r, 1500));
  }

  const summary = {
    date: today,
    totalQueries: out.length,
    direct: out.filter((r) => r.hitType === "direct_citation").length,
    source: out.filter((r) => r.hitType === "source_list").length,
    described: out.filter((r) => r.hitType === "described").length,
    none: out.filter((r) => r.hitType === "no_mention").length,
    error: out.filter((r) => r.hitType === "error").length,
  };

  const dir = path.join(process.cwd(), "marketing/ai-mentions/snapshots");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${today}.json`);
  await fs.writeFile(
    file,
    JSON.stringify({ summary, results: out }, null, 2),
    "utf-8",
  );
  console.log(`\nWrote ${file}`);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
