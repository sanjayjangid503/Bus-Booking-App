import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="no-print mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted">
            Book intercity bus tickets in under a minute. Pick your seat, lock it, and travel with a confirmed ticket.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold">Explore</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-brand" href="/">Search buses</Link></li>
            <li><Link className="hover:text-brand" href="/bookings">My bookings</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold">Account</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link className="hover:text-brand" href="/login">Log in</Link></li>
            <li><Link className="hover:text-brand" href="/register">Create account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted">
        BusGo, a demo bus booking app
      </div>
    </footer>
  );
}
