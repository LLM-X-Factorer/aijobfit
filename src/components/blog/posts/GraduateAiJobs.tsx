import {
  PostShell,
  H2,
  H3,
  P,
  Ul,
  Li,
  Callout,
  DataTable,
  Strong,
  PostLink,
  type PostMeta,
} from "../PostShell";

export const meta: PostMeta = {
  slug: "graduate-ai-jobs",
  title: "应届 AI 求职：14 角色应届友好度排序 + 应届中位 vs 社招中位真实差距",
  excerpt:
    "应届毕业 / 在读学生想做 AI，应该投哪个角色？基于 roles-graduate-friendly.json 切片：14 个 AI 角色按应届友好度排序，应届中位薪资比社招低 30-65%（多数岗位 50% 左右）。算法 / AI 工程师 / 运营是绝对岗位数最多的应届机会，但客服 / 教育 AI / 医疗 AI 应届占比更高。本文给在读 / 应届无实习 / 应届有实习 三类用户一份清晰决策图。",
  publishedAt: "2026-04-30",
  tags: ["应届生", "校招", "实习", "AI 求职", "学生"],
  readMinutes: 11,
};

export default function Post() {
  return (
    <PostShell meta={meta}>
      <P>
        如果你是 26 届 / 27 届 应届毕业 / 在读学生，最近大概率被「AI 应届年薪 30 万」「校招 AI 岗稳赚」类内容冲击。但具体到「我应该投哪个 AI 角色」，主流内容讲不清楚。
      </P>

      <P>
        我们这边有一份从国内主流招聘平台抓的{" "}
        <PostLink href="https://github.com/LLM-X-Factorer/agent-hunt">
          应届友好度切片数据
        </PostLink>
        （roles-graduate-friendly.json，14 角色 × 校招 / 实习 / 应届可投岗位 / 应届中位薪资 / 主战场城市）。把数据拉出来，结论分两层：
      </P>

      <Callout tone="ok" title="本文核心观点">
        <Strong>1.</Strong> 14 角色应届友好度第一名是「智能客服」(score 28)，但全国只有 5 条 JD，绝对岗位数极少。<Strong>真正应届机会大的</Strong>是 ai_engineer (66 应届岗) + algorithm (32 应届岗) + sales_bd (15 应届岗) + operations (18 应届岗)。
        <br /><br />
        <Strong>2.</Strong> 应届中位薪资<Strong>普遍是社招的 50% 左右</Strong>（少数高到 80%）。算法应届 ¥30k vs 社招 ¥52.5k，AI PM 应届 ¥25k vs 社招 ¥32.5k。
      </Callout>

      <H2>14 角色应届友好度全表（按 score 倒序）</H2>

      <DataTable
        headers={[
          "角色",
          "Score",
          "总 JD",
          "校招",
          "实习",
          "应届岗",
          "应届中位",
          "社招中位",
        ]}
        rows={[
          ["智能客服", 28.0, 5, 1, 1, 2, "¥7.5k", "¥25k"],
          ["AI 教育", 8.7, 30, 0, 2, 5, "¥12.5k", "¥20.25k"],
          ["算法 / 研究员", 7.5, 328, 18, 26, 32, "¥30k", "¥52.5k"],
          ["医疗 AI 专岗", 7.1, 14, 0, 2, 2, "¥2.8k", "¥10k"],
          ["AI/LLM 工程师", 6.6, 734, 34, 41, 66, "¥17.5k", "¥32.5k"],
          ["AI 运营 / 训练师", 6.3, 197, 7, 12, 18, "¥11.25k", "¥22.5k"],
          ["AI 销售 / 商务", 4.9, 152, 1, 2, 15, "¥18.75k", "¥22.5k"],
          ["AI 转型咨询", 4.7, 73, 0, 2, 8, "¥12.92k", "¥37.5k"],
          ["AI 风控 / 合规", 4.4, 32, 1, 1, 2, "¥9.75k", "¥27.5k"],
          ["智能制造 AI", 3.0, 83, 0, 1, 6, "¥15.5k", "¥36.5k"],
          ["数据 / 数据科学", 2.3, 82, 1, 1, 3, "¥11.35k", "¥35k"],
          ["AI 管理 / 战略", 2.2, 144, 1, 2, 6, "¥14.5k", "¥57.5k"],
          ["AI 产品经理", 2.1, 439, 5, 5, 13, "¥25k", "¥32.54k"],
          ["自动驾驶 / 智能座舱", 1.9, 101, 1, 1, 3, "¥15k", "¥27.5k"],
        ]}
      />

      <Callout tone="info" title="应届友好度怎么算">
        Score = (校招 + 实习 + 应届可投) / 总 JD × 100。Score 高 = 应届岗位占比高。但要结合「绝对岗位数」一起看 — score 28 但只有 2 个应届岗（智能客服）vs score 6.6 但有 66 个应届岗（AI 工程师），后者机会显然更大。
      </Callout>

      <H2>三类应届用户的决策路径</H2>

      <H3>类型 1 · 在读学生（大三 / 研一 / 研二）</H3>

      <P>
        优先目标：抢实习机会 + 沉淀作品。看实习数最多的角色：
      </P>

      <Ul>
        <Li>
          <Strong>AI/LLM 工程师 41 条实习</Strong>：要求 CS / 软件工程背景 + Python + LLM API 基础经验。能拿到大厂实习 = 简历金字招牌
        </Li>
        <Li>
          <Strong>算法 / 研究员 26 条实习</Strong>：要求硕士在读 + 机器学习 / 深度学习背景 + Kaggle / 论文经历。门槛高但产出转化率最高
        </Li>
        <Li>
          <Strong>AI 运营 / 训练师 12 条实习</Strong>：非技术背景能投，要求 Prompt + Coze / Dify + 数据分析 + 内容运营。门槛低，对非 CS 应届友好
        </Li>
        <Li>
          <Strong>AI/LLM 工程师 + 算法 = 67 条实习</Strong>占大半技术岗实习池子，CS 在读应届优先抢这两个
        </Li>
      </Ul>

      <P>
        实操建议：
      </P>

      <Ul>
        <Li>多投实习是回报最高的事（offer 转化率比纯校招高 2-3 倍）</Li>
        <Li>不要等到大四才开始投，大三暑期实习 = 进大厂校招的捷径</Li>
        <Li>实习期间一定要做 1-2 个独立 owner 的项目，能写进简历</Li>
      </Ul>

      <H3>类型 2 · 应届无实习（毕业但没工作过）</H3>

      <P>
        没有实习经历相对劣势。优先目标：(1) 投门槛较低的应届岗位；(2) 接受比互联网首选岗位低 30%-50% 薪资换入行机会。
      </P>

      <Ul>
        <Li>
          <Strong>AI 销售 / 商务 15 条应届岗 ¥18.75k</Strong>：应届岗位绝对数前 3，对非 CS 背景友好。这是最被低估的应届入行赛道
        </Li>
        <Li>
          <Strong>AI 运营 / 训练师 18 条应届 ¥11.25k</Strong>：薪资低但岗位多，给了入行 + 1-2 年后跳槽的窗口期
        </Li>
        <Li>
          <Strong>AI 教育 5 条应届 ¥12.5k</Strong>：应届友好度全国第二（score 8.7），适合教育学 / 师范 / 心理学背景
        </Li>
        <Li>
          <Strong>AI 转型咨询 8 条应届 ¥12.9k</Strong>：薪资跟社招差 65%，社招是 ¥37.5k。但应届能进咨询轨道是稀缺机会
        </Li>
      </Ul>

      <H3>类型 3 · 应届有实习</H3>

      <P>
        最强势的应届画像。实习经历直接对标社招初级岗位，校招 offer 难度 / 薪资水位都接近社招。重点：
      </P>

      <Ul>
        <Li>
          <Strong>瞄准你实习公司的同岗位社招线</Strong>：转正 / 同公司其他岗位优先
        </Li>
        <Li>
          <Strong>用实习经历跨投高门槛岗位</Strong>：算法 32 应届 ¥30k 这种，没实习几乎进不去
        </Li>
        <Li>
          <Strong>不接受应届中位以下的报价</Strong>：你的实习经历给了你议价权
        </Li>
      </Ul>

      <H2>关键观察 · 应届 vs 社招中位差距</H2>

      <P>
        从表里看 14 角色的 (社招中位 - 应届中位) / 社招中位 比例：
      </P>

      <DataTable
        headers={["差距 %", "角色（薪资差最大的几个）"]}
        rows={[
          ["差距 ≥ 60%", "智能客服 (-70%) / AI 转型咨询 (-65%) / 医疗 AI (-72%) / AI 管理战略 (-75%)"],
          ["差距 50%-60%", "AI/LLM 工程师 (-46%) / 算法 (-43%) / AI 运营 (-50%) / 自动驾驶 (-45%)"],
          ["差距 30%-40%", "AI PM (-23%) / AI 销售 (-17%) / AI 教育 (-38%)"],
          ["差距 ≤ 20%", "AI 销售 / 商务 (-17%, 最小)"],
        ]}
      />

      <Callout tone="info" title="想薪资差距小？看 AI 销售 / AI PM">
        如果你最关心「应届入职薪资别太低」，AI 销售 / AI PM / AI 工程师 三个角色应届 vs 社招差距相对较小（17%-46%）。AI 销售应届 ¥18.75k vs 社招 ¥22.5k，只差 17% — 是所有 AI 角色里应届性价比最高的。
      </Callout>

      <H2>校招主战场城市</H2>

      <P>
        roles-graduate-friendly 数据里有 topCampusCities 字段。各角色的应届主战场：
      </P>

      <Ul>
        <Li>
          <Strong>AI/LLM 工程师 + 算法</Strong>：北京 / 上海 / 深圳 / 杭州（互联网大厂集中）
        </Li>
        <Li>
          <Strong>AI 产品经理</Strong>：北京 / 上海 / 深圳（一线为主）
        </Li>
        <Li>
          <Strong>AI 运营 / 训练师 + AI 销售</Strong>：北京 / 上海 / 深圳 / 杭州 / 广州（覆盖更广）
        </Li>
        <Li>
          <Strong>智能制造 AI</Strong>：苏州 / 上海 / 深圳 / 北京（产业链集中）
        </Li>
        <Li>
          <Strong>AI 教育</Strong>：北京 / 西安 / 深圳-南山区（K12 集中）
        </Li>
      </Ul>

      <H2>下一步</H2>

      <Ul>
        <Li>
          <PostLink href="/diagnose">
            /diagnose 系统推荐
          </PostLink>{" "}
          填表时 yearsExp 选「在读学生 / 应届无实习 / 应届有实习」三选一，报告自动切应届口径
        </Li>
        <Li>
          <PostLink href="/role/ai_engineer">
            /role/ai_engineer
          </PostLink>{" "}
          看 AI 工程师全国画像（66 应届岗）
        </Li>
        <Li>
          <PostLink href="/role/algorithm">
            /role/algorithm
          </PostLink>{" "}
          看算法工程师全国画像（32 应届岗）
        </Li>
        <Li>
          <PostLink href="/role/sales_bd">
            /role/sales_bd
          </PostLink>{" "}
          看 AI 销售全国画像（应届性价比最高）
        </Li>
      </Ul>
    </PostShell>
  );
}
