"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, Armchair, Clock, Mail, ShieldCheck, TimerOff, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/api";
import { draftStore, type BookingDraft } from "@/lib/draft";
import { bookingApi, busApi } from "@/lib/endpoints";
import { busTypeLabel, formatDate, formatDuration, formatINR } from "@/lib/format";
import { useHydrated, useNow } from "@/lib/hooks";
import type { Gender } from "@/lib/types";
import { CountdownTimer } from "@/components/booking/CountdownTimer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/Feedback";
import { Input } from "@/components/ui/Field";

interface PassengerInput {
  seat: string;
  name: string;
  age: string;
  gender: Gender | "";
}

type Errors = Record<number, Partial<Record<"name" | "age" | "gender", string>>>;

const GENDERS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

function validate(passengers: PassengerInput[]) {
  const errors: Errors = {};
  passengers.forEach((p, i) => {
    const e: Errors[number] = {};
    if (p.name.trim().length < 2) e.name = "Enter the passenger's full name";
    const age = Number(p.age);
    if (!Number.isInteger(age) || age < 1 || age > 120) e.age = "Enter an age between 1 and 120";
    if (!p.gender) e.gender = "Select a gender";
    if (Object.keys(e).length) errors[i] = e;
  });
  return errors;
}

function CheckoutForm({ draft }: { draft: BookingDraft }) {
  const router = useRouter();
  const { user } = useAuth();
  const now = useNow(1000);
  const [passengers, setPassengers] = useState<PassengerInput[]>(() =>
    draft.seats.map((seat) => ({ seat, name: "", age: "", gender: "" })),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const remaining = Date.parse(draft.lockExpireAt) - now;
  const expired = now > 0 && remaining <= 0;
  const total = draft.fare * draft.seats.length;
  const seatPage = `/bus/${draft.busId}?date=${draft.travelDate}&seats=${draft.seats.join(",")}`;

  function update(i: number, patch: Partial<PassengerInput>) {
    setPassengers((list) => list.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
    if (errors[i]) {
      setErrors((errs) => {
        const next = { ...errs };
        const fieldErrors = { ...next[i] };
        for (const key of Object.keys(patch)) delete fieldErrors[key as keyof typeof fieldErrors];
        next[i] = fieldErrors;
        return next;
      });
    }
  }

  function changeSeats() {
    busApi.unlock(draft.busId, draft.travelDate, draft.seats).catch(() => {});
    draftStore.set(null);
    router.push(seatPage);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(passengers);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Please fix the highlighted passenger details.");
      return;
    }

    setSubmitting(true);
    try {
      const booking = await bookingApi.create(
        draft.busId,
        draft.travelDate,
        draft.seats,
        passengers.map((p) => ({ seat: p.seat, name: p.name.trim(), age: Number(p.age), gender: p.gender as Gender })),
      );
      // The ticket page clears the draft, so this page doesn't flash its empty state first.
      toast.success("Booking confirmed! Have a great trip.");
      router.replace(`/bookings/${booking._id}?new=1`);
    } catch (err) {
      toast.error(errorMessage(err));
      setSubmitting(false);
    }
  }

  if (expired) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={<TimerOff className="size-8" />}
          title="Your seat hold expired"
          description="Seats are held for 5 minutes. They may still be free, so pick them again to continue."
          action={
            <Button
              onClick={() => {
                draftStore.set(null);
                router.push(seatPage);
              }}
            >
              Pick seats again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button onClick={changeSeats} className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
            <ArrowLeft className="size-4" /> Change seats
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Passenger details</h1>
        </div>
        {now > 0 && <CountdownTimer remainingMs={remaining} />}
      </div>

      <form onSubmit={submit} className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" noValidate>
        <div className="space-y-4">
          {passengers.map((p, i) => (
            <fieldset key={p.seat} className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
              <legend className="sr-only">Passenger {i + 1}</legend>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <UserIcon className="size-5" />
                  </span>
                  <h2 className="font-bold">Passenger {i + 1}</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-1.5 text-sm font-bold">
                  <Armchair className="size-4 text-brand" /> Seat {p.seat}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <Input
                  label="Full name"
                  placeholder="As on ID proof"
                  autoComplete={i === 0 ? "name" : "off"}
                  value={p.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  error={errors[i]?.name}
                />
                <Input
                  label="Age"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={120}
                  placeholder="25"
                  value={p.age}
                  onChange={(e) => update(i, { age: e.target.value })}
                  error={errors[i]?.age}
                />
              </div>

              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Gender</p>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={`Passenger ${i + 1} gender`}>
                  {GENDERS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      role="radio"
                      aria-checked={p.gender === g.value}
                      onClick={() => update(i, { gender: g.value })}
                      className={`h-11 rounded-xl border text-sm font-semibold transition ${
                        p.gender === g.value
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-border text-muted hover:border-brand/40 hover:text-fg"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                {errors[i]?.gender && <p className="mt-1.5 text-xs font-medium text-danger">{errors[i]?.gender}</p>}
              </div>
            </fieldset>
          ))}

          <section className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="mb-3 font-bold">Contact details</h2>
            <p className="mb-4 text-sm text-muted">Your ticket will be saved to this account.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3">
                <UserIcon className="size-4 text-muted" />
                <span className="truncate text-sm font-semibold">{user?.name}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3">
                <Mail className="size-4 text-muted" />
                <span className="truncate text-sm font-semibold">{user?.email}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
            <div className="hero-gradient p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{formatDate(draft.travelDate)}</p>
              <div className="mt-2 flex items-center justify-between gap-2 text-lg font-extrabold">
                <span>{draft.bus.from}</span>
                <span className="flex flex-col items-center text-[11px] font-semibold text-white/80">
                  <Clock className="size-3.5" /> {formatDuration(draft.bus.duration)}
                </span>
                <span>{draft.bus.to}</span>
              </div>
            </div>
            <div className="space-y-3 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Operator</span>
                <span className="font-semibold">{draft.bus.operator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Bus</span>
                <span className="font-semibold">{busTypeLabel(draft.bus.busType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Seats</span>
                <span className="font-semibold">{draft.seats.join(", ")}</span>
              </div>
            </div>
            <div className="ticket-divider mx-5" />
            <div className="space-y-2 p-5 text-sm">
              <div className="flex justify-between text-muted">
                <span>
                  Base fare ({formatINR(draft.fare)} × {draft.seats.length})
                </span>
                <span>{formatINR(total)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Booking fee</span>
                <span className="font-semibold text-success">Free</span>
              </div>
              <div className="flex justify-between pt-2 text-lg font-extrabold">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
              <Button type="submit" size="lg" className="mt-3 w-full" loading={submitting}>
                Confirm & book
              </Button>
              <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted">
                <ShieldCheck className="size-3.5" /> Free cancellation before departure
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1fr_360px]">
      <Skeleton className="h-96 rounded-3xl" />
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}

export function Checkout() {
  const draft = draftStore.useValue();
  const hydrated = useHydrated();

  if (!hydrated) return <CheckoutSkeleton />;

  if (!draft) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={<Armchair className="size-8" />}
          title="No seats on hold"
          description="Search for a bus and pick your seats to start a booking."
          action={<ButtonLink href="/">Search buses</ButtonLink>}
        />
      </div>
    );
  }

  return <CheckoutForm key={`${draft.busId}-${draft.travelDate}-${draft.seats.join(",")}`} draft={draft} />;
}
