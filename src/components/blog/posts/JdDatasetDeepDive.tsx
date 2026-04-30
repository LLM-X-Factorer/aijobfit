import {
  PostShell,
  H2,
  H3,
  P,
  Ul,
  Ol,
  Li,
  Quote,
  Callout,
  DataTable,
  Code,
  Strong,
  PostLink,
  type PostMeta,
} from "../PostShell";

export const meta: PostMeta = {
  slug: "8238-jd-dataset-deep-dive",
  title: "8238 条国内 AI 招聘 JD 开源数据集深度拆解：怎么聚类、怎么用、边界在哪",
  excerpt:
    "Agent Hunt 是一个开源仓库，从国内主流招聘平台抓了 8238 条 AI 相关 JD，做成 14 个角色聚类 + 12 行业切片 + 5 城市 tier × 角色薪资 + 420 条长尾原职业映射。这篇文章把数据怎么来的、怎么用、哪里有偏差全部讲清楚，给程序员社区 + AI 求职研究者引用。",
  publishedAt: "2026-04-30",
  tags: ["数据集", "agent-hunt", "AI 招聘", "方法论", "开源"],
  readMinutes: 12,
};

export default function Post() {
  return (
    <PostShell meta={meta}>
      <P>
        2026 年 4 月底我们 ship 了一个工具叫{" "}
        <Strong>AIJobFit</Strong>（在 llmxfactor.cloud 上），帮非程序员（运营 / HR / 设计 / 教师 / 电气 / 财务 / 销售）做 AI 求职定位诊断。底层数据来自一个独立的开源项目{" "}
        <PostLink href="https://github.com/LLM-X-Factorer/agent-hunt">
          Agent Hunt
        </PostLink>
        ，从国内主流招聘平台抓了 8238 条 AI 相关 JD。
      </P>
      <P>
        这篇文章拆给所有人看：数据怎么来、聚类怎么做、可以怎么用、边界在哪。希望对程序员社区 / AI 求职研究者 / HR 数字化从业者有用。
      </P>

      <H2>数据规模 · 截至 2026-04-29</H2>

      <DataTable
        headers={["维度", "数量", "说明"]}
        rows={[
          ["原始 JD", "8,238", "从国内主流招聘平台抓取的「AI 相关」JD（含程序员 + 非程序员岗位）"],
          ["已聚类", "5,673", "通过 SCI（Skill Cluster Identity）评分聚到 14 个角色聚类的 JD"],
          ["未聚类（other）", "482", "聚类置信度过低，归到 other 桶不参与角色推荐"],
          ["角色聚类", "14", "AI 产品经理 / AI/LLM 工程师 / 算法 / AI 转型咨询 / AI 销售 / AI 运营 / 智能制造 / 数据 / 教育 AI / 医疗 AI / 客服 / 风险合规 / 自主体 / 领导岗"],
          ["行业切片", "12", "互联网 / 金融 / 制造 / 医疗 / 教育 / 汽车 / 能源 / 咨询 / 媒体 / 零售 / 电信 / 政府"],
          ["城市 tier", "5", "一线 / 新一线 / 其他国内 / 海外 / 远程"],
          ["原职业字典", "420", "用于「留行 + AI 增强」诊断（电气工程师 / 医生 / 教师 / 销售 / 设计师 等长尾）"],
        ]}
      />

      <P>
        相比 ATS 厂商发的「招聘趋势报告」，这份数据有 3 个区别：
      </P>
      <Ul>
        <Li>
          <Strong>真实 JD，不是抽样调查或人工标签。</Strong>每条记录都能追溯到具体岗位描述。
        </Li>
        <Li>
          <Strong>聚类逻辑公开、可复现。</Strong>{" "}
          <PostLink href="https://github.com/LLM-X-Factorer/agent-hunt">
            agent-hunt
          </PostLink>{" "}
          仓库里能看到所有抽取规则 / SCI 评分代码。
        </Li>
        <Li>
          <Strong>每周更新。</Strong>不是一年发一次的 PDF 报告。
        </Li>
      </Ul>

      <H2>14 个角色聚类是怎么做的</H2>

      <P>
        我们没有用 LLM 做 zero-shot 分类（理由：LLM 推理成本贵 + 类目漂移 + 难以审计）。用的是更老派但更可解释的方法：
      </P>

      <Ol>
        <Li>
          <Strong>从职位标题 + JD 正文提取技能信号。</Strong>预定义 36 个 AI 相关 skill canonical name（
          <Code>llm</Code> / <Code>prompt_engineering</Code> /{" "}
          <Code>computer_vision</Code> / <Code>rag</Code> / <Code>agent</Code> / <Code>fine_tuning</Code> 等），用同义词词典匹配。
        </Li>
        <Li>
          <Strong>SCI（Skill Cluster Identity）评分。</Strong>每个 JD 在每个角色聚类下的命中分数 = 必备技能命中数 × 1 + 优选技能命中数 × 0.5。
        </Li>
        <Li>
          <Strong>归属规则。</Strong>SCI 最高的聚类胜出；如果 Top 1 SCI &lt; 阈值（防止稀疏命中误判），归入{" "}
          <Code>other</Code>。
        </Li>
        <Li>
          <Strong>角色边界由数据决定，不由人工拍脑袋。</Strong>「自主体 (autonomous)」「智能制造」这些类目是从聚类涌现的，不是先验设计的。
        </Li>
      </Ol>

      <Callout tone="warn" title="已知聚类弱点">
        D 主线（AIGC 创意：剪映 / SD / Midjourney / ComfyUI 工具向）目前没有独立角色聚类，挂在
        <Code> other</Code> 桶下。原因是 AIGC 类岗位 JD 的技能词高度分散（设计师写「视觉表现」「创意」这种 fuzzy 词，而不是工具名），SCI 阈值容易过不去。下游消费者（aijobfit 的报告）用了「主线指纹扫描」机制做兜底，但严格意义上数据本身仍欠一个 AIGC 聚类。
      </Callout>

      <H2>核心字段速查</H2>

      <P>
        Agent Hunt 暴露的 7 个 JSON endpoint，每个都有 schema 在仓库 README 里。aijobfit 当前用了全部 7 个。下面是最核心的 3 个字段示例：
      </P>

      <H3>
        <Code>roles-domestic.json</Code> · 14 角色聚类
      </H3>

      <DataTable
        headers={["字段", "类型", "举例（AI 产品经理）"]}
        rows={[
          ["role_id", "string", "product_manager"],
          ["role_name", "string (zh-CN)", "AI 产品经理"],
          ["job_count", "number", "293"],
          ["sample_titles", "string[]", "AI产品策划（LLM记忆与交互方向）/ AI产品经理（AIGC/跨境电商方向）/ AI LLM Product Manager"],
          ["required_skills", "{skill_id, count}[]", "[{prompt_engineering, 187}, {data_analysis, 142}, ...]"],
          ["preferred_skills", "{skill_id, count}[]", "[{rag, 86}, {agent, 64}, ...]"],
          ["salary", "{p25, p50, p75, ...}", "{p25: 22500, p50: 32500, p75: 50000, sample_size: 247}"],
          ["top_industries", "{industry, count}[]", "[{internet, 142}, {manufacturing, 36}, {finance, 32}]"],
          ["top_companies", "string[]", "字节 / 阿里 / 腾讯 / 美团 / ..."],
          ["education", "Record<level, count>", "{硕士: 87, 本科: 142, 不限: 64}"],
          ["experience", "{median_min, ...}", "{median_min: 3, sample_size: 217}"],
        ]}
      />

      <H3>
        <Code>industry-augmented-salary.json</Code> · 12 行业 × AI 增强 JD 薪资
      </H3>

      <P>
        这是 aijobfit 用来反驳「传统行业 AI 待遇低」误解的核心数据。从{" "}
        <Code>by_industry</Code> 字段看，金融 AI 增强中位 ¥30k、能源 ¥48.75k、制造 ¥30k，跟互联网中位线持平甚至更高。
      </P>

      <DataTable
        headers={["行业", "AI 增强 JD 数", "P25", "P50", "P75"]}
        rows={[
          ["energy（能源）", 6, "¥35k", "¥48.75k", "¥52.5k"],
          ["finance（金融）", 85, "¥22.5k", "¥30k", "¥50k"],
          ["manufacturing（制造）", 152, "¥20k", "¥30k", "¥45k"],
          ["healthcare（医疗）", 88, "¥15k", "¥30k", "¥45k"],
          ["telecom（电信）", 5, "¥16.5k", "¥27.5k", "¥27.5k"],
          ["（互联网作为对照）", "—", "—", "见 internet 字段", "—"],
        ]}
      />

      <Callout tone="info" title="样本量警告">
        energy / telecom 的 AI 增强 JD &lt; 10 条，统计噪声大，看趋势别看数字。aijobfit 在这种行业页 SSR 时会标注 sample_size，提醒用户。
      </Callout>

      <H3>
        <Code>roles-augmented-by-profession.json</Code> · 420 长尾原职业 × AI 增强 JD
      </H3>

      <P>
        这是「留行 + AI 增强」路线的数据底座。每个原职业（如「电气工程师」「医生」「教师」「文案策划」）有：
      </P>

      <Ul>
        <Li>
          <Code>vacancyCount</Code> — 该原职业 + AI 增强 JD 的总数
        </Li>
        <Li>
          <Code>salaryMedian</Code> — 中位薪资
        </Li>
        <Li>
          <Code>augmentSkills</Code> — 该原职业要叠加哪些 AI 技能（按命中频次）
        </Li>
        <Li>
          <Code>topIndustries</Code> — 主要分布行业
        </Li>
        <Li>
          <Code>sampleTitles</Code> — 真实职位标题样本
        </Li>
      </Ul>

      <Callout tone="warn" title="长尾稀疏问题">
        420 条原职业中只有约 30% 的 vacancyCount ≥ 10。aijobfit 用了 4 档「准备度档位」（first-class / mid / starter / no-data）+ exact-match → fuzzy contains → vacancyCount ≥ 5 阈值的多级匹配，缓解 LLM 解析准确率不足的痛点。
      </Callout>

      <H2>怎么用这份数据</H2>

      <H3>1. 自己跑分析</H3>

      <P>
        所有 JSON 在{" "}
        <PostLink href="https://agent-hunt.pages.dev/data">
          agent-hunt.pages.dev/data
        </PostLink>{" "}
        免费下载。建议起手：
      </P>

      <Ul>
        <Li>
          <Code>roles-domestic.json</Code> + <Code>skills.json</Code> 看 14 角色 × 36 技能矩阵
        </Li>
        <Li>
          <Code>industry-augmented-salary.json</Code> 拿来跟你自己行业的预期对比
        </Li>
        <Li>
          <Code>narrative-stats.json</Code> 拿到全局 totals（也能看「传统行业 vs 互联网」的 delta_pct）
        </Li>
      </Ul>

      <H3>2. 直接用 AIJobFit 的 pSEO 页面</H3>

      <P>
        如果你不想自己跑，aijobfit 已经把这些数据切成了 51 个 SSR 页面：
      </P>

      <Ul>
        <Li>
          14 个角色页 → <PostLink href="/role/product_manager">AI 产品经理</PostLink>
          {" / "}
          <PostLink href="/role/ai_engineer">AI/LLM 工程师</PostLink>
          {" / "}
          <PostLink href="/role/algorithm">算法工程师</PostLink>
          {" / ..."}
        </Li>
        <Li>
          12 个行业页 → <PostLink href="/industry/manufacturing">制造</PostLink>
          {" / "}
          <PostLink href="/industry/finance">金融</PostLink>
          {" / "}
          <PostLink href="/industry/healthcare">医疗</PostLink>
          {" / ..."}
        </Li>
        <Li>
          25 个城市 × 角色页 → <PostLink href="/city/tier1/product_manager">一线 AI PM</PostLink>
          {" / "}
          <PostLink href="/city/tier2/product_manager">新一线 AI PM</PostLink>
          {" / ..."}
        </Li>
      </Ul>

      <H3>3. 三路线诊断</H3>

      <P>
        基于这些数据，aijobfit 提供 3 种诊断模式：
      </P>

      <Ul>
        <Li>
          <PostLink href="/diagnose">
            系统推荐 Top 3
          </PostLink>{" "}
          — 填技能 + 背景，算法在 14 角色聚类里挑 Top 3 + 4 主线分布
        </Li>
        <Li>
          <PostLink href="/diagnose-target">
            转行 Gap 诊断
          </PostLink>{" "}
          — 锁定行业 + 目标岗位，仅算锁定角色的匹配率 + Gap
        </Li>
        <Li>
          <PostLink href="/diagnose-augment">
            留行 + AI 增强
          </PostLink>{" "}
          — 填原职业（free-text → 模糊匹配 420 entry），看「原职业 + AI 增强」JD 画像
        </Li>
      </Ul>

      <H2>边界在哪</H2>

      <P>
        诚实讲，这份数据有几个短板（在 agent-hunt 仓库 issue tracker 里也都跟踪着）：
      </P>

      <Ol>
        <Li>
          <Strong>样本偏向头部平台。</Strong>抓的主要是国内主流招聘平台（Boss / 拉勾 / 猎聘 / 51job），县城招聘 / 朋友圈内推 / 政企内招都没覆盖。
        </Li>
        <Li>
          <Strong>JD 文本质量参差。</Strong>少数岗位标题是中英混写或错别字，sample_titles 里能看到。我们没做强清洗，原汁原味暴露。
        </Li>
        <Li>
          <Strong>行业 × 角色二维切片缺失。</Strong>当前只能看「金融行业全部 AI 增强 JD」或「AI 产品经理全部 JD」，但「金融行业里数据分析师空缺多少」这种二维查询还没 ship（agent-hunt issue #9）。
        </Li>
        <Li>
          <Strong>D 主线 AIGC 没单独聚类。</Strong>挂在 other 桶，aijobfit 用「主线指纹扫描」做了产品级兜底，但数据本身欠一类。
        </Li>
        <Li>
          <Strong>augmentSkills 命中频次稀疏。</Strong>产品经理这种类目只有 2 个 augmentSkills（computer_vision + llm 各 count=1），影响 readiness 档位精度（agent-hunt issue #10）。
        </Li>
      </Ol>

      <Callout tone="ok" title="贡献欢迎">
        agent-hunt 是 MIT license 开源仓库。如果你能补抽取规则 / 加抓取源 / 做更细粒度的聚类，PR 直接欢迎。aijobfit 是 supply 端 → demand 端的下游消费者，agent-hunt 跑得越好，aijobfit 也越准。
      </Callout>

      <H2>为什么我们要把数据完全开源</H2>

      <Quote>
        如果一个 AI 求职工具不告诉你它的数据从哪来，要么数据在画饼，要么它有付费墙等着收割你。
      </Quote>

      <P>
        aijobfit 是永久免费的，不做产品内付费。这意味着我们没有动机把数据藏在付费墙后面。把全套数据 + 所有聚类逻辑 + 评分公式开源到 GitHub，是为了让用户能验证我们的结论，也让有能力的人能在我们的基础上做更深的分析。
      </P>

      <P>
        如果你是程序员 / 研究者 / 做 HR 数字化的同行，{" "}
        <PostLink href="https://github.com/LLM-X-Factorer/agent-hunt">
          来 star 一下 agent-hunt
        </PostLink>
        ，或者直接在 issue 里告诉我们你想看哪个维度的切片。
      </P>

      <P>
        如果你是非程序员的求职者，
        <PostLink href="/diagnose-target">直接来跑诊断</PostLink>，10 分钟出 7 节报告，所有数字都能下钻到 agent-hunt 的原始 JSON 验证。
      </P>
    </PostShell>
  );
}
