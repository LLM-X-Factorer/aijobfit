"use client";

// 报告后 4 节（Gap / 路径 / Action / 资源）的软门槛。
// 未解锁 → 显示模糊预览 + 解锁卡（小助理二维码 + 激活码输入）。
// 激活码 AIJOB-2026，客户端校验，localStorage 持久化。
// 服务端 OG / SharePoster 走完整报告，不受此遮罩影响。

import { useEffect, useState, useSyncExternalStore } from "react";
import AssistantQR from "./AssistantQR";
import { track } from "@/lib/track";

const STORAGE_KEY = "aijobfit_unlocked";
const CODE = "AIJOB-2026";

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getClientSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

function getServerSnapshot(): boolean {
  return false;
}

function unlockAndNotify(): void {
  localStorage.setItem(STORAGE_KEY, "1");
  listeners.forEach((l) => l());
}

export default function LockedSections({
  children,
}: {
  children: React.ReactNode;
}) {
  const unlocked = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (unlocked) {
    return <div className="unlocked space-y-6">{children}</div>;
  }

  return <LockOverlay onUnlock={unlockAndNotify}>{children}</LockOverlay>;
}

function LockOverlay({
  children,
  onUnlock,
}: {
  children: React.ReactNode;
  onUnlock: () => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    track("mask_see");
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = input.trim().toUpperCase();
    if (normalized === CODE) {
      track("code_enter_success");
      onUnlock();
      return;
    }
    track("code_enter_fail", { attempted: normalized.slice(0, 12) });
    setError(true);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none select-none blur-md opacity-50 h-[480px] overflow-hidden origin-top"
        style={{ transform: "scale(1.02)" }}
      >
        {children}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/75 to-white pointer-events-none" />

      <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 py-8">
        <div
          className={`w-full max-w-md bg-white rounded-3xl shadow-xl border border-blue-100 p-5 sm:p-7 ${
            shake ? "animate-shake" : ""
          }`}
        >
          <div className="text-center mb-4">
            <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-1.5">
              锁定内容
            </p>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              剩余 4 节深度内容
            </h3>
            <p className="text-xs text-slate-500">
              技能缺口 · 学习路径 · Action Plan · 免费资源
            </p>
          </div>

          <div className="flex justify-center mb-4">
            <AssistantQR size={180} caption="扫码加小助理，领取激活码" />
          </div>

          <form onSubmit={submit} className="space-y-2">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(false);
              }}
              placeholder="输入激活码 AIJOB-XXXX"
              autoComplete="off"
              autoCapitalize="characters"
              aria-label="激活码"
              className={`w-full text-center text-sm sm:text-base font-mono tracking-wider px-4 py-3 rounded-xl border-2 bg-white outline-none transition ${
                error
                  ? "border-red-400 text-red-600"
                  : "border-slate-200 focus:border-blue-500 text-slate-900"
              }`}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 rounded-xl transition text-sm sm:text-base"
            >
              解锁完整报告
            </button>
            {error ? (
              <p className="text-xs text-red-500 text-center pt-1">
                激活码不正确，请检查后重试
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 text-center pt-1">
                解锁后本设备永久有效
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
