import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { NewsListItem } from "@/lib/data/news";
import { formatDate } from "@/lib/utils";

const categoryTone = {
  NOTICE: "brand",
  NEWS: "neutral",
  EVENT: "blue",
  CIRCULAR: "gold",
  RESULT: "green",
  ACHIEVEMENT: "gold",
} as const;

export function NewsList({
  items,
  basePath = "",
}: {
  items: NewsListItem[];
  basePath?: string;
}) {
  if (!items.length) {
    return (
      <p className="border border-dashed border-ink-300 bg-ink-50 px-5 py-10 text-center text-sm text-ink-500">
        Nothing has been published in this section yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-ink-200 border-y border-ink-200">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.linkUrl || `${basePath}/news/${item.slug}`}
            className="group flex flex-col gap-2 py-5 transition-colors hover:bg-ink-50 sm:flex-row sm:items-start sm:gap-5 sm:px-3"
          >
            <time
              dateTime={new Date(item.publishedAt).toISOString()}
              className="shrink-0 text-[0.78rem] font-semibold uppercase tracking-wider text-brand-700 sm:w-28 sm:pt-0.5"
            >
              {formatDate(item.publishedAt)}
            </time>

            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-[1.05rem] font-semibold leading-snug text-ink-900 group-hover:text-brand-700">
                {item.title}
              </h2>

              {item.summary ? (
                <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-600">
                  {item.summary}
                </p>
              ) : null}

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Badge tone={categoryTone[item.category] ?? "neutral"}>
                  {item.category}
                </Badge>
                {item.branch ? (
                  <span className="text-[0.72rem] text-ink-500">
                    {item.branch.shortName}
                  </span>
                ) : (
                  <span className="text-[0.72rem] text-ink-500">
                    Institution-wide
                  </span>
                )}
                {item.attachmentUrl ? (
                  <span className="text-[0.72rem] font-semibold text-brand-700">
                    Attachment
                  </span>
                ) : null}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
