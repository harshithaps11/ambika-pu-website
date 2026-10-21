import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  return DATE_FORMAT.format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "";
  return DATE_TIME_FORMAT.format(new Date(value));
}

/** Formats an ISO date as yyyy-mm-dd for <input type="date"> values. */
export function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Appends a numeric suffix until the slug is unique against `exists`. */
export async function uniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
) {
  const root = slugify(base) || "item";
  let candidate = root;
  let counter = 2;

  while (await exists(candidate)) {
    candidate = `${root}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export function truncate(value: string, length = 160) {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1).trimEnd()}…`;
}

/** Renders a 10-digit Indian mobile number as "98765 43210". */
export function formatPhone(value: string | null | undefined) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  return value;
}

export function telHref(value: string | null | undefined) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `tel:+91${digits}` : `tel:${digits}`;
}

/**
 * Mixes a hex colour towards black. Used to derive the darker shade of a
 * branch's accent colour for banded sections, so the admin only has to pick
 * one colour per campus.
 */
export function darken(hex: string, amount = 0.3) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;

  const value = Number.parseInt(match[1], 16);
  const factor = 1 - Math.min(Math.max(amount, 0), 1);

  const r = Math.round(((value >> 16) & 0xff) * factor);
  const g = Math.round(((value >> 8) & 0xff) * factor);
  const b = Math.round((value & 0xff) * factor);

  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}
