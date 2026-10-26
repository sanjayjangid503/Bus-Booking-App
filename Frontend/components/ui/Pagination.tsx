import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const btn =
    "flex size-10 items-center justify-center rounded-xl border text-sm font-semibold transition disabled:opacity-40 disabled:pointer-events-none";

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <button className={`${btn} border-border bg-surface hover:bg-surface-2`} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft className="size-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`${btn} ${p === page ? "border-brand bg-brand text-white" : "border-border bg-surface hover:bg-surface-2"}`}
        >
          {p}
        </button>
      ))}
      <button className={`${btn} border-border bg-surface hover:bg-surface-2`} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
