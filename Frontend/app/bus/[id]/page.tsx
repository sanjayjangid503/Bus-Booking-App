import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Feedback";
import { SeatSelection } from "./SeatSelection";

export const metadata: Metadata = { title: "Select seats" };

function SeatFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <Skeleton className="h-24 rounded-3xl" />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-[560px] rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </div>
  );
}

export default function BusPage() {
  return (
    <Suspense fallback={<SeatFallback />}>
      <SeatSelection />
    </Suspense>
  );
}
