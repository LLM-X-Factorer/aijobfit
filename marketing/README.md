# AIJobFit · Marketing & GEO 工作目录

GEO（生成引擎优化 / Generative Engine Optimization）+ 自媒体宣传相关的代码层资产。**纯内容草稿、投放排期、数据看板、人工运营记录请进 Notion / 飞书，不要进 git。**

## 目录结构

```
marketing/
├── README.md                  # 你正在看的文件
├── topics/                    # 选题库（按受众 × 路线 × 长尾职业分类）
│   └── topic-library.md
├── templates/                 # 平台标题 / 开头公式（人工维护，可被脚本调用）
│   ├── xhs-title-formulas.md  # 小红书
│   └── wechat-title-formulas.md  # 公众号
├── ai-mentions/               # AI 引用监测：基线 + 历史快照
│   ├── queries.md             # 监测 query 清单（人工维护）
│   ├── baseline-2026-04-30.md # 当前基线（GEO 基建 ship 后立即记录）
│   └── snapshots/             # 后续每周 / 每月快照存这里
└── scripts/                   # 数据脚本（手动跑）
    └── check-ai-mentions.ts   # 跑 query 清单，输出 JSON 快照
```

## 三条工作流

### 1. 内容生产（外部为主）

- **选题** → 从 `topics/topic-library.md` 挑或新加；每条选题对应 1 个数据锚点（JD 数 / 中位薪资 / 行业切片）+ 1 个站内深链（/role/[id] 或 /industry/[id]）
- **写作** → Notion / 飞书草稿；最终成品贴小红书 / 公众号
- **分发** → 不进 git；用 Notion 排期表

### 2. AI 引用监测

- 每周（或每月）跑 `scripts/check-ai-mentions.ts`，输出 `ai-mentions/snapshots/YYYY-MM-DD.json`
- 对比基线，看 query 命中率 / 引用站点的趋势
- 监测目标：让豆包 / kimi / Perplexity / ChatGPT 在「非程序员转 AI」「电气工程师转 AI」「应届 AI 求职」类问题上引用 aijobfit.llmxfactor.cloud

### 3. pSEO 数据反馈

- 看 GSC（Google Search Console）/ 百度站长 看 14 角色页 / 12 行业页 / 25 城市×角色页的真实流量
- 流量 / 点击 / 印象数据存 Notion，不进 git
- 高流量页面 → 加深内容（比如增加 FAQ / 加二维切片）；零流量页面 → 检查关键词密度 / canonical / sitemap

## GEO 基建已 ship 的内容

（详见 `../CLAUDE.md` 项目主文档 · 2026-04-30 上线）

- robots.txt allow 19 主流 LLM crawler（GPTBot / ClaudeBot / PerplexityBot / Google-Extended / Bytespider / Applebot-Extended 等）
- llms.txt（llmstxt.org 标准格式）
- sitemap.xml 含静态 + 14 role + 12 industry + 25 city×role
- 站点级 JSON-LD（Organization + WebSite + Dataset）
- 首页 FAQPage JSON-LD + 8 个 Q&A
- 14 角色页 / 12 行业页 / 25 城市×角色页 全部带 Article + Breadcrumb schema

## 不要做的事

- ❌ 不要把内容草稿 / 投放记录进 git
- ❌ 不要把脚本运行结果（snapshots）当成代码改 → 它们是 append-only 的数据快照
- ❌ 不要为了堆关键词牺牲页面可读性（Google 2024 起对「为 SEO 而 SEO」有 helpful-content 算法降权）
- ❌ 不要用付费的内容质押（参考 CLAUDE.md：本 app 永久免费）

## 跑监测脚本

```bash
# 设置 API key（从 .env 读，不要 commit）
export PERPLEXITY_API_KEY=...
# 跑基线（输出到 ai-mentions/snapshots/）
npx tsx marketing/scripts/check-ai-mentions.ts
```

脚本骨架已就位但 API 调用层留给后续（手动用 perplexity / tavily MCP 跑也可以，记录到 `ai-mentions/snapshots/` 即可）。
