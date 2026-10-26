"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Ticket } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Feedback";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/bookings", label: "My Bookings" },
];

function NavLinkList({ active }: { active?: string }) {
  return (
    <>
      {LINKS.map((l) => {
        const isActive = active === l.href || (l.href !== "/" && active?.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              isActive ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-2 hover:text-fg"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}

function ActiveNavLinks() {
  return <NavLinkList active={usePathname()} />;
}

function UserMenu() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!ready) return <Skeleton className="h-10 w-28" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-fg hover:bg-surface-2 sm:block">
          Log in
        </Link>
        <ButtonLink href="/register" size="sm">
          Sign up
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 transition hover:bg-surface-2"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
          {initials(user.name)}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-semibold sm:block">{user.name.split(" ")[0]}</span>
        <ChevronDown className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-surface shadow-pop"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <div className="p-1.5">
            <Link
              href="/bookings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface-2"
            >
              <Ticket className="size-4 text-muted" /> My bookings
            </Link>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
                router.push("/");
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger-soft"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/70 bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            <Suspense fallback={<NavLinkList />}>
              <ActiveNavLinks />
            </Suspense>
          </nav>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
