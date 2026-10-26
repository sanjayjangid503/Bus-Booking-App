import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Checkout, CheckoutSkeleton } from "./Checkout";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <RequireAuth fallback={<CheckoutSkeleton />}>
      <Checkout />
    </RequireAuth>
  );
}
