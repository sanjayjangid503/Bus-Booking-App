import Link from "next/link";
import { BusFront } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="BusGo home">
      <span
        className={`flex size-9 items-center justify-center rounded-xl transition-transform group-hover:-rotate-6 ${
          light ? "bg-white text-brand" : "bg-brand text-white shadow-sm shadow-brand/40"
        }`}
      >
        <BusFront className="size-5" strokeWidth={2.4} />
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-fg"}`}>
        Bus<span className={light ? "text-white/80" : "text-brand"}>Go</span>
      </span>
    </Link>
  );
}
