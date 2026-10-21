import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em]",
            tone === "dark" ? "text-brand-700" : "text-gold-300",
          )}
        >
          {eyebrow}
        </p>
      ) : null}

      <h2
        className={cn(
          "rule-gold text-2xl font-semibold sm:text-[1.75rem]",
          align === "center" && "rule-gold-center",
          tone === "light" && "text-white",
        )}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            "mt-4 text-[0.95rem] leading-relaxed",
            tone === "dark" ? "text-ink-600" : "text-white/75",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
