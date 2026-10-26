import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Skeleton } from "@/components/ui/Feedback";
import { MyBookings } from "./MyBookings";

export const metadata: Metadata = { title: "My bookings" };

function BookingsFallback() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-12 w-80" />
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-32 rounded-3xl" />
      ))}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <RequireAuth fallback={<BookingsFallback />}>
      <MyBookings />
    </RequireAuth>
  );
}
