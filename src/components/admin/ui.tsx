import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-serif text-[1.45rem] font-semibold text-ink-900">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-[0.86rem] text-ink-600">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-ink-200 bg-white shadow-card", className)}>
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 px-5 py-3.5">
          <div>
            <h2 className="font-serif text-[1rem] font-semibold text-ink-900">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-[0.78rem] text-ink-500">{description}</p>
            ) : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  tone?: "neutral" | "brand" | "gold" | "green";
}) {
  const tones = {
    neutral: "text-ink-900",
    brand: "text-brand-700",
    gold: "text-gold-600",
    green: "text-emerald-700",
  } as const;

  const content = (
    <>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
        {label}
      </p>
      <p className={cn("mt-2 font-serif text-[1.9rem] font-semibold leading-none", tones[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[0.76rem] text-ink-500">{hint}</p> : null}
    </>
  );

  const classes =
    "block border border-ink-200 bg-white px-5 py-4 shadow-card transition-shadow";

  return href ? (
    <Link href={href} className={cn(classes, "hover:shadow-raise")}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-5 py-14 text-center">
      <p className="font-serif text-[1.05rem] font-semibold text-ink-800">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-[0.86rem] text-ink-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function DataTable({
  headers,
  children,
}: {
  headers: (string | { label: string; align?: "left" | "right" })[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-[0.84rem]">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50">
            {headers.map((header) => {
              const label = typeof header === "string" ? header : header.label;
              const align = typeof header === "string" ? "left" : header.align;

              return (
                <th
                  key={label}
                  scope="col"
                  className={cn(
                    "px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-ink-500",
                    align === "right" && "text-right",
                  )}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200">{children}</tbody>
      </table>
    </div>
  );
}

const STATUS_TONES = {
  SUBMITTED: "bg-sky-50 text-sky-800 border-sky-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-800 border-amber-200",
  SHORTLISTED: "bg-violet-50 text-violet-800 border-violet-200",
  ADMITTED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-50 text-red-800 border-red-200",
  WITHDRAWN: "bg-ink-100 text-ink-600 border-ink-200",
} as const;

export const STATUS_LABELS = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  SHORTLISTED: "Shortlisted",
  ADMITTED: "Admitted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
} as const;

export function StatusPill({ status }: { status: keyof typeof STATUS_TONES }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-sm border px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider",
        STATUS_TONES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-ink-200 bg-ink-50 px-5 py-3.5">
      {children}
    </div>
  );
}
