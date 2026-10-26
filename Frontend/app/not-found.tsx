import { MapPin } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-brand-soft text-brand">
        <MapPin className="size-10" />
      </div>
      <p className="mt-6 text-sm font-bold uppercase tracking-wider text-brand">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Looks like a wrong turn</h1>
      <p className="mt-3 text-muted">We couldn&apos;t find the page you were looking for.</p>
      <ButtonLink href="/" className="mt-8">
        Back to home
      </ButtonLink>
    </div>
  );
}
