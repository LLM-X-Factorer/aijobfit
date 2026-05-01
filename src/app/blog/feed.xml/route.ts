import { BLOG_POSTS } from "@/data/blog-posts";
import { CATEGORY_LABELS } from "@/data/blog-posts";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

const FEED_URL = `${SITE_URL}/blog/feed.xml`;

export const dynamic = "force-static";
export const revalidate = 3600;

const FEED_TITLE = "AIJobFit Blog · 非程序员 AI 求职数据深拆";
const FEED_DESC =
  "基于 8238 条国内真实 AI 招聘 JD + 14 角色聚类 + 420 长尾原职业的深度文章。覆盖电气工程师 / 教师 / 医生 / 销售 / 应届生等差异化人群转 AI 或留行 + AI 的真实路径。永久免费。";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

export async function GET(): Promise<Response> {
  const lastBuildDate = rfc822(
    BLOG_POSTS.map((p) => p.modifiedAt || p.publishedAt).sort().reverse()[0] ||
      new Date().toISOString(),
  );

  const items = BLOG_POSTS.map((p) => {
    const url = `${SITE_URL}/blog/${p.slug}`;
    const categories = Array.from(
      new Set([CATEGORY_LABELS[p.category], ...p.tags]),
    );
    return [
      "    <item>",
      `      <title>${xmlEscape(p.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${rfc822(p.publishedAt)}</pubDate>`,
      `      <description>${xmlEscape(p.excerpt)}</description>`,
      ...categories.map((c) => `      <category>${xmlEscape(c)}</category>`),
      `      <author>noreply@aijobfit.llmxfactor.cloud (AIJobFit)</author>`,
      "    </item>",
    ].join("\n");
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(FEED_TITLE)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${xmlEscape(FEED_DESC)}</description>
    <language>zh-CN</language>
    <copyright>© AIJobFit · 数据来源 Agent Hunt（开源 · 每周更新）</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
