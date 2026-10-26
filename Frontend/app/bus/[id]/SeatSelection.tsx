"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, BusFront, Clock, Snowflake, Ticket, Wind } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError, errorMessage } from "@/lib/api";
import { draftStore } from "@/lib/draft";
import { busApi } from "@/lib/endpoints";
import { MAX_SEATS, busTypeLabel, formatDate, formatDuration, formatINR, isAC, isSleeper, FARE_PER_SEAT } from "@/lib/format";
import { useNow, useQuery, useToday } from "@/lib/hooks";
import { SeatLegend, SeatMap, type SeatView } from "@/components/seats/SeatMap";
import { DateStrip } from "@/components/seats/DateStrip";
import { Button } from "@/components/ui/Button";
import { Badge, EmptyState, ErrorBanner, Skeleton } from "@/components/ui/Feedback";

const SEAT_REFRESH_MS = 20_000;

export function SeatSelection() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const today = useToday();
  const now = useNow(5_000);
  const draft = draftStore.useValue();

  const rawDate = params.get("date") ?? "";
  const date = rawDate && rawDate >= today ? rawDate : today;

  const bus = useQuery(`bus:${id}`, () => busApi.get(id));
  const seats = useQuery(date ? `seats:${id}:${date}` : null, () => busApi.seats(id, date));
  const refetchSeats = seats.refetch;

  // Keep the seat map fresh while the user decides.
  useEffect(() => {
    const t = window.setInterval(refetchSeats, SEAT_REFRESH_MS);
    return () => window.clearInterval(t);
  }, [refetchSeats]);

  // Selection is scoped to a date; seats passed via ?seats= survive a login redirect.
  const [selection, setSelection] = useState(() => ({
    date: rawDate,
    seats: (params.get("seats") ?? "").split(",").filter(Boolean).slice(0, MAX_SEATS),
  }));
  const [locking, setLocking] = useState(false);

  // Seats this user already holds (from an unfinished checkout) count as theirs.
  const myLocked =
    draft && draft.busId === id && draft.travelDate === date && Date.parse(draft.lockExpireAt) > now ? draft.seats : [];

  const statusMap = new Map(seats.data?.map((s) => [s.seatNumber, s.status]));
  const isFree = (seat: string) => statusMap.get(seat) === "AVAILABLE" || myLocked.includes(seat);
  const selected = selection.date === rawDate ? selection.seats.filter((s) => !seats.data || isFree(s)) : [];

  const statusOf = (seat: string): SeatView => {
    if (selected.includes(seat)) return "SELECTED";
    if (myLocked.includes(seat)) return "AVAILABLE";
    return statusMap.get(seat) ?? "AVAILABLE";
  };

  function toggle(seat: string) {
    if (selected.includes(seat)) {
      setSelection({ date: rawDate, seats: selected.filter((s) => s !== seat) });
    } else if (selected.length >= MAX_SEATS) {
      toast.info(`You can book up to ${MAX_SEATS} seats at a time.`);
    } else {
      setSelection({ date: rawDate, seats: [...selected, seat] });
    }
  }

  function changeDate(d: string) {
    router.replace(`${pathname}?date=${d}`, { scroll: false });
  }

  async function proceed() {
    if (!bus.data || selected.length === 0) return;

    if (!user) {
      const next = `${pathname}?date=${date}&seats=${selected.join(",")}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    setLocking(true);
    try {
      // Release an older hold for a different trip before taking a new one.
      if (draft && (draft.busId !== id || draft.travelDate !== date)) {
        busApi.unlock(draft.busId, draft.travelDate, draft.seats).catch(() => {});
      }
      const lock = await busApi.lock(id, date, selected);
      draftStore.set({
        busId: id,
        travelDate: date,
        seats: selected,
        lockExpireAt: lock.lockExpireAt,
        fare: FARE_PER_SEAT,
        bus: {
          operator: bus.data.operator,
          busNumber: bus.data.busNumber,
          busType: bus.data.busType,
          from: bus.data.route.from,
          to: bus.data.route.to,
          duration: bus.data.route.duration,
        },
      });
      router.push("/checkout");
    } catch (err) {
      toast.error(errorMessage(err));
      if (err instanceof ApiError && err.status === 409) refetchSeats();
    } finally {
      setLocking(false);
    }
  }

  if (bus.error && !bus.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorBanner message={bus.error} action={<Button size="sm" variant="secondary" onClick={bus.refetch}>Retry</Button>} />
      </div>
    );
  }

  if (!bus.loading && bus.data === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={<BusFront className="size-8" />}
          title="Bus not found"
          description="This bus may have been removed. Search again to find another one."
          action={<Link href="/" className="font-semibold text-brand">Back to search</Link>}
        />
      </div>
    );
  }

  const b = bus.data;
  const fare = seats.data?.[0]?.price ?? FARE_PER_SEAT;
  const total = fare * selected.length;
  const available = seats.data?.filter((s) => s.status === "AVAILABLE").length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 lg:pb-10">
      <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Back to results
      </button>

      {/* Bus header */}
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        {!b ? (
          <Skeleton className="h-16" />
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold sm:text-2xl">{b.operator}</h1>
                <Badge tone={isAC(b.busType) ? "brand" : "neutral"}>
                  {isAC(b.busType) ? <Snowflake className="size-3" /> : <Wind className="size-3" />}
                  {busTypeLabel(b.busType)}
                </Badge>
              </div>
              <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted">{b.busNumber}</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3">
              <span className="font-bold">{b.route.from}</span>
              <span className="flex flex-col items-center text-[11px] font-semibold text-muted">
                <Clock className="size-3.5" />
                {formatDuration(b.route.duration)}
              </span>
              <span className="font-bold">{b.route.to}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Travel date</h2>
            <DateStrip today={today} value={date} onChange={changeDate} />
          </section>

          <section className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">Choose your seats</h2>
                <p className="text-sm text-muted">
                  {available !== undefined ? `${available} seats available` : "Loading seats…"} · up to {MAX_SEATS} per booking
                </p>
              </div>
            </div>

            {seats.error && !seats.data ? (
              <ErrorBanner message={seats.error} action={<Button size="sm" variant="secondary" onClick={refetchSeats}>Retry</Button>} />
            ) : !b || !seats.data ? (
              <Skeleton className="mx-auto h-[420px] max-w-[320px] rounded-[28px]" />
            ) : (
              <div className="space-y-6">
                <SeatMap layout={b.seatLayout} statusOf={statusOf} sleeper={isSleeper(b.busType)} onToggle={toggle} />
                <SeatLegend />
              </div>
            )}
          </section>
        </div>

        {/* Summary: sticky card on desktop, fixed bar on mobile */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="hidden rounded-3xl border border-border bg-surface p-6 shadow-card lg:block">
            <h2 className="text-lg font-bold">Trip summary</h2>
            {date && <p className="mt-1 text-sm text-muted">{formatDate(date)}</p>}

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Selected seats</p>
              {selected.length === 0 ? (
                <p className="mt-2 rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
                  Tap a seat on the map to select it
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selected.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggle(s)}
                      className="rounded-lg bg-brand-soft px-2.5 py-1 text-sm font-bold text-brand hover:bg-brand hover:text-white"
                      title="Remove seat"
                    >
                      {s} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
              <div className="flex justify-between text-muted">
                <span>Fare × {selected.length}</span>
                <span>{formatINR(total)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            <Button className="mt-5 w-full" size="lg" disabled={selected.length === 0} loading={locking} onClick={proceed}>
              {user ? "Continue" : "Log in to continue"} <ArrowRight className="size-4" />
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
              <Ticket className="size-3.5" /> Seats are held for 5 minutes once you continue
            </p>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 p-4 backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-xs text-muted">
                  {selected.length ? `Seats: ${selected.join(", ")}` : "No seats selected"}
                </p>
                <p className="text-xl font-extrabold">{formatINR(total)}</p>
              </div>
              <Button disabled={selected.length === 0} loading={locking} onClick={proceed}>
                Continue <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
