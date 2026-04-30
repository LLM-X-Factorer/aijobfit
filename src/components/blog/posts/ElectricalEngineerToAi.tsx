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
  Strong,
  PostLink,
  type PostMeta,
} from "../PostShell";

export const meta: PostMeta = {
  slug: "electrical-engineer-to-ai",
  title: "电气工程师不要硬转 AI 产品经理：152 条制造业 AI 增强 JD 拆解后我建议你留行",
  excerpt:
    "「电气工程师转 AI」的主流话术是「学 Python + AI Agent 框架转 AI 工程师」。我们用 152 条国内制造业 × AI 增强真实 JD 反推：留在制造业 + AI 增强，比硬转 AI 产品经理 / AI 工程师更稳，中位薪资也更高。",
  publishedAt: "2026-04-30",
  tags: ["电气工程师", "智能制造", "留行 + AI 增强", "长尾职业", "反向操作"],
  readMinutes: 9,
};

export default function Post() {
  return (
    <PostShell meta={meta}>
      <P>
        如果你是电气工程师 / 机械工程师 / 工艺工程师 / 自动化工程师，最近大概率被「转 AI」类内容轰炸过。csdn / juejin 上的主流话术是：
      </P>

      <Quote>
        2026 年 AI 岗位涨 12 倍 / 小白也能转 AI / 三个月速成 AI Agent 工程师 / 学 Python + LangChain + 向量数据库 ...
      </Quote>

      <P>
        我们这边有一份从国内主流招聘平台抓的{" "}
        <Strong>152 条「制造业 × AI 增强」真实 JD</Strong>（来自{" "}
        <PostLink href="https://github.com/LLM-X-Factorer/agent-hunt">
          Agent Hunt 开源数据集
        </PostLink>
        ）。把数据拉出来反推一遍，结论是反共识的：
      </P>

      <Callout tone="ok" title="本文核心观点">
        电气工程师不该硬转 AI 产品经理 / AI 工程师，应该<Strong>留在制造业 + 加 AI 增强技能</Strong>。理由：(1) 留行 JD 数量更多 (152 条 &gt; 制造行业 AI 产品经理 36 条)；(2) 中位薪资 ¥30k 跟互联网 AI PM 中位 ¥32.5k 接近；(3) 你的「制造业 know-how」是有壁垒的资产，扔掉是浪费。
      </Callout>

      <H2>数据先行：制造业 AI 增强 vs 互联网 AI 岗位</H2>

      <DataTable
        headers={["路径", "JD 数量", "薪资中位", "P25-P75", "对你的优势"]}
        rows={[
          ["留行 · 制造业 × AI 增强", 152, "¥30k", "¥20k - ¥45k", "保留制造业 know-how，AI 是加分项"],
          ["转 AI 产品经理（制造业）", 36, "—", "—", "需要补 AI 产品方法论 + 失去制造业身份"],
          ["转 AI/LLM 工程师（制造业）", 57, "—", "—", "需要补 LLM / Agent 工程能力 + 学习曲线陡"],
          ["转 AI 算法（制造业）", "≤ 14", "—", "—", "硕士门槛卡大多数人"],
          ["（对照）互联网 · AI 产品经理全国", 293, "¥32.5k", "¥22.5k - ¥50k", "竞争激烈 + 制造业经验不被识别"],
        ]}
      />

      <P>
        看清楚：制造业 × AI 增强的 JD 数量（152）<Strong>比转 AI 产品经理岗位多 4 倍</Strong>，中位薪资跟互联网 AI PM 几乎一样，而且你的制造业经验是直接派上用场的。
      </P>

      <H2>「留行 + AI 增强」具体长啥样</H2>

      <P>
        从 152 条 JD 里抽样，常见职位标题是这几类：
      </P>

      <Ul>
        <Li>
          <Strong>智能制造 AI 工程师</Strong> — 在原电气 / 自动化框架上接入 LLM / 视觉识别 / Agent 调度
        </Li>
        <Li>
          <Strong>工艺数字化工程师（AI 方向）</Strong> — 用 AI 优化工艺参数 / 预测设备故障
        </Li>
        <Li>
          <Strong>产线智能化解决方案工程师</Strong> — 给传统产线加 AI 视觉 / 大模型辅助决策
        </Li>
        <Li>
          <Strong>设备 AI 运维专家</Strong> — 设备数据 + AI 故障预测，跟 PHM (Prognostics and Health Management) 结合
        </Li>
        <Li>
          <Strong>智能车间架构师</Strong> — 工业互联网 + AI Agent 调度
        </Li>
      </Ul>

      <P>这些岗位的共同特点：</P>

      <Ol>
        <Li>
          <Strong>必备技能依然是制造业核心</Strong> — 电气 / PLC / SCADA / MES / 工业总线（CAN / EtherCAT / Profinet）/ 工艺流程
        </Li>
        <Li>
          <Strong>AI 是加分技能而非主导技能</Strong> — 招聘方要的是「懂制造业 + 会用 AI 工具」，不是「纯 AI 工程师」
        </Li>
        <Li>
          <Strong>需要的 AI 技能门槛不高</Strong> — Prompt Engineering / RAG / Agent / 视觉识别基础（OpenCV 调包级），不要求自己训模型
        </Li>
      </Ol>

      <Callout tone="info" title="对照：要硬转 AI 产品经理需要什么">
        AI PM 的高频技能是：产品设计方法论 / PRD 写作 / 用户增长 / 数据分析 / Prompt Engineering / 跨部门协作。这套体系跟电气工程的硬技能基本不重叠 — 等于从 0 学起，且你 5 年 / 10 年的电气经验在评估时只能算「行业 know-how」加分项，不是主导能力。
      </Callout>

      <H2>怎么开始留行 + AI 增强</H2>

      <H3>Step 1 · 验证你的画像在数据中</H3>

      <P>
        AIJobFit 有个「留行 + AI 增强」诊断路径。填你的原职业（电气工程师 / 自动化工程师 / 工艺工程师 / 硬件工程师 ...），系统会做：
      </P>

      <Ul>
        <Li>从 420 条原职业字典里 fuzzy match 你的填写</Li>
        <Li>给出该原职业 + AI 增强的真实 JD 数量 + 中位薪资</Li>
        <Li>列出 augmentSkills（你应该叠加哪些 AI 技能）</Li>
        <Li>显示 readiness 档位（first-class / mid / starter / no-data 4 档）</Li>
      </Ul>

      <P>
        直接{" "}
        <PostLink href="/diagnose-augment">/diagnose-augment</PostLink>{" "}
        填表 10 分钟出 7 节报告。如果你的填写没匹配上，会给同义近邻 chip 让你换词试试（free-text 解析准确率不到 100%，模糊匹配兜底）。
      </P>

      <H3>Step 2 · 看制造业行业页 + 智能制造角色页</H3>

      <P>有数据偏好的可以直接看 pSEO 切片：</P>

      <Ul>
        <Li>
          <PostLink href="/industry/manufacturing">
            /industry/manufacturing
          </PostLink>{" "}
          — 制造业全行业 AI 增强画像，含 vs 互联网薪资对比
        </Li>
        <Li>
          <PostLink href="/role/smart_manufacturing">
            /role/smart_manufacturing
          </PostLink>{" "}
          — 智能制造 AI 角色聚类详情（技能 / 行业 / 城市 / 学历）
        </Li>
        <Li>
          <PostLink href="/role/ai_engineer">/role/ai_engineer</PostLink> —
          AI/LLM 工程师全国画像（如果你确实想转工程师，这是真转的样子）
        </Li>
      </Ul>

      <H3>Step 3 · AI 技能补齐路径</H3>

      <P>
        从 152 条 JD 里高频出现的「电气工程师应该补的 AI 技能」（按命中频次）：
      </P>

      <DataTable
        headers={["AI 技能", "出现频次", "学习成本", "免费资源"]}
        rows={[
          ["Prompt Engineering", "高", "1-2 周", "Datawhale prompt-engineering-for-developers"],
          ["RAG（检索增强生成）", "中", "2-4 周", "阿里云 ModelScope · LlamaIndex 官方 tutorial"],
          ["AI Agent 基础", "中", "2-4 周", "OpenAI Agents SDK · LangGraph 入门"],
          ["计算机视觉调包级", "中", "1-2 月", "OpenCV 官方 / Ultralytics YOLOv8 docs"],
          ["LLM API 调用 + Function Calling", "中", "1 周", "openai-python / claude-python 官方 quickstart"],
          ["（不要先学）模型训练 / fine-tuning", "低", "—", "招聘需求很少，不是回报最高的方向"],
        ]}
      />

      <Callout tone="warn" title="不要做的事">
        不要花 6 个月去考算法 / 考机器学习 / 啃《深度学习》全本。你的目标不是成为 AI 算法工程师，是成为「能在制造业里用 AI 工具的电气工程师」。Prompt Engineering + RAG + Agent + 调 API 是回报最高的 4 件事。
      </Callout>

      <H3>Step 4 · 在简历上重新表达自己</H3>

      <P>
        152 条 JD 里招聘方期待的画像不是「AI 转型者」，是「懂业务 + 会用 AI 的工程师」。简历优化方向：
      </P>

      <Ul>
        <Li>
          原职责描述加 AI 增强 sub-bullet：「负责 XX 产线 PLC 调试」→「负责 XX 产线 PLC 调试，引入 LLM 辅助故障代码解读，平均故障定位时间从 30min 降到 8min」
        </Li>
        <Li>
          技能列表分两栏：「制造业核心」（PLC / 西门子 S7 / Profinet ...）+「AI 增强」（Prompt Engineering / RAG / OpenCV / Agent ...）
        </Li>
        <Li>
          独立项目栏放 1-2 个「用 AI 解决工厂实际问题」的小项目（哪怕是个人 toy project）
        </Li>
      </Ul>

      <H2>什么情况下应该真转</H2>

      <P>本文不是反对所有「转 AI」。如果你属于以下情况，转才是合理的：</P>

      <Ol>
        <Li>
          <Strong>你已经厌恶制造业本身</Strong>（不只是想加薪），愿意把过去经验沉没成本化
        </Li>
        <Li>
          <Strong>你年龄 &lt; 30 + 单身 + 有 1-2 年补技能时间</Strong>，能承受切换期收入下降
        </Li>
        <Li>
          <Strong>你已经有较强的编程基础</Strong>（C / Python 写得溜），不只是 PLC 梯形图
        </Li>
        <Li>
          <Strong>你有产品 sense + 写作能力</Strong>，能真的做 PM 而不是技术转型沦为初级 BA
        </Li>
      </Ol>

      <P>
        否则，留在制造业 + 加 AI 增强是更优解。你的电气 know-how 是壁垒，AI 工具是杠杆，组合起来比从 0 转 PM 更有效。
      </P>

      <H2>下一步</H2>

      <Ul>
        <Li>
          <PostLink href="/diagnose-augment">
            10 分钟出留行 + AI 增强诊断报告
          </PostLink>
          （永久免费，不收费）
        </Li>
        <Li>
          <PostLink href="/industry/manufacturing">
            看制造业全行业 AI 增强画像
          </PostLink>
        </Li>
        <Li>
          <PostLink href="/blog/8238-jd-dataset-deep-dive">
            数据从哪来 / 怎么聚类 / 边界在哪
          </PostLink>
        </Li>
      </Ul>
    </PostShell>
  );
}
