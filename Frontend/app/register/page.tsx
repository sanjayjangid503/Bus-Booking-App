import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Skeleton } from "@/components/ui/Feedback";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="It takes less than a minute, and your tickets are saved forever.">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
