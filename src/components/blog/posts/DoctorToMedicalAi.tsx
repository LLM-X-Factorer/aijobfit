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
  slug: "doctor-medical-ai",
  title: "医生 + 医疗 AI 真相：医疗 AI 专岗只有 9 条 JD ¥10k，比你想的难",
  excerpt:
    "「医生转医疗 AI」类内容铺天盖地。我们用 100+ 条国内医疗行业 × AI 真实 JD 反推：医疗 AI 专岗在国内只有 9 条 JD · 中位 ¥10k（应届甚至 ¥2800/月），AI 销售 / AI 工程师 / AI 管理 / AI PM 这几条路径反而更稳。本文给医生 / 护士 / 药师 / 医院信息岗一份反共识地图。",
  publishedAt: "2026-04-30",
  tags: ["医生", "医疗 AI", "留行 + AI 增强", "护士", "药师", "医院信息"],
  readMinutes: 9,
};

export default function Post() {
  return (
    <PostShell meta={meta}>
      <P>
        如果你是医生 / 护士 / 药师 / 临床研究员 / 医院信息科人员，最近大概率被「医生转医疗 AI」类内容轰炸过。主流话术是：
      </P>

      <Quote>
        医疗 AI 是下一个万亿赛道 / 医生转 AI 工程师高薪起跳 / 三个月学完 PyTorch 转医学影像 ...
      </Quote>

      <P>
        我们这边有一份从国内主流招聘平台抓的{" "}
        <PostLink href="/industry/healthcare">
          100+ 条「医疗行业 × AI 增强」真实 JD
        </PostLink>
        （来自{" "}
        <PostLink href="https://github.com/LLM-X-Factorer/agent-hunt">
          Agent Hunt 开源数据集
        </PostLink>
        ）。把数据拉出来反推一遍，结论很反共识：
      </P>

      <Callout tone="warn" title="本文核心观点">
        国内「医疗 AI 专岗」（medical_ai role）<Strong>只有 9 条真实 JD · 中位 ¥10k</Strong>（roles-graduate-friendly 数据中应届中位甚至只有 ¥2800/月）。这是赛道还没真正起量的信号。但医疗行业里的<Strong>其他 AI 角色</Strong>（ai_engineer 26 条 ¥27k / sales_bd 20 条 ¥20k / leadership 16 条 ¥65k / pm 14 条 ¥38.75k）反而是更稳的路径。
      </Callout>

      <H2>数据先行：医疗行业 × AI 真实分布</H2>

      <DataTable
        headers={["角色", "JD 数量", "薪资中位", "样本量", "主战场城市"]}
        rows={[
          ["AI/LLM 工程师", 26, "¥27k", 25, "上海 / 北京 / Guangzhou"],
          ["AI 销售 / 商务", 20, "¥20k", 20, "北京 / 深圳 / 太原"],
          ["AI 管理 / 战略", 16, "¥65k", 15, "上海 / 上海-浦东新区 / 武汉-武昌区"],
          ["算法 / 研究员", 14, "¥55k", 9, "上海-浦东新区 / 上海 / 北京"],
          ["AI 产品经理", 14, "¥38.75k", 12, "北京 / 深圳 / 上海-浦东新区"],
          ["医疗 AI 专岗", 9, "¥10k", 9, "杭州-上城区 / 咸阳·秦都区 / 深圳-南山区"],
          ["AI 转型 / 咨询", 4, "¥36.25k", 4, "武汉 / 上海-青浦区 / 广州-黄埔区"],
        ]}
      />

      <Callout tone="info" title="医疗 AI 专岗 ¥10k 是什么">
        9 条 JD 的样本量本来就稀薄，加上「医疗 AI 专岗」这个分类涵盖了护理智能化助手 / 医院 AI 助手 / 病历智能化录入 等偏运营型岗位（不是医学影像算法 / 病理 AI 那种高薪研发岗）。后者在 algorithm 桶里，14 条 JD ¥55k，但需要 CS 硕士 + 医学影像 / 信号处理科研经验 — 普通医生卡门槛卡得很厉害。
      </Callout>

      <H2>四条比「转医疗 AI 专岗」更稳的路径</H2>

      <H3>路径 1 · 留行 + AI 工具改造日常诊疗（推荐 90% 医生）</H3>

      <P>
        最稳、ROI 最高、没有切换成本的路径：保留医师 / 护师 / 药师身份，用 AI 工具改造日常工作。
      </P>

      <Ul>
        <Li>
          <Strong>临床决策支持</Strong>：用 GPT-4o / Claude / 文心一言 4.0 辅助查文献 / 鉴别诊断 / 用药参考（用药警示用专业系统，AI 只做初筛）
        </Li>
        <Li>
          <Strong>病历智能录入</Strong>：语音转文字 + LLM 结构化（飞书妙记 / 通义听悟 / 讯飞医生版）
        </Li>
        <Li>
          <Strong>患者教育材料生成</Strong>：把术前注意事项 / 慢病管理科普 用 AI 批量生成 + 个性化
        </Li>
        <Li>
          <Strong>RAG 知识库</Strong>：把自己科室的临床路径 / SOP / 既往病例 build 成可检索知识库（用 Coze / Dify 即可）
        </Li>
      </Ul>

      <Callout tone="ok" title="这条路径不需要换岗">
        这些都是「在医院里用」的工具，不需要你辞职。在医院内部评医师晋升 / 主任医师评定时，「AI 临床应用研究」也是加分项。许多三甲医院在卷这块，先动手的医生有 first-mover 优势。
      </Callout>

      <H3>路径 2 · 转医疗行业 AI 销售 / 商务</H3>

      <P>
        医疗行业 AI 销售 / BD 20 条 JD · 中位 ¥20k。如果你有以下画像，匹配度高：
      </P>

      <Ul>
        <Li>临床医生背景，懂医院采购流程</Li>
        <Li>药代 / 医疗器械销售经验，已有 KOL 关系</Li>
        <Li>愿意做 B 端，不抗拒 KPI 压力</Li>
      </Ul>

      <P>
        优势：你的医学背景 + 医院关系网在 AI 销售里是稀缺壁垒（互联网 AI 销售 92 条但都是泛 SaaS 卖法，懂医疗的少）。
      </P>

      <H3>路径 3 · 转医疗 AI 产品经理（适合 5+ 年临床 + 想做产品）</H3>

      <P>
        医疗行业 AI 产品经理 14 条 · 中位 ¥38.75k。门槛：
      </P>

      <Ul>
        <Li>5+ 年临床经验（懂诊疗工作流是核心壁垒）</Li>
        <Li>能写 PRD（这是软实力，需要补）</Li>
        <Li>能跟工程师对话（不需要写代码，需要懂产品边界）</Li>
      </Ul>

      <P>
        看{" "}
        <PostLink href="/industry/healthcare/product_manager">
          /industry/healthcare/product_manager
        </PostLink>{" "}
        二维切片拿真实城市分布 + 公司样本。
      </P>

      <H3>路径 4 · 走医疗 AI 管理 / 战略（最高薪，门槛最高）</H3>

      <P>
        医疗行业 AI 管理 / 战略 16 条 · 中位 ¥65k — 是医疗行业里 AI 角色最高薪。但门槛：
      </P>

      <Ul>
        <Li>院级管理经验（科主任 / 副院长 / 信息中心负责人）</Li>
        <Li>医疗集团数字化转型经验</Li>
        <Li>能跟卫健委 / 医院管理层 / AI 厂商三方对话</Li>
      </Ul>

      <P>
        这条路径不适合普通临床医生，但适合医院信息科 / 医疗集团 IT 负责人 / 医务科主任。
      </P>

      <H2>为什么不该硬转「医疗 AI 专岗」</H2>

      <Ol>
        <Li>
          <Strong>样本太薄</Strong>：9 条 JD 在国内全市场（不是局部城市）— 一个医生候选人面试 9 次基本就把市面上的岗位面完了
        </Li>
        <Li>
          <Strong>薪资低</Strong>：¥10k 中位，应届 ¥2800/月。这反映的是市场需求 + 供给不平衡：很多医学背景的人都想转，但岗位开得少
        </Li>
        <Li>
          <Strong>需求结构</Strong>：真正高薪的医疗 AI 工作藏在 ai_engineer / algorithm / leadership 这些角色里，需要 CS 硕士 + 医学背景双重才能上
        </Li>
        <Li>
          <Strong>沉没成本</Strong>：医生职业的核心壁垒是临床判断 + 患者关系。转到边缘 AI 岗等于把这两个核心壁垒废掉
        </Li>
      </Ol>

      <H2>下一步</H2>

      <Ul>
        <Li>
          <PostLink href="/industry/healthcare">
            /industry/healthcare
          </PostLink>{" "}
          看医疗行业全景 + 7 个角色完整分布
        </Li>
        <Li>
          <PostLink href="/role/medical_ai">
            /role/medical_ai
          </PostLink>{" "}
          单独看「医疗 AI 专岗」全国画像
        </Li>
        <Li>
          <PostLink href="/diagnose-augment">
            10 分钟出留行 + AI 增强诊断报告
          </PostLink>
          （填「医生 / 护士 / 药师 / 医院信息」从 420 条原职业字典 fuzzy match）
        </Li>
      </Ul>
    </PostShell>
  );
}
