import type { MetadataRoute } from "next";
import {
  loadRoles,
  loadRolesByCity,
  loadRolesByIndustry,
} from "@/lib/serverData";
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
    { url: `${SITE_URL}/skills`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
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

  const byIndustry = await loadRolesByIndustry();
  const industryRoleEntries: MetadataRoute.Sitemap = [];
  if (byIndustry?.data?.domestic) {
    for (const [industry, roleMap] of Object.entries(byIndustry.data.domestic)) {
      if (!INDUSTRIES.includes(industry)) continue;
      for (const [roleId, e] of Object.entries(roleMap)) {
        if (e.vacancyCount >= 5 && roleId !== "other") {
          industryRoleEntries.push({
            url: `${SITE_URL}/industry/${industry}/${roleId}`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.65,
          });
        }
      }
    }
  }

  // Compare pairs: 14 角色（去 other）两两组合，按字母序避免重复
  const compareEntries: MetadataRoute.Sitemap = [];
  const compareIds = roles
    .filter((r) => r.role_id !== "other")
    .map((r) => r.role_id)
    .sort();
  for (let i = 0; i < compareIds.length; i++) {
    for (let j = i + 1; j < compareIds.length; j++) {
      compareEntries.push({
        url: `${SITE_URL}/compare/${compareIds[i]}-vs-${compareIds[j]}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.55,
      });
    }
  }

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
    ...industryRoleEntries,
    ...cityEntries,
    ...compareEntries,
  ];
}
