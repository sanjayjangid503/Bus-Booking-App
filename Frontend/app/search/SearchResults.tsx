"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BusFront, CalendarDays } from "lucide-react";
import { busApi } from "@/lib/endpoints";
import { BUS_TYPES, formatDate, isBusType } from "@/lib/format";
import { useQuery, useToday } from "@/lib/hooks";
import { SearchForm } from "@/components/search/SearchForm";
import { BusCard } from "@/components/search/BusCard";
import { EmptyState, ErrorBanner, Skeleton } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 8;

export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const today = useToday();

  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const rawType = params.get("busType");
  const busType = isBusType(rawType) ? rawType : undefined;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const rawDate = params.get("date") ?? "";
  const date = rawDate && rawDate >= today ? rawDate : today;

  const query = { from, to, busType, page, limit: PAGE_SIZE };
  const { data, loading, error, refetch } = useQuery(JSON.stringify(query), () => busApi.search(query));

  function update(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(`${pathname}?${next}`, { scroll: false });
  }

  const buses = data?.buses ?? [];
  const total = data?.pagination.total ?? 0;

  return (
    <>
      <div className="hero-gradient">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white">
            <h1 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
              {from || "Anywhere"} <ArrowRight className="size-6" /> {to || "Anywhere"}
            </h1>
            {date && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
                <CalendarDays className="size-4" /> {formatDate(date)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-6xl px-4">
        <SearchForm key={`${from}-${to}-${rawDate}`} initial={{ from, to, date: rawDate, busType }} compact />

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            {loading && !data ? (
              "Searching buses…"
            ) : (
              <>
                <span className="font-bold text-fg">{total}</span> {total === 1 ? "bus" : "buses"} found
              </>
            )}
          </p>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label="Bus type">
            {[{ value: undefined, label: "All types" }, ...BUS_TYPES].map((t) => {
              const active = busType === t.value;
              return (
                <button
                  key={t.label}
                  role="tab"
                  aria-selected={active}
                  onClick={() => update({ busType: t.value, page: undefined })}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-brand bg-brand text-white shadow-sm shadow-brand/30"
                      : "border-border bg-surface text-muted hover:border-brand/40 hover:text-fg"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {error ? (
            <ErrorBanner message={error} action={<Button size="sm" variant="secondary" onClick={refetch}>Retry</Button>} />
          ) : loading && !data ? (
            Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-40 rounded-3xl" />)
          ) : buses.length === 0 ? (
            <EmptyState
              icon={<BusFront className="size-8" />}
              title="No buses on this route"
              description={
                busType
                  ? "Try another bus type, or clear the filter to see every bus."
                  : "We couldn't find buses between these cities. Try a nearby city or another route."
              }
              action={
                busType ? (
                  <Button variant="secondary" onClick={() => update({ busType: undefined, page: undefined })}>
                    Clear filter
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className={`space-y-4 transition-opacity ${loading ? "opacity-60" : ""}`}>
              {buses.map((bus) => (
                <BusCard key={bus._id} bus={bus} date={date} />
              ))}
            </div>
          )}
        </div>

        <Pagination
          page={page}
          totalPages={data?.pagination.totalPages ?? 0}
          onChange={(p) => update({ page: String(p) })}
        />
      </div>
    </>
  );
}
