import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  // A compact window around the current page keeps long archives usable.
  const windowSize = 2;
  const pages: (number | "gap")[] = [];

  for (let candidate = 1; candidate <= totalPages; candidate += 1) {
    const inWindow =
      candidate === 1 ||
      candidate === totalPages ||
      Math.abs(candidate - page) <= windowSize;

    if (inWindow) {
      pages.push(candidate);
    } else if (pages[pages.length - 1] !== "gap") {
      pages.push("gap");
    }
  }

  return (
    <nav aria-label="Pagination" className="mt-10 flex justify-center">
      <ul className="flex flex-wrap items-center gap-1.5">
        <li>
          <PageLink
            href={buildHref(page - 1)}
            disabled={page <= 1}
            label="Previous page"
          >
            ‹
          </PageLink>
        </li>

        {pages.map((entry, index) =>
          entry === "gap" ? (
            <li key={`gap-${index}`} className="px-1.5 text-ink-400">
              …
            </li>
          ) : (
            <li key={entry}>
              <PageLink
                href={buildHref(entry)}
                current={entry === page}
                label={`Page ${entry}`}
              >
                {entry}
              </PageLink>
            </li>
          ),
        )}

        <li>
          <PageLink
            href={buildHref(page + 1)}
            disabled={page >= totalPages}
            label="Next page"
          >
            ›
          </PageLink>
        </li>
      </ul>
    </nav>
  );
}

function PageLink({
  href,
  children,
  current,
  disabled,
  label,
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
  label: string;
}) {
  const classes = cn(
    "flex h-9 min-w-9 items-center justify-center border px-3 text-[0.82rem] font-semibold transition-colors",
    current
      ? "border-transparent bg-brand-700 text-white"
      : "border-ink-300 bg-white text-ink-700 hover:border-brand-700 hover:text-brand-700",
    disabled && "pointer-events-none opacity-40",
  );

  if (disabled) {
    return (
      <span className={classes} aria-disabled>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={classes}
    >
      {children}
    </Link>
  );
}
