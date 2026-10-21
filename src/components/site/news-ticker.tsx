import Link from "next/link";
import { cn } from "@/lib/utils";

export type TickerItem = {
  id: string;
  title: string;
  slug: string;
  linkUrl?: string | null;
  category?: string | null;
};

function hrefFor(item: TickerItem, basePath: string) {
  return item.linkUrl || `${basePath}/news/${item.slug}`;
}

/**
 * Continuously scrolling headline strip.
 *
 * Rendered on the server with no measuring pass: the duration is derived from
 * the headline text length so long runs scroll at the same reading speed as
 * short ones (roughly 11 characters a second).
 */
export function NewsTicker({
  items,
  basePath = "",
  label = "Latest Updates",
}: {
  items: TickerItem[];
  basePath?: string;
  label?: string;
}) {
  if (!items.length) return null;

  const characters = items.reduce((total, item) => total + item.title.length + 6, 0);
  const durationSeconds = Math.min(120, Math.max(28, Math.round(characters / 5.5)));

  const row = (duplicate: boolean) => (
    <ul
      className={cn("flex shrink-0 items-center", duplicate && "ticker-duplicate")}
      aria-hidden={duplicate || undefined}
    >
      {items.map((item) => (
        <li key={`${duplicate ? "dup" : "src"}-${item.id}`} className="flex items-center">
          <span className="mx-3.5 inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-400" />
          <Link
            href={hrefFor(item, basePath)}
            tabIndex={duplicate ? -1 : undefined}
            className="whitespace-nowrap text-[0.82rem] text-white/90 underline-offset-4 transition-colors hover:text-gold-300 hover:underline"
          >
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      aria-label={label}
      className="border-b border-black/20"
      style={{ backgroundColor: "var(--branch-color-dark)" }}
    >
      <div className="container-site flex items-stretch">
        <p className="flex shrink-0 items-center gap-2 bg-gold-500 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-900">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-brand-800"
            style={{ animation: "soft-pulse 1.8s ease-in-out infinite" }}
          />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">News</span>
        </p>

        <div className="ticker-viewport relative flex-1 overflow-hidden">
          <div
            className="ticker-track flex w-max items-center py-2"
            style={{ animationDuration: `${durationSeconds}s` }}
          >
            {row(false)}
            {row(true)}
          </div>
        </div>
      </div>
    </aside>
  );
}
