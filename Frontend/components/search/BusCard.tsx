import Link from "next/link";
import { Armchair, BedDouble, Clock, MapPin, Snowflake, Wind } from "lucide-react";
import { FARE_PER_SEAT, busTypeLabel, formatDuration, formatINR, isAC, isSleeper } from "@/lib/format";
import type { Bus } from "@/lib/types";
import { buttonClass } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Feedback";

export function BusCard({ bus, date }: { bus: Bus; date: string }) {
  const href = `/bus/${bus._id}?date=${date}`;
  const stops = bus.route.stopes?.length ?? 0;

  return (
    <article className="group rounded-3xl border border-border bg-surface p-5 shadow-card transition hover:border-brand/40 sm:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="md:w-56">
          <h3 className="text-lg font-bold leading-tight">{bus.operator}</h3>
          <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-muted">{bus.busNumber}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone={isAC(bus.busType) ? "brand" : "neutral"}>
              {isAC(bus.busType) ? <Snowflake className="size-3" /> : <Wind className="size-3" />}
              {isAC(bus.busType) ? "AC" : "Non-AC"}
            </Badge>
            <Badge>
              {isSleeper(bus.busType) ? <BedDouble className="size-3" /> : <Armchair className="size-3" />}
              {isSleeper(bus.busType) ? "Sleeper" : "Seater"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">From</p>
            <p className="truncate font-bold">{bus.route.from}</p>
          </div>
          <div className="flex flex-1 flex-col items-center px-1">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
              <Clock className="size-3" /> {formatDuration(bus.route.duration)}
            </span>
            <div className="relative my-1.5 h-px w-full bg-border">
              <span className="absolute -left-1 -top-1 size-2 rounded-full border-2 border-brand bg-surface" />
              <span className="absolute -right-1 -top-1 size-2 rounded-full bg-brand" />
            </div>
            <span className="text-[11px] text-muted">{stops ? `${stops} stop${stops > 1 ? "s" : ""}` : "Non-stop"}</span>
          </div>
          <div className="min-w-0 text-right">
            <p className="text-xs text-muted">To</p>
            <p className="truncate font-bold">{bus.route.to}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border pt-4 md:w-48 md:flex-col md:items-end md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div className="md:text-right">
            <p className="text-xs text-muted">Starting at</p>
            <p className="text-2xl font-extrabold tracking-tight">{formatINR(FARE_PER_SEAT)}</p>
            <p className="text-xs text-muted">
              {bus.totalSeats} seats · {busTypeLabel(bus.busType)}
            </p>
          </div>
          <Link href={href} className={buttonClass("primary", "md", "md:w-full")}>
            <MapPin className="size-4" /> Select seats
          </Link>
        </div>
      </div>
    </article>
  );
}
