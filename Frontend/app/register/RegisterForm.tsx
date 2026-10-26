"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Mail, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/api";
import { safeNext } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/Feedback";
import { Input } from "@/components/ui/Field";

type Field = "name" | "email" | "password";

export function RegisterForm() {
  const { register, user, ready } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, next, router]);

  function set(field: Field, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Partial<Record<Field, string>> = {};
    if (form.name.trim().length < 2) errs.name = "Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = "Enter a valid email address";
    if (form.password.length < 6) errs.password = "Use at least 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setApiError("");
    setLoading(true);
    try {
      const u = await register(form.name.trim(), form.email.trim(), form.password);
      toast.success(`Welcome aboard, ${u.name.split(" ")[0]}!`);
    } catch (err) {
      setApiError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {apiError && <ErrorBanner message={apiError} />}
      <Input
        label="Full name"
        autoComplete="name"
        placeholder="Your name"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        error={errors.name}
        icon={<User className="size-4" />}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        error={errors.email}
        icon={<Mail className="size-4" />}
      />
      <PasswordInput
        label="Password"
        autoComplete="new-password"
        placeholder="At least 6 characters"
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        error={errors.password}
      />
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Create account
      </Button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
