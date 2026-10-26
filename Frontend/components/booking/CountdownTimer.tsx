import { Timer } from "lucide-react";

export function CountdownTimer({ remainingMs }: { remainingMs: number }) {
  const total = Math.max(0, Math.ceil(remainingMs / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  const urgent = total < 60;

  return (
    <div
      role="timer"
      aria-live={urgent ? "assertive" : "off"}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold tabular-nums ${
        urgent ? "animate-pulse bg-danger-soft text-danger" : "bg-warning-soft text-warning"
      }`}
    >
      <Timer className="size-4" />
      Seats held for {mm}:{ss}
    </div>
  );
}
