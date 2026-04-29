// 拉 agent-hunt 静态 JSON 数据
// 策略：先尝试远程，失败 fallback 到本地 /data/

export interface SkillCount {
  skill_id: string;
  count: number;
}

export interface Role {
  role_id: string;
  role_name: string;
  job_count: number;
  sample_titles: string[];
  required_skills: SkillCount[];
  preferred_skills: SkillCount[];
  salary: {
    min: number;
    max: number;
    median: number;
    avg: number;
    p25: number;
    p75: number;
    sample_size: number;
  };
  experience: {
    min_range: [number, number];
    median_min: number;
    avg_min: number;
    sample_size: number;
  };
  education: Record<string, number>;
  work_mode: Record<string, number>;
  top_companies: string[];
  top_industries: { industry: string; count: number }[];
}

export interface Skill {
  id: string;
  canonical_name: string;
  category: string;
  subcategory: string | null;
  domestic_count: number;
  international_count: number;
  total_count: number;
  avg_salary_with: number | null;
}

const REMOTE_BASE = "https://agent-hunt.pages.dev/data";
const LOCAL_BASE = "/data";

async function fetchJson<T>(filename: string): Promise<T> {
  // 先试远程
  try {
    const r = await fetch(`${REMOTE_BASE}/${filename}`, { cache: "force-cache" });
    if (r.ok) return (await r.json()) as T;
  } catch {
    /* swallow，fallback */
  }
  // fallback 到本地静态
  const r = await fetch(`${LOCAL_BASE}/${filename}`, { cache: "force-cache" });
  if (!r.ok) throw new Error(`Failed to fetch ${filename}: ${r.status}`);
  return (await r.json()) as T;
}

export async function fetchRoles(): Promise<Role[]> {
  return fetchJson<Role[]>("roles-domestic.json");
}

export async function fetchSkills(): Promise<Skill[]> {
  return fetchJson<Skill[]>("skills.json");
}

// 行业 × AI 增强真实 JD 的薪资分布。replace 角色全国 P25/P50/P75 当用户行业匹配时，
// 让薪资节体现行业差异（金融 30k vs 媒体 12.5k）。
export interface IndustryAugmentedSalary {
  by_industry: {
    industry: string; // 英文 keyword
    job_count: number;
    salary_sample_size: number;
    p25: number;
    p50: number;
    p75: number;
  }[];
  comparison: {
    premium_traditional_industries: string[];
    premium_traditional_median: number;
    premium_traditional_sample_size: number;
    internet_median: number;
    internet_sample_size: number;
    delta_pct: number;
  };
  total_jobs: number;
}

export async function fetchIndustryAugmentedSalary(): Promise<IndustryAugmentedSalary | null> {
  // 本地 public/data 没快照，远程不可达就降级为 null（buildSalary 退回到角色全国数据）。
  try {
    const r = await fetch(`${REMOTE_BASE}/industry-augmented-salary.json`, {
      cache: "force-cache",
    });
    if (r.ok) return (await r.json()) as IndustryAugmentedSalary;
  } catch {
    /* swallow */
  }
  return null;
}

export interface NarrativeStats {
  totals: { all_jobs: number; labeled_jobs: number };
  p1_market_basic: {
    domestic_traditional_aug_total: number;
    domestic_internet_aug_total: number;
    domestic_industry_breakdown: { industry: string; count: number }[];
  };
}

export async function fetchNarrativeStats(): Promise<NarrativeStats | null> {
  try {
    const r = await fetch(`${REMOTE_BASE}/narrative-stats.json`, {
      cache: "force-cache",
    });
    if (r.ok) return (await r.json()) as NarrativeStats;
  } catch {
    /* swallow */
  }
  return null;
}

export interface RolesByCity {
  domestic: Record<
    string,
    {
      role_name: string;
      by_tier: {
        tier: string; // 一线 / 新一线 / 其他国内 / 海外 / 远程
        cities_in_tier: string[];
        job_count: number;
        salary: { p25: number; p50: number; p75: number; sample_size: number };
      }[];
      top_cities: { city: string; count: number; median: number; sample: number }[];
    }
  >;
}

export async function fetchRolesByCity(): Promise<RolesByCity | null> {
  try {
    const r = await fetch(`${REMOTE_BASE}/roles-by-city.json`, {
      cache: "force-cache",
    });
    if (r.ok) return (await r.json()) as RolesByCity;
  } catch {
    /* swallow */
  }
  return null;
}
