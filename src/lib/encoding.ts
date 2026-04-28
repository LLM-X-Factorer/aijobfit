// URL 编码/解码用户输入
// 用 base64url（去 +/= 安全字符）保证 URL 友好

export interface UserInput {
  currentJob: string;
  yearsExp: string;
  education: string;
  city?: string;
  skills: string[];
  targetTrack: string[];
  motivation?: string;
  industry?: string[];
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  timeBudget?: string;
  // 路线 A（默认）= 系统推荐 Top 3 角色；路线 B = 用户锁定行业 + 岗位，只诊断匹配率
  route?: "A" | "B";
  // 路线 B 必填：用户锁定的 14 角色之一的 role_id（如 "product_manager"）
  targetRoleId?: string;
}

function toBase64Url(str: string): string {
  const utf8 =
    typeof Buffer !== "undefined"
      ? Buffer.from(str, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(str)));
  return utf8.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64: string): string {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 ? padded + "=".repeat(4 - (padded.length % 4)) : padded;
  if (typeof Buffer !== "undefined") {
    return Buffer.from(pad, "base64").toString("utf-8");
  }
  return decodeURIComponent(escape(atob(pad)));
}

export function encodeInput(input: UserInput): string {
  return toBase64Url(JSON.stringify(input));
}

export function decodeInput(hash: string): UserInput {
  const json = fromBase64Url(hash);
  return JSON.parse(json) as UserInput;
}
