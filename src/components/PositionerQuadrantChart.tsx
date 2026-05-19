// 纯 SVG 2x2 象限图，高亮当前象限。
// 横轴 = 位置清晰度（左模糊 / 右清晰）
// 纵轴 = 能力底子（下弱 / 上强）
// 第四象限单独配色（amber 警示），避免与「方向已对」混淆。

import { QuadrantContent, QuadrantId } from "@/lib/positioner";

const W = 320;
const H = 320;
const PAD = 40;
const MID_X = W / 2;
const MID_Y = H / 2;

const Q_RECTS: Record<
  QuadrantId,
  { x: number; y: number; w: number; h: number; label: string; sub: string }
> = {
  Q1: {
    x: MID_X,
    y: PAD,
    w: W - MID_X - PAD,
    h: MID_Y - PAD,
    label: "Q1",
    sub: "方向已对",
  },
  Q2: {
    x: PAD,
    y: PAD,
    w: MID_X - PAD,
    h: MID_Y - PAD,
    label: "Q2",
    sub: "有底子缺位置",
  },
  Q3: {
    x: PAD,
    y: MID_Y,
    w: MID_X - PAD,
    h: H - MID_Y - PAD,
    label: "Q3",
    sub: "补认知框架",
  },
  Q4: {
    x: MID_X,
    y: MID_Y,
    w: W - MID_X - PAD,
    h: H - MID_Y - PAD,
    label: "Q4",
    sub: "先停下来",
  },
};

export default function PositionerQuadrantChart({
  active,
}: {
  active: QuadrantContent;
}) {
  const isQ4 = active.id === "Q4";
  const activeFill = isQ4 ? "#FEF3C7" : "#DBEAFE";
  const activeStroke = isQ4 ? "#D97706" : "#2563EB";
  const activeText = isQ4 ? "#92400E" : "#1E40AF";

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`位置诊断结果：${active.name}`}
      className="max-w-sm mx-auto"
    >
      {(Object.keys(Q_RECTS) as QuadrantId[]).map((qid) => {
        const r = Q_RECTS[qid];
        const isActive = qid === active.id;
        return (
          <g key={qid}>
            <rect
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              fill={isActive ? activeFill : "#F8FAFC"}
              stroke={isActive ? activeStroke : "#E2E8F0"}
              strokeWidth={isActive ? 3 : 1.5}
              rx={6}
            />
            <text
              x={r.x + r.w / 2}
              y={r.y + r.h / 2 - 6}
              textAnchor="middle"
              fontSize={20}
              fontWeight={700}
              fill={isActive ? activeText : "#94A3B8"}
            >
              {r.label}
            </text>
            <text
              x={r.x + r.w / 2}
              y={r.y + r.h / 2 + 16}
              textAnchor="middle"
              fontSize={11}
              fill={isActive ? activeText : "#94A3B8"}
            >
              {r.sub}
            </text>
          </g>
        );
      })}

      <text
        x={PAD - 8}
        y={MID_Y + 4}
        textAnchor="end"
        fontSize={10}
        fill="#64748B"
      >
        位置 ←
      </text>
      <text
        x={W - PAD + 8}
        y={MID_Y + 4}
        textAnchor="start"
        fontSize={10}
        fill="#64748B"
      >
        → 位置
      </text>
      <text
        x={MID_X}
        y={PAD - 14}
        textAnchor="middle"
        fontSize={10}
        fill="#64748B"
      >
        ↑ 能力强
      </text>
      <text
        x={MID_X}
        y={H - PAD + 22}
        textAnchor="middle"
        fontSize={10}
        fill="#64748B"
      >
        能力弱 ↓
      </text>
    </svg>
  );
}
