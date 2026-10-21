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
    <section className="flex h-full flex-col border border-ink-200 bg-white shadow-card">
      <header
        className="flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: "var(--branch-color)" }}
      >
        <h2 className="font-serif text-base font-semibold text-white">{title}</h2>
        <span className="h-2 w-2 rounded-full bg-gold-400" aria-hidden />
      </header>

      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-500">
          No notices have been published yet.
        </p>
      ) : (
        <ul className="divide-y divide-ink-200">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.linkUrl || `${basePath}/news/${item.slug}`}
                className="group flex gap-3.5 px-5 py-3.5 transition-colors hover:bg-ink-50"
              >
                <time
                  dateTime={new Date(item.publishedAt).toISOString()}
                  className="flex h-11 w-11 shrink-0 flex-col items-center justify-center border border-ink-200 bg-ink-50 text-center leading-none"
                >
                  <span className="font-serif text-base font-semibold text-brand-700">
                    {new Date(item.publishedAt).getDate()}
                  </span>
                  <span className="mt-0.5 text-[0.58rem] font-semibold uppercase tracking-wider text-ink-500">
                    {new Date(item.publishedAt).toLocaleString("en-IN", {
                      month: "short",
                      timeZone: "Asia/Kolkata",
                    })}
                  </span>
                </time>

                <div className="min-w-0">
                  <p className="text-[0.88rem] font-medium leading-snug text-ink-800 group-hover:text-brand-700">
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
