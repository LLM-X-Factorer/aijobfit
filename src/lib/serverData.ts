// Server 端读取 agent-hunt 静态 JSON
// fetchAgentHunt.ts 在浏览器跑，走相对 URL + 远程 fallback；
// server component / API route 不能用相对 URL，改为直接读 public/data/ 文件。

import fs from "node:fs/promises";
import path from "node:path";
import type {
  Role,
  Skill,
  IndustryAugmentedSalary,
  NarrativeStats,
  RolesByCity,
  RolesAugmentedByProfession,
  RolesGraduateFriendly,
  RolesByIndustry,
} from "./fetchAgentHunt";

async function readJson<T>(filename: string): Promise<T> {
  const p = path.join(process.cwd(), "public", "data", filename);
  const buf = await fs.readFile(p, "utf-8");
  return JSON.parse(buf) as T;
}

export async function loadRoles(): Promise<Role[]> {
  return readJson<Role[]>("roles-domestic.json");
}

export async function loadSkills(): Promise<Skill[]> {
  return readJson<Skill[]>("skills.json");
}

const REMOTE_BASE = "https://agent-hunt.pages.dev/data";

async function fetchRemoteJson<T>(filename: string): Promise<T | null> {
  try {
    const r = await fetch(`${REMOTE_BASE}/${filename}`, { cache: "force-cache" });
    if (r.ok) return (await r.json()) as T;
  } catch {
    /* swallow — server-side OG/route handlers must not throw on data outage */
  }
  return null;
}

export async function loadIndustryAugmentedSalary(): Promise<IndustryAugmentedSalary | null> {
  return fetchRemoteJson<IndustryAugmentedSalary>("industry-augmented-salary.json");
}

export async function loadNarrativeStats(): Promise<NarrativeStats | null> {
  return fetchRemoteJson<NarrativeStats>("narrative-stats.json");
}

export async function loadRolesByCity(): Promise<RolesByCity | null> {
  return fetchRemoteJson<RolesByCity>("roles-by-city.json");
}

export async function loadRolesAugmentedByProfession(): Promise<RolesAugmentedByProfession | null> {
  return fetchRemoteJson<RolesAugmentedByProfession>("roles-augmented-by-profession.json");
}

export async function loadRolesGraduateFriendly(): Promise<RolesGraduateFriendly | null> {
  return fetchRemoteJson<RolesGraduateFriendly>("roles-graduate-friendly.json");
}

export async function loadRolesByIndustry(): Promise<RolesByIndustry | null> {
  return fetchRemoteJson<RolesByIndustry>("roles-by-industry.json");
}
