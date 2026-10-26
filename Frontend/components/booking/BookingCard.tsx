import Link from "next/link";
import { ArrowRight, Armchair, ChevronRight, Users } from "lucide-react";
import { formatDate, formatINR } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function BookingCard({ booking }: { booking: Booking }) {
  const route = booking.bus?.route;
  const cancelled = booking.status === "CANCELLED";

  return (
    <Link
      href={`/bookings/${booking._id}`}
      className={`group relative flex overflow-hidden rounded-3xl border border-border bg-surface shadow-card transition hover:-translate-y-0.5 hover:border-brand/40 ${
        cancelled ? "opacity-75" : ""
      }`}
    >
      {/* Date stub */}
      <div className={`flex w-24 shrink-0 flex-col items-center justify-center py-5 text-white sm:w-28 ${cancelled ? "bg-muted" : "hero-gradient"}`}>
        <span className="text-xs font-semibold uppercase text-white/80">
          {formatDate(booking.travelDate, { weekday: "short", day: undefined, month: undefined, year: undefined })}
        </span>
        <span className="text-3xl font-extrabold leading-none">{Number(booking.travelDate.slice(8, 10))}</span>
        <span className="mt-0.5 text-xs font-semibold text-white/90">
          {formatDate(booking.travelDate, { month: "short", year: "numeric", weekday: undefined, day: undefined })}
        </span>
      </div>

      {/* Perforation */}
      <div className="relative w-0 border-l-2 border-dashed border-border">
        <span className="absolute -left-[11px] -top-[11px] size-5 rounded-full bg-bg" />
        <span className="absolute -bottom-[11px] -left-[11px] size-5 rounded-full bg-bg" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            <span className="font-mono text-xs text-muted">{booking.bookingNumber}</span>
          </div>
          <p className="mt-2 flex items-center gap-2 text-lg font-bold">
            {route ? (
              <>
                {route.from} <ArrowRight className="size-4 text-brand" /> {route.to}
              </>
            ) : (
              "Bus trip"
            )}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {booking.bus && <span className="truncate">{booking.bus.operator}</span>}
            <span className="inline-flex items-center gap-1">
              <Armchair className="size-3.5" /> {booking.seats.join(", ")}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" /> {booking.passengers.length}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <span className="text-xl font-extrabold">{formatINR(booking.totalAmount)}</span>
          <span className="inline-flex items-center text-sm font-semibold text-brand">
            View ticket <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
