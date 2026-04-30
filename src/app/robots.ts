import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

// 显式 allow 主流 LLM crawler。技术上 default allow 已经足够，但显式列出
// 让 AI 厂商的 robots 解析器看到正向信号 + 方便后续 ops 审计 / 屏蔽某家。
const LLM_CRAWLERS = [
  "GPTBot",              // OpenAI 训练
  "ChatGPT-User",        // ChatGPT 实时浏览
  "OAI-SearchBot",       // SearchGPT 索引
  "ClaudeBot",           // Anthropic 训练
  "Claude-Web",          // Anthropic 旧 UA
  "anthropic-ai",        // Anthropic 旧 UA 别名
  "PerplexityBot",       // Perplexity 索引
  "Perplexity-User",     // Perplexity Pro 实时
  "Google-Extended",     // Gemini 训练
  "Applebot-Extended",   // Apple Intelligence
  "Bytespider",          // 字节豆包 / Doubao
  "Amazonbot",           // Alexa+ / Amazon AI
  "Meta-ExternalAgent",  // Meta AI
  "DuckAssistBot",       // DuckDuckGo AI
  "cohere-ai",           // Cohere
  "YouBot",              // You.com
  "Diffbot",             // 数据抓取
  "ImagesiftBot",        // Hive AI
  "PetalBot",            // 华为小艺
];

export default function robots(): MetadataRoute.Robots {
  const baseRules = { allow: "/", disallow: ["/api/", "/result/"] };
  return {
    rules: [
      { userAgent: "*", ...baseRules },
      ...LLM_CRAWLERS.map((ua) => ({ userAgent: ua, ...baseRules })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
