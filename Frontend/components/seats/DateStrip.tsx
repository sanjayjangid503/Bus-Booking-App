"use client";

import { addDays, formatDate } from "@/lib/format";

interface DateStripProps {
  today: string;
  value: string;
  onChange: (date: string) => void;
  days?: number;
}

export function DateStrip({ today, value, onChange, days = 7 }: DateStripProps) {
  if (!today) return <div className="h-[68px]" />;

  const dates = Array.from({ length: days }, (_, i) => addDays(today, i));
  // Keep a picked date beyond the strip visible as its own chip.
  if (value && !dates.includes(value)) dates.push(value);

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {dates.map((d) => {
        const active = d === value;
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            aria-pressed={active}
            className={`flex min-w-16 shrink-0 flex-col items-center rounded-2xl border px-3 py-2 transition ${
              active
                ? "border-brand bg-brand text-white shadow-md shadow-brand/30"
                : "border-border bg-surface hover:border-brand/40"
            }`}
          >
            <span className={`text-[11px] font-semibold uppercase ${active ? "text-white/80" : "text-muted"}`}>
              {d === today ? "Today" : formatDate(d, { weekday: "short", day: undefined, month: undefined, year: undefined })}
            </span>
            <span className="text-lg font-extrabold leading-tight">{Number(d.slice(8, 10))}</span>
            <span className={`text-[11px] ${active ? "text-white/80" : "text-muted"}`}>
              {formatDate(d, { month: "short", weekday: undefined, day: undefined, year: undefined })}
            </span>
          </button>
        );
      })}
    </div>
  );
}
