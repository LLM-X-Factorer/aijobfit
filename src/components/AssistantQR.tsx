"use client";

// 小助理微信二维码组件。默认加载 public/qr-assistant.png；通过
// NEXT_PUBLIC_ASSISTANT_QR_URL 可覆盖（支持远程 URL）。
// 用 next/image + unoptimized：跳过 WebP 转换以保留 PNG 二维码扫码识别精度，
// 同时拿到 priority hint（QR 在 fold 内常是 LCP 元素）。

import Image from "next/image";

const QR_SRC =
  process.env.NEXT_PUBLIC_ASSISTANT_QR_URL || "/qr-assistant.png";

type Props = {
  size?: number;
  caption?: string;
  className?: string;
};

export default function AssistantQR({
  size = 200,
  caption = "扫码加小助理",
  className = "",
}: Props) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className="rounded-2xl bg-white p-2.5 shadow-[0_8px_32px_rgba(37,99,235,0.18)] ring-1 ring-blue-100"
        style={{ width: size, height: size }}
      >
        <Image
          src={QR_SRC}
          alt={caption}
          width={size}
          height={size}
          unoptimized
          priority
          className="w-full h-full object-contain select-none"
          draggable={false}
        />
      </div>
      {caption && (
        <p className="text-sm font-medium text-slate-700">{caption}</p>
      )}
    </div>
  );
}
