import { Armchair, BadgePercent, BusFront, Headset, ShieldCheck, Timer } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { SearchForm } from "@/components/search/SearchForm";
import { PopularRoutes } from "@/components/search/PopularRoutes";

const FEATURES = [
  { icon: Armchair, title: "Pick your exact seat", text: "A live seat map shows what's free, held, and booked." },
  { icon: Timer, title: "5-minute seat hold", text: "Your seats are locked while you fill in passenger details." },
  { icon: ShieldCheck, title: "Instant confirmation", text: "Get a ticket with a booking number as soon as you confirm." },
  { icon: BadgePercent, title: "Free cancellation", text: "Cancel upcoming trips from My Bookings in one click." },
];

const STATS = [
  { value: "20+", label: "Seats per bus" },
  { value: "4", label: "Bus classes" },
  { value: "24/7", label: "Online booking" },
];

export default function HomePage() {
  return (
    <>
      <section className="hero-gradient relative overflow-hidden">
        {/* Decorative dashed "road" along the bottom of the hero */}
        <div className="pointer-events-none absolute inset-x-0 bottom-10 border-t-4 border-dashed border-white/20" />
        <BusFront className="pointer-events-none absolute -right-10 top-10 hidden size-96 text-white/10 lg:block" strokeWidth={1} />
        <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-14 sm:pt-20">
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <span className="size-1.5 rounded-full bg-white" /> Seats available for today
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              Your next trip
              <br />
              starts with a seat.
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/85 sm:text-lg">
              Compare buses, choose the seat you like, and get a confirmed ticket in under a minute.
            </p>
            <div className="mt-8 flex gap-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold">{s.value}</p>
                  <p className="text-xs text-white/75">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-20 max-w-5xl px-4">
        <SearchForm />
      </div>

      <PopularRoutes />

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-border bg-surface p-6">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start gap-4 rounded-3xl bg-fg p-8 text-bg sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-white">
              <Headset className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Need help with a booking?</h3>
              <p className="text-sm opacity-70">View, print or cancel any ticket from your bookings page.</p>
            </div>
          </div>
          <ButtonLink href="/bookings">Go to My Bookings</ButtonLink>
        </div>
      </section>
    </>
  );
}
