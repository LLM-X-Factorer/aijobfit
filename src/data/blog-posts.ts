import type { ComponentType } from "react";
import JdDatasetDeepDive, { meta as jdMeta } from "@/components/blog/posts/JdDatasetDeepDive";
import ElectricalEngineerToAi, { meta as electricalMeta } from "@/components/blog/posts/ElectricalEngineerToAi";
import type { PostMeta } from "@/components/blog/PostShell";

export interface BlogPost extends PostMeta {
  category: "data" | "transition" | "augment" | "graduate" | "method";
  Component: ComponentType;
}

// 倒序排列（最新在前），列表页直接 map
export const BLOG_POSTS: BlogPost[] = [
  { ...electricalMeta, category: "augment", Component: ElectricalEngineerToAi },
  { ...jdMeta, category: "data", Component: JdDatasetDeepDive },
];

export function findPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export const CATEGORY_LABELS: Record<BlogPost["category"], string> = {
  data: "数据 · 方法论",
  transition: "转行路线",
  augment: "留行 + AI 增强",
  graduate: "应届生",
  method: "工程方法",
};
