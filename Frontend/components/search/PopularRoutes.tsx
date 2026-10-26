"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { busApi } from "@/lib/endpoints";
import { FARE_PER_SEAT, formatDuration, formatINR } from "@/lib/format";
import { useQuery } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Feedback";

const fetchRoutes = () => busApi.search({ limit: 50 });

export function PopularRoutes() {
  const { data, loading, error } = useQuery("popular-routes", fetchRoutes);

  if (error) return null;

  const routes = new Map<string, { from: string; to: string; duration: number; buses: number }>();
  for (const bus of data?.buses ?? []) {
    const key = `${bus.route.from}-${bus.route.to}`;
    const existing = routes.get(key);
    if (existing) existing.buses += 1;
    else routes.set(key, { from: bus.route.from, to: bus.route.to, duration: bus.route.duration, buses: 1 });
  }

  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-brand">Trending</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Popular routes</h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && !data
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-36" />)
          : [...routes.values()].slice(0, 6).map((r) => (
              <Link
                key={`${r.from}-${r.to}`}
                href={`/search?${new URLSearchParams({ from: r.from, to: r.to })}`}
                className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand/40"
              >
                <div className="absolute -right-8 -top-8 size-28 rounded-full bg-brand-soft transition-transform group-hover:scale-125" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-lg font-bold">
                    <span>{r.from}</span>
                    <ArrowRight className="size-4 text-brand transition-transform group-hover:translate-x-1" />
                    <span>{r.to}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-sm text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" /> {formatDuration(r.duration)}
                    </span>
                    <span>·</span>
                    <span>
                      {r.buses} {r.buses === 1 ? "bus" : "buses"}
                    </span>
                  </div>
                  <p className="mt-5 text-sm text-muted">
                    Starting at <span className="text-lg font-extrabold text-fg">{formatINR(FARE_PER_SEAT)}</span>
                  </p>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
