import type { BookingStatus, BusType } from "./types";

export const FARE_PER_SEAT = 850;
export const MAX_SEATS = 6;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatINR = (amount: number) => inr.format(amount);

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Local calendar date as YYYY-MM-DD (toISOString would shift it to UTC). */
export function toLocalYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(ymd: string, days: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  return toLocalYMD(new Date(y, m - 1, d + days));
}

/** Formats a YYYY-MM-DD or an ISO date stored at UTC midnight without timezone drift. */
export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  const ymd = value.slice(0, 10);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(`${ymd}T00:00:00Z`));
}

export const BUS_TYPES: { value: BusType; label: string }[] = [
  { value: "AC_SEATER", label: "AC Seater" },
  { value: "NON_AC_SEATER", label: "Non-AC Seater" },
  { value: "AC_SLEEPER", label: "AC Sleeper" },
  { value: "NON_AC_SLEEPER", label: "Non-AC Sleeper" },
];

export const busTypeLabel = (type: BusType) =>
  BUS_TYPES.find((t) => t.value === type)?.label ?? type;

export const isAC = (type: BusType) => type.startsWith("AC");
export const isSleeper = (type: BusType) => type.endsWith("SLEEPER");

export const isBusType = (value: string | null): value is BusType =>
  BUS_TYPES.some((t) => t.value === value);

export const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
