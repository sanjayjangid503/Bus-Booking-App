import type { ReactNode } from "react";
import { Armchair, ShieldCheck, Ticket } from "lucide-react";

const POINTS = [
  { icon: Armchair, text: "Choose your exact seat on a live seat map" },
  { icon: ShieldCheck, text: "Seats held for you while you check out" },
  { icon: Ticket, text: "All your tickets saved in one place" },
];

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
      <div className="hero-gradient relative hidden h-full min-h-[560px] overflow-hidden rounded-[32px] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-white/10" />
        <div className="absolute -right-10 top-32 size-40 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">BusGo</p>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight">
            Travel smarter.
            <br />
            Book in seconds.
          </h2>
        </div>
        <ul className="relative space-y-4">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Icon className="size-5" />
              </span>
              <span className="font-medium">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

/** Only allow same-site relative redirects. */
export function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
