// Server 端读取 agent-hunt 静态 JSON
// fetchAgentHunt.ts 在浏览器跑，走相对 URL + 远程 fallback；
// server component / API route 不能用相对 URL，改为直接读 public/data/ 文件。

import fs from "node:fs/promises";
import path from "node:path";
import type { Role, Skill } from "./fetchAgentHunt";

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
