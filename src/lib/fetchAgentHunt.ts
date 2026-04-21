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
