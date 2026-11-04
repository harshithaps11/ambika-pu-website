import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { NewsListItem } from "@/lib/data/news";

const categoryTone = {
  NOTICE: "brand",
  NEWS: "neutral",
  EVENT: "blue",
  CIRCULAR: "gold",
  RESULT: "green",
  ACHIEVEMENT: "gold",
} as const;

export function NoticeBoard({
  items,
  basePath = "",
  viewAllHref,
  title = "Notice Board",
}: {
  items: NewsListItem[];
  basePath?: string;
  viewAllHref?: string;
  title?: string;
}) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xs border border-ink-200/90 bg-white shadow-card transition-shadow duration-300 hover:shadow-raise">
      <header
        className="flex items-center justify-between border-b-2 border-gold-500/40 px-5 py-3.5"
        style={{ backgroundColor: "var(--branch-color)" }}
      >
        <h2 className="font-serif text-base font-semibold text-white tracking-wide">{title}</h2>
        <span className="h-2 w-2 rounded-full bg-gold-400 animate-pulse" aria-hidden />
      </header>

      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-500">
          No notices have been published yet.
        </p>
      ) : (
        <ul className="divide-y divide-ink-200/80">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.linkUrl || `${basePath}/news/${item.slug}`}
                className="group relative flex gap-3.5 border-l-3 border-transparent px-5 py-3.5 transition-all duration-200 hover:border-brand-700 hover:bg-brand-50/40 hover:pl-6"
              >
                <time
                  dateTime={new Date(item.publishedAt).toISOString()}
                  className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xs border border-ink-200 bg-ink-50 text-center leading-none transition-all duration-200 group-hover:border-brand-700 group-hover:bg-brand-700"
                >
                  <span className="font-serif text-base font-semibold text-brand-700 transition-colors duration-200 group-hover:text-white">
                    {new Date(item.publishedAt).getDate()}
                  </span>
                  <span className="mt-0.5 text-[0.58rem] font-semibold uppercase tracking-wider text-ink-500 transition-colors duration-200 group-hover:text-gold-200">
                    {new Date(item.publishedAt).toLocaleString("en-IN", {
                      month: "short",
                      timeZone: "Asia/Kolkata",
                    })}
                  </span>
                </time>

                <div className="min-w-0">
                  <p className="text-[0.88rem] font-medium leading-snug text-ink-800 transition-colors duration-200 group-hover:text-brand-700">
                    {item.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge tone={categoryTone[item.category] ?? "neutral"}>
                      {item.category}
                    </Badge>
                    {item.branch ? (
                      <span className="text-[0.7rem] text-ink-500">
                        {item.branch.shortName}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className="mt-auto border-t border-ink-200 px-5 py-3 text-center text-[0.78rem] font-semibold uppercase tracking-wider text-brand-700 transition-colors hover:bg-brand-50"
        >
          View all notices
        </Link>
      ) : null}
    </section>
  );
}
