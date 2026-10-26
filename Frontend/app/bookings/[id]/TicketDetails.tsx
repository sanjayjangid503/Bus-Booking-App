"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, BusFront, CircleCheck, CircleX, Clock, Printer, Ticket } from "lucide-react";
import { errorMessage } from "@/lib/api";
import { draftStore } from "@/lib/draft";
import { bookingApi } from "@/lib/endpoints";
import { busTypeLabel, formatDate, formatDuration, formatINR } from "@/lib/format";
import { useQuery, useToday } from "@/lib/hooks";
import { StatusBadge } from "@/components/booking/StatusBadge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, ErrorBanner, Skeleton } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";

const GENDER_LABEL = { MALE: "Male", FEMALE: "Female", OTHER: "Other" } as const;

export function TicketSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-[520px] rounded-3xl" />
    </div>
  );
}

export function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const isNew = params.get("new") === "1";
  const today = useToday();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { data: booking, loading, error, refetch } = useQuery(`booking:${id}`, () => bookingApi.get(id));

  // A freshly confirmed booking ends the checkout draft.
  useEffect(() => {
    if (isNew) draftStore.set(null);
  }, [isNew]);

  async function cancel() {
    setCancelling(true);
    try {
      await bookingApi.cancel(id);
      toast.success("Booking cancelled. Your seats have been released.");
      setConfirmOpen(false);
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCancelling(false);
    }
  }

  if (loading && !booking) return <TicketSkeleton />;

  if (error && !booking) {
    const notFound = error === "Booking not found";
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        {notFound ? (
          <EmptyState
            icon={<Ticket className="size-8" />}
            title="Booking not found"
            description="This ticket doesn't exist or belongs to another account."
            action={<ButtonLink href="/bookings">Back to my bookings</ButtonLink>}
          />
        ) : (
          <ErrorBanner message={error} action={<Button size="sm" variant="secondary" onClick={refetch}>Retry</Button>} />
        )}
      </div>
    );
  }

  if (!booking) return null;

  const bus = booking.bus;
  const route = bus?.route;
  const travelYMD = booking.travelDate.slice(0, 10);
  const canCancel =
    (booking.status === "CONFIRMED" || booking.status === "PENDING") && !!today && travelYMD >= today;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/bookings" className="no-print mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> My bookings
      </Link>

      {isNew && booking.status === "CONFIRMED" && (
        <div className="no-print mb-5 flex items-center gap-3 rounded-2xl border border-success/30 bg-success-soft px-4 py-3 text-success">
          <CircleCheck className="size-6 shrink-0" />
          <div>
            <p className="font-bold">Booking confirmed!</p>
            <p className="text-sm opacity-90">Your ticket is ready. You can print it or find it later in My Bookings.</p>
          </div>
        </div>
      )}

      <article className="print-flat overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        <header className={`${booking.status === "CANCELLED" ? "bg-muted" : "hero-gradient"} p-6 text-white sm:p-8`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/75">Booking number</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-wider">{booking.bookingNumber}</p>
            </div>
            <span className="rounded-full bg-white px-1 py-0.5">
              <StatusBadge status={booking.status} />
            </span>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-white/75">From</p>
              <p className="text-2xl font-extrabold sm:text-3xl">{route?.from ?? "-"}</p>
            </div>
            <div className="flex flex-1 flex-col items-center">
              <BusFront className="size-6" />
              <div className="my-1.5 w-full border-t-2 border-dashed border-white/50" />
              {route && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/85">
                  <Clock className="size-3" /> {formatDuration(route.duration)}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-white/75">To</p>
              <p className="text-2xl font-extrabold sm:text-3xl">{route?.to ?? "-"}</p>
            </div>
          </div>
        </header>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 p-6 sm:grid-cols-3 sm:p-8">
          {[
            { label: "Travel date", value: formatDate(booking.travelDate) },
            { label: "Operator", value: bus?.operator ?? "-" },
            { label: "Bus number", value: bus?.busNumber ?? "-" },
            { label: "Bus type", value: bus ? busTypeLabel(bus.busType) : "-" },
            { label: "Seats", value: booking.seats.join(", ") },
            { label: "Booked on", value: formatDate(booking.createdAt) },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</dt>
              <dd className="mt-1 font-bold">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="ticket-divider mx-0" />

        <div className="p-6 sm:p-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Passengers</h2>
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Name</th>
                  <th className="px-4 py-2.5 font-semibold">Age</th>
                  <th className="px-4 py-2.5 font-semibold">Gender</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Seat</th>
                </tr>
              </thead>
              <tbody>
                {booking.passengers.map((p) => (
                  <tr key={p.seat} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">{p.name}</td>
                    <td className="px-4 py-3 text-muted">{p.age}</td>
                    <td className="px-4 py-3 text-muted">{GENDER_LABEL[p.gender]}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="rounded-lg bg-brand-soft px-2 py-1 text-xs font-bold text-brand">{p.seat}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-surface-2 px-5 py-4">
            <span className="font-semibold text-muted">
              {booking.status === "CANCELLED" ? "Amount (cancelled)" : "Total paid"}
            </span>
            <span className={`text-2xl font-extrabold ${booking.status === "CANCELLED" ? "text-muted line-through" : ""}`}>
              {formatINR(booking.totalAmount)}
            </span>
          </div>
        </div>
      </article>

      <div className="no-print mt-6 flex flex-wrap justify-end gap-3">
        <ButtonLink href="/" variant="ghost">
          Book another trip
        </ButtonLink>
        <Button variant="secondary" icon={<Printer className="size-4" />} onClick={() => window.print()}>
          Print ticket
        </Button>
        {canCancel && (
          <Button variant="danger" icon={<CircleX className="size-4" />} onClick={() => setConfirmOpen(true)}>
            Cancel booking
          </Button>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Cancel this booking?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={cancelling}>
              Keep booking
            </Button>
            <Button variant="danger" onClick={cancel} loading={cancelling}>
              Yes, cancel
            </Button>
          </>
        }
      >
        Seats <span className="font-bold text-fg">{booking.seats.join(", ")}</span> on{" "}
        <span className="font-bold text-fg">{formatDate(booking.travelDate)}</span> will be released. You can&apos;t undo this.
      </Modal>
    </div>
  );
}
