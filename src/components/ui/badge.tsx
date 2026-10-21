import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "brand" | "gold" | "neutral" | "green" | "red" | "blue";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-800 border-brand-200",
  gold: "bg-gold-100 text-gold-700 border-gold-300",
  neutral: "bg-ink-100 text-ink-700 border-ink-200",
  green: "bg-emerald-50 text-emerald-800 border-emerald-200",
  red: "bg-red-50 text-red-800 border-red-200",
  blue: "bg-sky-50 text-sky-800 border-sky-200",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
