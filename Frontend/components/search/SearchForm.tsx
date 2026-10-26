"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeftRight, CalendarDays, MapPin, Navigation, Search } from "lucide-react";
import { busApi } from "@/lib/endpoints";
import { addDays } from "@/lib/format";
import { useQuery, useToday } from "@/lib/hooks";
import type { BusType } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

interface SearchFormProps {
  initial?: { from?: string; to?: string; date?: string; busType?: BusType };
  compact?: boolean;
}

export function SearchForm({ initial, compact = false }: SearchFormProps) {
  const router = useRouter();
  const today = useToday();
  const tomorrow = today ? addDays(today, 1) : "";
  const [from, setFrom] = useState(initial?.from ?? "");
  const [to, setTo] = useState(initial?.to ?? "");
  const [pickedDate, setPickedDate] = useState(initial?.date ?? "");
  const [error, setError] = useState("");
  const { data: cities } = useQuery("cities", busApi.cities);

  // Fall back to today until the user picks a date (and never allow a past one).
  const date = pickedDate && pickedDate >= today ? pickedDate : today;
  const allCities = Array.from(new Set([...(cities?.from ?? []), ...(cities?.to ?? [])])).sort();

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return setError("Enter both a departure and a destination city.");
    if (from.trim().toLowerCase() === to.trim().toLowerCase())
      return setError("Departure and destination can't be the same.");
    setError("");
    const params = new URLSearchParams({ from: from.trim(), to: to.trim(), date });
    if (initial?.busType) params.set("busType", initial.busType);
    router.push(`/search?${params}`);
  }

  return (
    <form
      onSubmit={submit}
      className={`rounded-3xl border border-border bg-surface ${compact ? "p-3 shadow-card" : "p-4 shadow-pop sm:p-6"}`}
    >
      <datalist id="city-list">
        {allCities.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className={`grid gap-3 ${compact ? "md:grid-cols-[1fr_auto_1fr_200px_auto]" : "md:grid-cols-[1fr_auto_1fr_220px]"} md:items-end`}>
        <Input
          label={compact ? undefined : "From"}
          placeholder="Leaving from"
          aria-label="From"
          list="city-list"
          autoComplete="off"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          icon={<Navigation className="size-4" />}
        />

        <button
          type="button"
          onClick={swap}
          aria-label="Swap cities"
          className="mx-auto flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-brand transition hover:rotate-180 hover:bg-brand-soft md:mb-0.5"
        >
          <ArrowLeftRight className="size-4 rotate-90 md:rotate-0" />
        </button>

        <Input
          label={compact ? undefined : "To"}
          placeholder="Going to"
          aria-label="To"
          list="city-list"
          autoComplete="off"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          icon={<MapPin className="size-4" />}
        />

        <Input
          label={compact ? undefined : "Date of journey"}
          aria-label="Date of journey"
          type="date"
          min={today}
          value={date}
          onChange={(e) => setPickedDate(e.target.value)}
          icon={<CalendarDays className="size-4" />}
        />

        {compact && (
          <Button type="submit" className="h-12" icon={<Search className="size-4" />}>
            Modify
          </Button>
        )}
      </div>

      {!compact && (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted">Quick pick:</span>
            {[
              { label: "Today", value: today },
              { label: "Tomorrow", value: tomorrow },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setPickedDate(chip.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  date === chip.value
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border text-muted hover:border-brand/50 hover:text-fg"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <Button type="submit" size="lg" icon={<Search className="size-5" />} className="sm:min-w-48">
            Search buses
          </Button>
        </div>
      )}

      {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}
    </form>
  );
}
