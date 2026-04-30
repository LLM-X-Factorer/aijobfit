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
  slug: "teacher-to-ai-education",
  title: "教师不该硬转 AI 工程师：教育行业 60+ 条 AI 增强 JD 拆出来的留行路径",
  excerpt:
    "教师转 AI 教育的主流路径是「学 Python + 做大模型应用」。我们用 60+ 条国内教育行业 × AI 真实 JD 反推：教育行业 AI 工程师只有 6 条 JD ¥18.75k，反而 AI 管理/战略 21 条 ¥33.75k、教育 AI 专岗 20 条、应届友好度全国第二。教师该看的是这三条留行路径，不是硬转编码。",
  publishedAt: "2026-04-30",
  tags: ["教师", "教育 AI", "留行 + AI 增强", "K12", "AIGC 课件", "应届"],
  readMinutes: 10,
};

export default function Post() {
  return (
    <PostShell meta={meta}>
      <P>
        如果你是 K12 老师 / 高校讲师 / 教研员 / 培训师 / 辅导员，最近大概率被「教师转 AI」类内容推荐过。主流话术是：
      </P>

      <Quote>
        2026 教师转 AI 的最佳路径 / 学 Python + LLM API + 做教育 Agent / 三个月转型 AI 教育产品经理 ...
      </Quote>

      <P>
        我们这边有一份从国内主流招聘平台抓的{" "}
        <PostLink href="/industry/education">
          60+ 条「教育行业 × AI 增强」真实 JD
        </PostLink>
        （来自{" "}
        <PostLink href="https://github.com/LLM-X-Factorer/agent-hunt">
          Agent Hunt 开源数据集
        </PostLink>
        ）。把数据拉出来反推一遍，结论是反共识的：
      </P>

      <Callout tone="ok" title="本文核心观点">
        教师不该硬转 AI/LLM 工程师（教育行业里只有 6 条 JD · 中位 ¥18.75k）。<Strong>3 条更稳的留行路径</Strong>：(1) 走「AI 管理 / 战略」(21 条 · ¥33.75k)；(2) 走「教育 AI 专岗」（20 条 · 应届友好度全国第二）；(3) 留在教学岗 + 加 AIGC 课件 / RAG 知识库 / 智能批改 工具技能。
      </Callout>

      <H2>数据先行：教育行业 × AI 真实分布</H2>

      <DataTable
        headers={["角色", "JD 数量", "薪资中位", "样本量", "主战场城市"]}
        rows={[
          ["AI 管理 / 战略 (leadership)", 21, "¥33.75k", 20, "西安 / 北京 / 北京-海淀区"],
          ["AI 教育专岗 (education_ai)", 20, "¥13.25k", 20, "西安 / 北京-大兴区 / 深圳-南山区"],
          ["AI 产品经理", 8, "¥31.25k", 8, "上海-徐汇区 / 沈阳·和平区 / 廊坊·三河市"],
          ["AI/LLM 工程师", 6, "¥18.75k", 6, "Beijing / 重庆-南岸区 / Shenzhen"],
          ["AI 运营 / 训练师", 6, "¥15.25k", 6, "武汉-洪山区 / Shenzhen / 广州"],
          ["AI 销售 / 商务", 5, "¥17.5k", 5, "广州-黄埔区 / 北京 / 郑州-中原区"],
        ]}
      />

      <Callout tone="warn" title="先看清「AI 教育专岗 ¥13.25k」是什么">
        20 条 JD 中位仅 ¥13.25k，比 AI 管理 / 战略低近 3 倍，比互联网 AI PM 中位 ¥35k 低近 3 倍。这反映的是教育行业整体薪资 ceiling 偏低，不是「AI 教育」赛道不好 — 是「在教育公司做 AI 教育」赛道整体偏低。
      </Callout>

      <H2>三条留行路径详解</H2>

      <H3>路径 1 · AI 管理 / 战略（最高薪 · 最稳）</H3>

      <P>
        教育行业里 AI 管理 / 战略 21 条 JD，中位 ¥33.75k — 是教育行业里所有 AI 角色中薪资最高的。但门槛也最高：
      </P>

      <Ul>
        <Li>
          <Strong>5+ 年教育行业经验</Strong>是基本门槛。如果你是教研主任 / 学科主任 / 校长助理 / 培训机构 BD 总监，画像最匹配
        </Li>
        <Li>
          需要懂「AI 怎么改造教学流程」（不是写代码），而不是「AI 算法长什么样」
        </Li>
        <Li>
          能跟管理层 / 投资人 / 教育局对话，能写战略提案 / 转型方案
        </Li>
      </Ul>

      <P>
        看{" "}
        <PostLink href="/industry/education/leadership">
          /industry/education/leadership
        </PostLink>{" "}
        二维切片页拿真实城市分布 + sample titles。
      </P>

      <H3>路径 2 · AI 教育专岗（应届友好度全国第二）</H3>

      <P>
        如果你是应届毕业 / 在读 / 想跨入这个领域且没经验，AI 教育专岗（education_ai）是切入门槛最低的：
      </P>

      <DataTable
        headers={["指标", "AI 教育专岗", "对比 · 全国 14 角色排序"]}
        rows={[
          ["应届友好度 score", "8.7", "全国第 2（仅次于客服 28，但客服只有 5 条 JD 基数太小）"],
          ["全国总 JD", "30", "—"],
          ["实习岗", "2", "对应届 / 在读非常友好"],
          ["应届可投岗", "5", "—"],
          ["应届薪资中位", "¥12.5k", "—"],
          ["社招薪资中位", "¥20.25k", "—"],
        ]}
      />

      <Callout tone="info" title="应届友好度怎么算">
        agent-hunt 把 14 角色聚类按「校招 + 实习 + 应届可投岗位 / 总 JD」算应届友好度 score。score 高 = 应届岗位占比高 = 入行门槛低。但要注意：score 高的角色未必绝对岗位多（比如客服只有 5 条），需要结合 totalJobs 看。
      </Callout>

      <P>
        看{" "}
        <PostLink href="/industry/education/education_ai">
          /industry/education/education_ai
        </PostLink>{" "}
        二维切片 + 应届口径数据。
      </P>

      <H3>路径 3 · 留在教学岗 + 加 AIGC 课件 / RAG 知识库 / 智能批改</H3>

      <P>
        如果你不想离开教学一线（这是大多数老师的真实情况），最稳的做法是：
      </P>

      <Ol>
        <Li>
          <Strong>不换岗位，加 AI 工具技能</Strong>，让自己在原岗位上效率提升 + 在内部评职称 / 晋升时多一项资本
        </Li>
        <Li>该学的 AI 技能（按 ROI 排序）：
          <Ul>
            <Li>
              <Strong>AIGC 课件生成</Strong>：豆包 / 文心 / Claude / GPT-4o + 通义万相 / 即梦 / Sora，省 80% 备课时间
            </Li>
            <Li>
              <Strong>RAG 知识库</Strong>：把自己的备课资料 / 学科教材 / 考试资料 build 成可检索知识库（学 Coze / Dify 即可，免编程）
            </Li>
            <Li>
              <Strong>智能批改</Strong>：作业 / 作文 / 试卷 → AI 初批 + 你复核，从 4 小时压到 30 分钟
            </Li>
            <Li>
              <Strong>个性化学习路径</Strong>：根据学生做题数据，AI 推荐复习重点
            </Li>
          </Ul>
        </Li>
        <Li>
          <Strong>不要花时间学 Python / LangChain / 模型 fine-tuning</Strong>。这些不是教师 ROI 最高的方向。
        </Li>
      </Ol>

      <P>
        AIJobFit 的「留行 + AI 增强」诊断会让你填具体的教学岗位（K12 数学老师 / 高校讲师 / 教研主任 / ...），从 420 条原职业字典里 fuzzy match，给出准备度档位 + augmentSkills 优先级。直接走{" "}
        <PostLink href="/diagnose-augment">/diagnose-augment</PostLink>{" "}
        填表 10 分钟出报告。
      </P>

      <H2>什么时候应该硬转 AI 工程师</H2>

      <P>本文不是反对所有「转」。如果你属于以下情况，硬转 AI 工程师才是合理的：</P>

      <Ul>
        <Li>
          <Strong>你是 CS 背景</Strong>转去做老师（少数情况），原代码能力没退化
        </Li>
        <Li>
          <Strong>你已经厌恶教育行业本身</Strong>（不只是想加薪），愿意把过往经验沉没成本化
        </Li>
        <Li>
          <Strong>你有 1-2 年补技能时间</Strong>，能承受切换期收入下降
        </Li>
      </Ul>

      <P>
        否则，留在教育行业 + 上面 3 条路径是更优解。教师的「学科 know-how + 教学 know-how」是有壁垒的资产，扔掉是浪费。
      </P>

      <H2>下一步</H2>

      <Ul>
        <Li>
          <PostLink href="/industry/education">
            /industry/education
          </PostLink>{" "}
          看教育行业全景 + 12 行业薪资对比
        </Li>
        <Li>
          <PostLink href="/diagnose-augment">
            10 分钟出留行 + AI 增强诊断报告
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
