import type { MetadataRoute } from "next";
import { loadRoles, loadRolesByCity } from "@/lib/serverData";
import { BLOG_POSTS } from "@/data/blog-posts";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aijobfit.llmxfactor.cloud";

// 12 行业 keyword，与 industry-augmented-salary.json by_industry 对齐。
// "other" 不单独建页（无诊断价值）。
const INDUSTRIES = [
  "internet",
  "finance",
  "manufacturing",
  "healthcare",
  "education",
  "automotive",
  "energy",
  "consulting",
  "media",
  "retail",
  "telecom",
  "government",
];

// 一线 / 新一线两档生成 city × role 页（vacancyCount >= 5 才出页，避免薄内容）。
// "其他国内" / "海外" / "远程" 数据稀薄，不建独立页。
const SEO_CITY_TIERS = ["一线", "新一线"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/diagnose`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/diagnose-target`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/diagnose-augment`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
  ];

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.modifiedAt || p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const roles = await loadRoles();
  const roleEntries: MetadataRoute.Sitemap = roles
    .filter((r) => r.role_id !== "other")
    .map((r) => ({
      url: `${SITE_URL}/role/${r.role_id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const industryEntries: MetadataRoute.Sitemap = INDUSTRIES.map((ind) => ({
    url: `${SITE_URL}/industry/${ind}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const byCity = await loadRolesByCity();
  const cityEntries: MetadataRoute.Sitemap = [];
  if (byCity?.domestic) {
    for (const [roleId, data] of Object.entries(byCity.domestic)) {
      for (const tier of data.by_tier) {
        if (
          tier.job_count >= 5 &&
          (SEO_CITY_TIERS as readonly string[]).includes(tier.tier)
        ) {
          const tierSlug = tier.tier === "一线" ? "tier1" : "tier2";
          cityEntries.push({
            url: `${SITE_URL}/city/${tierSlug}/${roleId}`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    }
  }

  return [
    ...staticRoutes,
    ...blogEntries,
    ...roleEntries,
    ...industryEntries,
    ...cityEntries,
  ];
}
