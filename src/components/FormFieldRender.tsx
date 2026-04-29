"use client";

import { FormField } from "@/data/form-fields";
import TrackOverview from "@/components/TrackOverview";

export type FieldValue = string | string[] | number | undefined;

export function FormFieldRender({
  field,
  value,
  onChange,
  onToggleMulti,
  customSkill,
  setCustomSkill,
  addCustomSkill,
}: {
  field: FormField;
  value: FieldValue;
  onChange: (v: string | string[] | number) => void;
  onToggleMulti: (opt: string) => void;
  customSkill: string;
  setCustomSkill: (s: string) => void;
  addCustomSkill: () => void;
}) {
  const label = (
    <label className="block">
      <span className="text-sm font-bold text-slate-900">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {field.hint && <span className="block text-xs text-slate-500 mt-0.5">{field.hint}</span>}
    </label>
  );

  if (field.type === "text" || field.type === "number-range") {
    return (
      <div>
        {label}
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="mt-2 w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 text-base"
        />
      </div>
    );
  }

  if (field.type === "select" || field.type === "single-select") {
    return (
      <div>
        {label}
        <select
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 bg-white text-base"
        >
          <option value="">请选择</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "multi-select" || field.type === "multi-select-custom") {
    const selected = (value as string[]) || [];
    return (
      <div>
        {label}
        {field.id === "targetTrack" && (
          <details className="mt-2 group">
            <summary className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer select-none py-1 list-none flex items-center gap-1">
              <span className="transition-transform group-open:rotate-90">▸</span>
              <span className="hover:underline">5 条主线分别是什么？点开看关键技能、适合人群、JD 数量</span>
            </summary>
            <div className="mt-3 mb-1">
              <TrackOverview />
            </div>
          </details>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {field.options?.map((opt) => {
            const on = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggleMulti(opt)}
                className={`text-sm px-3.5 py-2 rounded-full border transition-colors ${
                  on
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {field.type === "multi-select-custom" && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              placeholder="自定义技能（如：飞书多维表格）"
              className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomSkill();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomSkill}
              className="text-sm bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-lg shrink-0"
            >
              添加
            </button>
          </div>
        )}

        {field.type === "multi-select-custom" && selected.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">已选 {selected.length} 项</p>
        )}
      </div>
    );
  }

  return null;
}
