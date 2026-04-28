"use client";

// 小助理微信二维码组件。
// 默认加载 public/qr-assistant.jpg；通过 NEXT_PUBLIC_ASSISTANT_QR_URL 可覆盖。
// 用 <img> 原生元素，支持 iOS / Android / 微信 WebView 长按保存与识别。

const QR_SRC =
  process.env.NEXT_PUBLIC_ASSISTANT_QR_URL || "/qr-assistant.jpg";

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
        <img
          src={QR_SRC}
          alt={caption}
          width={size}
          height={size}
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
