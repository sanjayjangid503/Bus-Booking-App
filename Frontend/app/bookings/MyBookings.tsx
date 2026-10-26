"use client";

import { useState } from "react";
import { ArrowDownUp, Ticket } from "lucide-react";
import { bookingApi } from "@/lib/endpoints";
import { useQuery } from "@/lib/hooks";
import type { BookingStatus } from "@/lib/types";
import { BookingCard } from "@/components/booking/BookingCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, ErrorBanner, Skeleton } from "@/components/ui/Feedback";
import { Pagination } from "@/components/ui/Pagination";

const TABS: { value?: BookingStatus; label: string }[] = [
  { label: "All" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAGE_SIZE = 6;

export function MyBookings() {
  const [status, setStatus] = useState<BookingStatus | undefined>();
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const query = { status, sort, page, limit: PAGE_SIZE };
  const { data, loading, error, refetch } = useQuery(`bookings:${JSON.stringify(query)}`, () => bookingApi.list(query));

  const bookings = data?.bookings ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My bookings</h1>
          <p className="mt-1 text-sm text-muted">
            {data ? `${data.total} ${data.total === 1 ? "trip" : "trips"}` : "Your tickets, all in one place"}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowDownUp className="size-4" />}
          onClick={() => {
            setSort((s) => (s === "desc" ? "asc" : "desc"));
            setPage(1);
          }}
        >
          {sort === "desc" ? "Newest first" : "Oldest first"}
        </Button>
      </div>

      <div className="mt-6 inline-flex w-full gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1 sm:w-auto" role="tablist">
        {TABS.map((t) => {
          const active = status === t.value;
          return (
            <button
              key={t.label}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setStatus(t.value);
                setPage(1);
              }}
              className={`flex-1 shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                active ? "bg-brand text-white shadow-sm" : "text-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {error ? (
          <ErrorBanner message={error} action={<Button size="sm" variant="secondary" onClick={refetch}>Retry</Button>} />
        ) : loading && !data ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-32 rounded-3xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={<Ticket className="size-8" />}
            title={status ? "Nothing here yet" : "No bookings yet"}
            description={status ? "You don't have any bookings with this status." : "When you book a trip, your ticket shows up here."}
            action={<ButtonLink href="/">Search buses</ButtonLink>}
          />
        ) : (
          <div className={`space-y-4 transition-opacity ${loading ? "opacity-60" : ""}`}>
            {bookings.map((b) => (
              <BookingCard key={b._id} booking={b} />
            ))}
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={setPage} />
    </div>
  );
}
