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
  slug: "sales-to-ai-sales",
  title: "销售转 AI 销售不要全押互联网：跨 5 个行业 150+ 条真实 JD 拆解",
  excerpt:
    "「销售转 AI 销售」类内容默认推荐你跳互联网。但 150+ 条国内 AI 销售 / 商务真实 JD 显示：互联网 92 条 ¥22.5k 不见得最香 — 制造 / 医疗 / 教育 / 汽车 行业的 AI 销售岗位虽然少，但你的原行业关系网是壁垒。本文给销售一份反共识地图。",
  publishedAt: "2026-04-30",
  tags: ["销售", "AI 销售", "BD", "跨行业", "转行 + 留行"],
  readMinutes: 8,
};

export default function Post() {
  return (
    <PostShell meta={meta}>
      <P>
        如果你是 toB 销售 / 大客户销售 / SDR / BD / 渠道经理，最近大概率被「销售转 AI 销售」类内容轰炸。主流话术是：
      </P>

      <Quote>
        AI SaaS 是销售下一个金矿 / 转互联网 AI 公司 / AI 销售 ¥30k 起步 ...
      </Quote>

      <P>
        我们这边有一份从国内主流招聘平台抓的{" "}
        <PostLink href="/role/sales_bd">
          150+ 条「AI 销售 / 商务」真实 JD
        </PostLink>
        （来自{" "}
        <PostLink href="https://github.com/LLM-X-Factorer/agent-hunt">
          Agent Hunt 开源数据集
        </PostLink>
        ）。把数据按行业拆开后，结论很反共识：
      </P>

      <Callout tone="ok" title="本文核心观点">
        销售不该默认跳互联网做 AI 销售。<Strong>5 个行业的 AI 销售岗位真实分布</Strong>差异巨大，你的原行业关系网是壁垒 — 「制造业老销售 + 智能制造 AI 厂商」的卖法跟互联网 AI SaaS 完全不同，前者大概率比后者更稳。
      </Callout>

      <H2>数据先行：AI 销售跨 5 大行业分布</H2>

      <DataTable
        headers={["行业", "AI 销售 JD", "薪资中位", "样本量", "主战场城市"]}
        rows={[
          ["互联网", 92, "¥22.5k", 69, "上海 / 北京 / 深圳"],
          ["医疗", 20, "¥20k", 20, "北京 / 深圳 / 太原"],
          ["制造", 7, "¥20k", 5, "Shanghai 松江 / 上海-浦东 / 淮安"],
          ["教育", 5, "¥17.5k", 5, "广州-黄埔区 / 北京 / 郑州-中原区"],
          ["汽车", 2, "¥60k", 2, "上海-浦东 / Shanghai Pudong"],
          ["媒体", 1, "¥22.5k", 1, "Chongqing 南安"],
        ]}
      />

      <Callout tone="warn" title="样本量陷阱">
        汽车行业 AI 销售只有 2 条 JD 但中位 ¥60k — 这是统计噪声，2 条样本不能代表整个赛道。但能反映一个信号：当数据足够时，传统行业 AI 销售薪资可能不输甚至高于互联网。
      </Callout>

      <H2>4 条决策路径</H2>

      <H3>路径 A · 互联网 AI 销售（流量大但卷）</H3>

      <P>
        互联网赛道 92 条 JD 是市场最大池子。适合的画像：
      </P>

      <Ul>
        <Li>已经在互联网 / SaaS 行业做过 1-3 年销售</Li>
        <Li>愿意做高速迭代 + 高 KPI 压力的工作</Li>
        <Li>熟悉中小客户 + 自助型获客（DSR / 私域 / 抖音获客）</Li>
      </Ul>

      <P>
        典型岗位：AI 销售、AI 客户成功、AI Customer Acquisition / Private Domain Traffic Generation 等。看{" "}
        <PostLink href="/industry/internet/sales_bd">
          /industry/internet/sales_bd
        </PostLink>{" "}
        二维切片拿真实城市 + 公司样本。
      </P>

      <H3>路径 B · 医疗 AI 销售（垂直 know-how 壁垒）</H3>

      <P>
        医疗赛道 20 条 JD · ¥20k。优势：
      </P>

      <Ul>
        <Li>你的医院关系网 / 药代经验 / 医疗器械渠道是稀缺壁垒</Li>
        <Li>互联网 AI 销售里懂医疗合规 / DRG 付费 / 医院采购流程的少</Li>
        <Li>客户决策周期长（医院招采 6-12 个月），但成交客单价高</Li>
      </Ul>

      <P>
        看{" "}
        <PostLink href="/industry/healthcare/sales_bd">
          /industry/healthcare/sales_bd
        </PostLink>
        。详细的医疗 + AI 路径还可以看{" "}
        <PostLink href="/blog/doctor-medical-ai">
          医生 + 医疗 AI 真相
        </PostLink>{" "}
        那篇里的 AI 销售路径分析。
      </P>

      <H3>路径 C · 制造 / 智能制造 AI 销售</H3>

      <P>
        制造行业只有 7 条但中位 ¥20k。适合：
      </P>

      <Ul>
        <Li>原制造业销售（机床 / 自动化设备 / 工业软件 / 电子元器件）</Li>
        <Li>懂 PLC / SCADA / MES 这些工业基础设施的语言</Li>
        <Li>有车间 / 产线 / 工厂厂长级别的客户关系</Li>
      </Ul>

      <P>
        看{" "}
        <PostLink href="/industry/manufacturing/sales_bd">
          /industry/manufacturing/sales_bd
        </PostLink>
        ，也可以读{" "}
        <PostLink href="/blog/electrical-engineer-to-ai">
          电气工程师转 AI 拆解
        </PostLink>{" "}
        那篇了解制造业 × AI 整体生态。
      </P>

      <H3>路径 D · 留行 + AI 工具增强</H3>

      <P>
        如果你不想换公司 / 换行业，留在原销售岗 + 加 AI 工具技能也是合理路径。该学的：
      </P>

      <Ol>
        <Li>
          <Strong>客户研究 + 提案生成</Strong>：用 GPT-4o / Claude / 文心查客户公司财报 / 行业研报，生成定制化提案（节省 50%+ 准备时间）
        </Li>
        <Li>
          <Strong>邮件 / 微信沟通</Strong>：AI 改写销售话术 / 跟进邮件 / 客户问题回复
        </Li>
        <Li>
          <Strong>CRM + AI 数据分析</Strong>：用 AI 跑 CRM 数据找高潜客户 / 流失预警 / 续约率分析
        </Li>
        <Li>
          <Strong>客户教育内容</Strong>：批量生成产品科普 / 行业洞察 / 私域内容
        </Li>
      </Ol>

      <P>
        看{" "}
        <PostLink href="/diagnose-augment">/diagnose-augment</PostLink>{" "}
        填表 → 系统从 420 条原职业字典里 fuzzy match「销售经理 / BD / 渠道 / SDR / 大客户 ...」给出准备度档位 + 该补的 AI 工具技能优先级。
      </P>

      <H2>选择决策表</H2>

      <DataTable
        headers={["你的画像", "推荐路径"]}
        rows={[
          ["互联网 / SaaS 销售 1-3 年，没特定行业 know-how", "路径 A · 互联网"],
          ["医院 / 药代 / 医疗器械销售有 KOL 关系", "路径 B · 医疗"],
          ["制造业销售 (机床 / PLC / 工业软件) 5+ 年", "路径 C · 制造"],
          ["传统快消 / 零售 / 政企销售，行业关系网在原行业", "路径 D · 留行 + AI 工具"],
          ["不想换工作 + 想加薪 + 加资本", "路径 D · 留行 + AI 工具"],
          ["新手 / 跨行业转销售", "路径 A · 互联网（最大池子，最容易上岸）"],
        ]}
      />

      <H2>下一步</H2>

      <Ul>
        <Li>
          <PostLink href="/role/sales_bd">
            /role/sales_bd
          </PostLink>{" "}
          看 AI 销售全国画像（118 条 JD · 含技能 / 学历要求 / 公司样本）
        </Li>
        <Li>
          <PostLink href="/diagnose-target">
            /diagnose-target 转行 Gap 诊断
          </PostLink>{" "}
          锁定行业 + AI 销售 → 算匹配率 + Gap
        </Li>
        <Li>
          <PostLink href="/diagnose-augment">
            /diagnose-augment 留行 + AI 增强
          </PostLink>{" "}
          填原销售岗位 → 看 AI 工具优先级
        </Li>
      </Ul>
    </PostShell>
  );
}
