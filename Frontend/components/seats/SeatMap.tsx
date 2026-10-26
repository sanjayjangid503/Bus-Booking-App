"use client";

import type { SeatStatus } from "@/lib/types";

export type SeatView = SeatStatus | "SELECTED";

const seatStyles: Record<SeatView, string> = {
  AVAILABLE:
    "border-success/50 bg-surface text-fg hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft hover:text-brand cursor-pointer",
  SELECTED: "border-brand bg-brand text-white shadow-md shadow-brand/30 cursor-pointer -translate-y-0.5",
  LOCKED: "border-warning/40 bg-warning-soft text-warning cursor-not-allowed",
  BOOKED: "border-border bg-surface-2 text-muted/50 cursor-not-allowed",
};

const STATUS_TEXT: Record<SeatView, string> = {
  AVAILABLE: "available",
  SELECTED: "selected",
  LOCKED: "on hold by another traveller",
  BOOKED: "already booked",
};

function SteeringWheel() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 14.5V21M9.6 11.2 3.5 9.5M14.4 11.2l6.1-1.7" />
    </svg>
  );
}

interface SeatProps {
  number: string;
  view: SeatView;
  sleeper: boolean;
  onToggle: (seat: string) => void;
}

function Seat({ number, view, sleeper, onToggle }: SeatProps) {
  const disabled = view === "BOOKED" || view === "LOCKED";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(number)}
      aria-pressed={view === "SELECTED"}
      aria-label={`Seat ${number}, ${STATUS_TEXT[view]}`}
      title={`${number} · ${STATUS_TEXT[view]}`}
      className={`relative flex w-full flex-col items-center justify-center rounded-xl border-2 text-[11px] font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        sleeper ? "h-20" : "h-12"
      } ${seatStyles[view]}`}
    >
      {view === "BOOKED" && (
        <span className="absolute inset-0 rounded-[10px] bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--border)_6px_8px)]" />
      )}
      <span className="relative">{number}</span>
      {/* Backrest / pillow */}
      <span
        className={`absolute rounded-full ${sleeper ? "inset-x-2 top-1.5 h-1.5" : "inset-x-2 bottom-1 h-1"} ${
          view === "SELECTED" ? "bg-white/60" : "bg-current opacity-25"
        }`}
      />
    </button>
  );
}

interface SeatMapProps {
  layout: string[][];
  statusOf: (seat: string) => SeatView;
  sleeper: boolean;
  onToggle: (seat: string) => void;
}

export function SeatMap({ layout, statusOf, sleeper, onToggle }: SeatMapProps) {
  const columns = Math.max(...layout.map((row) => row.length));

  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[28px] border-2 border-border bg-surface p-4 pt-3">
      <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-border pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Front</span>
        <SteeringWheel />
      </div>
      <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {layout.flatMap((row, r) =>
          row.map((seat, c) =>
            seat.trim() === "" ? (
              <div key={`${r}-${c}`} aria-hidden />
            ) : (
              <Seat key={seat} number={seat} view={statusOf(seat)} sleeper={sleeper} onToggle={onToggle} />
            ),
          ),
        )}
      </div>
    </div>
  );
}

export function SeatLegend() {
  const items = [
    { label: "Available", swatch: "border-success/50 bg-surface" },
    { label: "Selected", swatch: "border-brand bg-brand" },
    { label: "On hold", swatch: "border-warning/40 bg-warning-soft" },
    { label: "Booked", swatch: "border-border bg-surface-2" },
  ];
  return (
    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <span className={`size-4 rounded-md border-2 ${i.swatch}`} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
