// 兜底提示：当用户技能与 agent-hunt 角色 required_skills 无交集时，
// 诚实告知"Top 3 都是 0%"背后的原因，并给出可执行的下一步（按 targetTrack 补齐 AI 工具技能）。

import type { Track } from "@/data/tracks";

export default function ReportFallbackNotice({
  track,
}: {
  track: Track | null | undefined;
}) {
  return (
    <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="text-2xl shrink-0 leading-none">⚠️</div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-amber-900 mb-2">
            下方 Top 3 匹配度均为 0%，这是诚实的计算结果
          </h3>
          <div className="text-sm text-amber-900/80 space-y-2 leading-relaxed">
            <p>
              我们的角色匹配来自 2370 条真实 AI 岗位 JD 聚类出的 <strong>36 项技能词典</strong>，
              清单偏向硬核 AI / ML（Python / LLM / Prompt Engineering / RAG / Dify / Coze 等）。
              你当前选的技能项与这份词典的重合度很低，所以 required_skills 命中为 0。
            </p>
            <p>
              这 <strong>不代表你不适合</strong> AI 岗位。大量非程序员转 AI 的关键第一步，就是先掌握 1–2 个 AI 工具技能。
            </p>
            {track && (
              <p>
                根据你选的目标方向「<strong>{track.id} · {track.name}</strong>」，
                建议优先补齐这些技能：
                <span className="font-semibold"> {track.keySkills.join(" / ")}</span>。
                然后重新诊断，匹配度会显著提高。
              </p>
            )}
            <p className="pt-1">
              下方报告仍然会展示 4 主线匹配度、薪资区间、基于目标方向的学习路径等内容，可以照常看。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
