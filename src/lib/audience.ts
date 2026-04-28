// 受众类型推断：基于 yearsExp 字段判断用户是应届/学生还是社招用户。
// 应届路径偏向校招/实习节奏；社招路径偏向项目/portfolio 增量。

export type AudienceType = "fresh-grad" | "social";

const FRESH_GRAD_VALUES = ["应届", "在读学生", "应届生（无实习）", "应届生（有实习）"];

export function audienceTypeFromYears(yearsExp: string): AudienceType {
  return FRESH_GRAD_VALUES.includes(yearsExp) ? "fresh-grad" : "social";
}
