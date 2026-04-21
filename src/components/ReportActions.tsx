import { ActionsData, MetaData } from "@/lib/reportGen";

export default function ReportActions({
  actions,
  meta,
}: {
  actions: ActionsData;
  meta: MetaData;
}) {
  const blocks = [
    { title: "未来 7 天", items: actions.d7, color: "from-emerald-500 to-emerald-600" },
    { title: "未来 30 天", items: actions.d30, color: "from-blue-500 to-blue-600" },
    { title: "未来 90 天", items: actions.d90, color: "from-indigo-500 to-indigo-600" },
  ];

  return (
    <>
      <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">第 6 节 · 7 / 30 / 90 天行动</h2>
        <p className="text-sm text-slate-500 mb-6">
          不绑定任何路径，纯执行建议。90 天后重新做一次诊断，对比你的 Gap 缩小了多少。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {blocks.map((b) => (
            <div key={b.title} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className={`bg-gradient-to-r ${b.color} text-white px-4 py-2 text-sm font-bold`}>
                {b.title}
              </div>
              <ul className="p-4 space-y-2 text-sm text-slate-700">
                {b.items.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-slate-400">{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 第 7 节 · 附录（合并到 Actions 文件减少组件数量） */}
      <section className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
        <h2 className="text-xl font-black text-slate-900 mb-2">第 7 节 · 报告生成依据</h2>
        <div className="text-sm text-slate-600 space-y-2">
          <p>
            · 本报告基于 Agent Hunt 平台 <strong>{meta.jdTotal.toLocaleString()}</strong> 条真实
            招聘 JD 生成，覆盖 <strong>{meta.rolesTotal}</strong> 个国内 AI 角色聚类。
          </p>
          <p>· 数据更新至 {meta.generatedAt}。报告 ID：{meta.reportId}</p>
          <p>
            · 角色聚类、技能频次、薪资分布均来自{" "}
            <a
              href="https://github.com/LLM-X-Factorer/agent-hunt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              开源项目 Agent Hunt
            </a>
            。匹配算法说明：用户技能 ∩ 角色 required + preferred × 0.5 / 总权重，× 主线加成 ×
            学历惩罚。
          </p>
          <p>· 我们承诺不会向第三方出售你的数据；你的报告仅用于个人查阅。</p>
        </div>
      </section>
    </>
  );
}
