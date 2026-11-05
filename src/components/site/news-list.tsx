import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { NewsListItem } from "@/lib/data/news";

const categoryStyles: Record<
  string,
  { label: string; tone: "brand" | "neutral" | "gold" | "green" | "blue" }
> = {
  NOTICE: { label: "Official Notice", tone: "brand" },
  CIRCULAR: { label: "Circular", tone: "blue" },
  RESULT: { label: "Examination Result", tone: "green" },
  ACHIEVEMENT: { label: "Student Achievement", tone: "gold" },
  EVENT: { label: "College Event", tone: "blue" },
  NEWS: { label: "Campus News", tone: "neutral" },
};

function splitDate(dateInput: Date | string) {
  const d = new Date(dateInput);
  const month = d.toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" }).toUpperCase();
  const day = d.toLocaleDateString("en-IN", { day: "2-digit", timeZone: "Asia/Kolkata" });
  const year = d.toLocaleDateString("en-IN", { year: "numeric", timeZone: "Asia/Kolkata" });
  return { month, day, year };
}

export function NewsList({
  items,
  basePath = "",
}: {
  items: NewsListItem[];
  basePath?: string;
}) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-ink-200/90 bg-white p-10 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          📰
        </div>
        <h3 className="mt-3 font-serif text-lg font-bold text-ink-900">
          No notices found in this category
        </h3>
        <p className="mt-1 text-sm text-ink-500 max-w-sm mx-auto">
          Please select &ldquo;All&rdquo; above or check back shortly for newly published circulars and updates.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const { month, day, year } = splitDate(item.publishedAt);
        const categoryMeta = categoryStyles[item.category] || {
          label: item.category,
          tone: "neutral" as const,
        };
        const itemHref = item.linkUrl || `${basePath}/news/${item.slug}`;

        return (
          <li
            key={item.id}
            className={`group relative overflow-hidden rounded-2xl border bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-raise ${
              item.isPinned
                ? "border-gold-400/90 ring-1 ring-gold-400/30"
                : "border-ink-200/80 hover:border-brand-400"
            }`}
          >
            {item.isPinned ? (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 px-4 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-ink-950 shadow-xs">
                <span>📌</span>
                <span>Important College Announcement</span>
              </div>
            ) : null}

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-6">
              {/* Official Institutional Date Stamp */}
              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-center sm:justify-center sm:rounded-xl sm:border sm:border-ink-200/70 sm:bg-ink-50/70 sm:px-3 sm:py-3.5 sm:text-center sm:w-20">
                <span className="font-sans text-[0.72rem] font-bold uppercase tracking-widest text-brand-700">
                  {month}
                </span>
                <span className="font-sans text-2xl sm:text-3xl font-extrabold leading-none text-ink-900 tabular-nums">
                  {day}
                </span>
                <span className="font-sans text-[0.7rem] font-medium text-ink-500 tabular-nums">
                  {year}
                </span>
              </div>

              {/* Notice Details */}
              <div className="min-w-0 flex-1">
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={categoryMeta.tone}>
                    {categoryMeta.label}
                  </Badge>

                  {item.branch ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white px-2.5 py-0.5 text-[0.72rem] font-semibold text-ink-700">
                      🏛️ {item.branch.shortName}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white px-2.5 py-0.5 text-[0.72rem] font-semibold text-ink-700">
                      🏛️ Both Campuses
                    </span>
                  )}
                </div>

                {/* Notice Title */}
                <h3 className="mt-2.5 font-serif text-[1.12rem] sm:text-[1.25rem] font-bold leading-snug text-ink-900 transition-colors group-hover:text-brand-700">
                  <Link href={itemHref} className="focus:outline-hidden">
                    {item.title}
                  </Link>
                </h3>

                {/* Notice Summary */}
                {item.summary ? (
                  <p className="mt-2 text-[0.88rem] sm:text-[0.92rem] leading-relaxed text-ink-600 line-clamp-2">
                    {item.summary}
                  </p>
                ) : null}

                {/* Action Row */}
                <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-ink-100">
                  <Link
                    href={itemHref}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 transition-colors group-hover:text-brand-900"
                  >
                    <span>Read Details</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </Link>

                  {item.attachmentUrl ? (
                    <a
                      href={item.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50/70 px-2.5 py-1 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-100/80"
                    >
                      <svg className="h-3.5 w-3.5 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download Circular (PDF)</span>
                    </a>
                  ) : null}
                </div>
              </div>

              {/* Photo Thumbnail (if article has photo) */}
              {item.coverImageUrl ? (
                <Link
                  href={itemHref}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="hidden sm:block h-28 w-28 md:h-32 md:w-36 shrink-0 overflow-hidden rounded-xl border border-ink-200/80 bg-ink-100 shadow-xs"
                >
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </Link>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
