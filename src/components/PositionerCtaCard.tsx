"use client";

// 4 象限报告页 CTA 卡片。
// 加微入口（具体微信号 / 群二维码 / 跳转链接）由流量团队提供，目前用占位 div。
// 复用现有 AssistantQR 也可以——但业务上是「点头就业班私域」，与 aijobfit
// 自己的激活码漏斗是两套渠道，所以单独画一个占位，避免共用静态资源被业务方误改。

import Image from "next/image";
import { track } from "@/lib/track";
import { CtaAction, QuadrantContent, QuadrantId } from "@/lib/positioner";

const ACTION_DESC: Record<CtaAction, string> = {
  joinClass: "扫码加点头就业班入口 · 报名 V8",
  previewClass: "扫码预约 45 分钟公开课",
  consult1v1: "扫码私聊 · 关键词「位置」",
};

const PLACEHOLDER_BY_ACTION: Record<CtaAction, string> = {
  // TODO: 流量团队提供入口（微信号 / 群二维码 / 跳转链接）
  joinClass: "/qr-positioner-class.png",
  previewClass: "/qr-positioner-preview.png",
  consult1v1: "/qr-positioner-consult.png",
};

function CtaBlock({
  action,
  label,
  variant,
  quadrant,
}: {
  action: CtaAction;
  label: string;
  variant: "primary" | "secondary";
  quadrant: QuadrantId;
}) {
  const isPrimary = variant === "primary";
  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-2xl p-5 sm:p-6 ${
        isPrimary
          ? "bg-blue-50 border-2 border-blue-600"
          : "bg-white border border-slate-200"
      }`}
    >
      <p
        className={`text-sm sm:text-base font-bold text-center leading-snug ${
          isPrimary ? "text-blue-900" : "text-slate-700"
        }`}
      >
        {label}
      </p>
      <div
        className="rounded-xl bg-white p-2 shadow-[0_4px_16px_rgba(37,99,235,0.12)] ring-1 ring-blue-100"
        style={{ width: isPrimary ? 180 : 140, height: isPrimary ? 180 : 140 }}
      >
        {/* TODO: 流量团队提供入口 —— 现用占位图，运营方拿到正式 QR / 群链接后替换 */}
        <Image
          src={PLACEHOLDER_BY_ACTION[action]}
          alt={ACTION_DESC[action]}
          width={isPrimary ? 180 : 140}
          height={isPrimary ? 180 : 140}
          unoptimized
          className="w-full h-full object-contain select-none"
          draggable={false}
          onError={(e) => {
            // 占位图未上传时，给一块灰色块 + 文字，避免 broken image icon。
            const img = e.currentTarget as HTMLImageElement;
            img.style.visibility = "hidden";
          }}
        />
      </div>
      <p className="text-xs text-slate-500 text-center">{ACTION_DESC[action]}</p>
      <button
        type="button"
        onClick={() =>
          track("positioner_cta_click", {
            quadrant,
            action,
            variant,
          })
        }
        className={`w-full text-sm font-bold px-5 py-3 rounded-full transition-colors ${
          isPrimary
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50"
        }`}
      >
        我已扫码 / 我有问题
      </button>
    </div>
  );
}

export default function PositionerCtaCard({ q }: { q: QuadrantContent }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <CtaBlock
        action={q.primaryCta.action}
        label={q.primaryCta.label}
        variant="primary"
        quadrant={q.id}
      />
      {q.secondaryCta && (
        <CtaBlock
          action={q.secondaryCta.action}
          label={q.secondaryCta.label}
          variant="secondary"
          quadrant={q.id}
        />
      )}
    </div>
  );
}
