import type { ComponentType } from "react";
import JdDatasetDeepDive, { meta as jdMeta } from "@/components/blog/posts/JdDatasetDeepDive";
import ElectricalEngineerToAi, { meta as electricalMeta } from "@/components/blog/posts/ElectricalEngineerToAi";
import TeacherToAi, { meta as teacherMeta } from "@/components/blog/posts/TeacherToAi";
import DoctorToMedicalAi, { meta as doctorMeta } from "@/components/blog/posts/DoctorToMedicalAi";
import SalesToAi, { meta as salesMeta } from "@/components/blog/posts/SalesToAi";
import GraduateAiJobs, { meta as gradMeta } from "@/components/blog/posts/GraduateAiJobs";
import FinanceToAi, { meta as financeMeta } from "@/components/blog/posts/FinanceToAi";
import HrToAi, { meta as hrMeta } from "@/components/blog/posts/HrToAi";
import DesignerToAigc, { meta as designerMeta } from "@/components/blog/posts/DesignerToAigc";
import type { PostMeta } from "@/components/blog/PostShell";

export interface BlogPost extends PostMeta {
  category: "data" | "transition" | "augment" | "graduate" | "method";
  Component: ComponentType;
}

// 倒序排列（最新在前），列表页直接 map
export const BLOG_POSTS: BlogPost[] = [
  { ...financeMeta, category: "augment", Component: FinanceToAi },
  { ...hrMeta, category: "augment", Component: HrToAi },
  { ...designerMeta, category: "augment", Component: DesignerToAigc },
  { ...gradMeta, category: "graduate", Component: GraduateAiJobs },
  { ...salesMeta, category: "augment", Component: SalesToAi },
  { ...doctorMeta, category: "augment", Component: DoctorToMedicalAi },
  { ...teacherMeta, category: "augment", Component: TeacherToAi },
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
