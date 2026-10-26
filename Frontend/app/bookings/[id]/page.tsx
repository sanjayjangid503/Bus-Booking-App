import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { TicketDetails, TicketSkeleton } from "./TicketDetails";

export const metadata: Metadata = { title: "Your ticket" };

export default function TicketPage() {
  return (
    <Suspense fallback={<TicketSkeleton />}>
      <RequireAuth fallback={<TicketSkeleton />}>
        <TicketDetails />
      </RequireAuth>
    </Suspense>
  );
}
