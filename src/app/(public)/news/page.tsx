import type { Metadata } from "next";
import Link from "next/link";
import { NewsList } from "@/components/site/news-list";
import { PageHeader } from "@/components/site/page-header";
import { Pagination } from "@/components/ui/pagination";
import { getNewsPage } from "@/lib/data/news";
import { cn } from "@/lib/utils";
import type { NewsCategory } from "@/generated/prisma/enums";

export const metadata: Metadata = {
  title: "News & Notices",
  description:
    "Announcements, circulars, events and results from both campuses of Ambika Padavi Poorva College.",
};

const CATEGORIES: { label: string; value?: NewsCategory }[] = [
  { label: "All" },
  { label: "Notices", value: "NOTICE" },
  { label: "Circulars", value: "CIRCULAR" },
  { label: "Events", value: "EVENT" },
  { label: "Results", value: "RESULT" },
  { label: "Achievements", value: "ACHIEVEMENT" },
];

export default async function NewsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { page: pageParam, category } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const active = CATEGORIES.find((item) => item.value === category)?.value;

  const { items, totalPages, total } = await getNewsPage({
    allBranches: true,
    categories: active ? [active] : undefined,
    page,
    perPage: 12,
  });

  const buildHref = (targetPage: number) => {
    const search = new URLSearchParams();
    if (active) search.set("category", active);
    if (targetPage > 1) search.set("page", String(targetPage));
    const query = search.toString();
    return `/news${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="News & Notices"
        description="Everything published by the institution and by both campuses."
        crumbs={[{ label: "Home", href: "/" }, { label: "News & Notices" }]}
      />

      <section className="py-12">
        <div className="container-site">
          <nav aria-label="Filter by category" className="mb-8 flex flex-wrap gap-2">
            {CATEGORIES.map((item) => {
              const href = item.value ? `/news?category=${item.value}` : "/news";
              const isActive = item.value === active;

              return (
                <Link
                  key={item.label}
                  href={href}
                  className={cn(
                    "border px-3.5 py-1.5 text-[0.78rem] font-semibold uppercase tracking-wider transition-colors",
                    isActive
                      ? "border-transparent bg-brand-700 text-white"
                      : "border-ink-300 bg-white text-ink-700 hover:border-brand-700 hover:text-brand-700",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <p className="mb-4 text-[0.8rem] text-ink-500">
            {total} {total === 1 ? "item" : "items"}
          </p>

          <NewsList items={items} />
          <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
        </div>
      </section>
    </>
  );
}
