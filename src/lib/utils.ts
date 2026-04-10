import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This helper lets us combine conditional classes cleanly
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const VENUE_TZ = "Asia/Colombo";

function intlFmt(dateStr: string | Date, opts: Intl.DateTimeFormatOptions): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat("en-US", { timeZone: VENUE_TZ, ...opts }).format(d);
}

export function fmtTime(dateStr: string): string {
  return intlFmt(dateStr, { hour: "numeric", minute: "2-digit", hour12: true });
}

export function fmtDateShort(dateStr: string): string {
  return intlFmt(dateStr, { weekday: "short", month: "short", day: "2-digit", year: "numeric" });
}

export function fmtDateLong(dateStr: string): string {
  return intlFmt(dateStr, { weekday: "long", month: "long", day: "2-digit", year: "numeric" });
}

export function fmtMonthAbbr(dateStr: string): string {
  return intlFmt(dateStr, { month: "short" });
}

export function fmtDayNum(dateStr: string): string {
  return intlFmt(dateStr, { day: "2-digit" });
}

export function fmtDateTime(dateStr: string): string {
  const datePart = intlFmt(dateStr, { month: "short", day: "numeric", year: "numeric" });
  const timePart = intlFmt(dateStr, { hour: "numeric", minute: "2-digit", hour12: true });
  return `${datePart}, ${timePart}`;
}

export function fmtMonthYear(dateStr: string): string {
  return intlFmt(dateStr, { month: "short", year: "numeric" });
}