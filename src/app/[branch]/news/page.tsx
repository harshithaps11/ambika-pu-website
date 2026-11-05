import type { Metadata } from "next";
import Link from "next/link";
import { NewsList } from "@/components/site/news-list";
import { NewsSidePanel } from "@/components/site/news-side-panel";
import { PageHeader } from "@/components/site/page-header";
import { Pagination } from "@/components/ui/pagination";
import { getLatestNews, getNewsPage } from "@/lib/data/news";
import { requireBranch } from "@/lib/data/require-branch";
import { cn } from "@/lib/utils";
import type { NewsCategory } from "@/generated/prisma/enums";

type Props = {
  params: Promise<{ branch: string }>;
  searchParams: Promise<{ page?: string; category?: string }>;
};

const CATEGORIES: { label: string; value?: NewsCategory }[] = [
  { label: "All Bulletins" },
  { label: "Official Notices", value: "NOTICE" },
  { label: "Circulars", value: "CIRCULAR" },
  { label: "Events & Fests", value: "EVENT" },
  { label: "Board Results", value: "RESULT" },
  { label: "Campus News", value: "NEWS" },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  return { title: `Notice Board & News — ${branch.shortName}` };
}

export default async function BranchNewsPage({ params, searchParams }: Props) {
  const { branch: slug } = await params;
  const { page: pageParam, category } = await searchParams;
  const branch = await requireBranch(slug);

  const page = Number.parseInt(pageParam ?? "1", 10) || 1;
  const active = CATEGORIES.find((item) => item.value === category)?.value;

  const base = `/${branch.slug}`;

  const [{ items, totalPages, total }, featuredItems] = await Promise.all([
    getNewsPage({
      branchId: branch.id,
      categories: active ? [active] : undefined,
      page,
      perPage: 8,
    }),
    getLatestNews({
      branchId: branch.id,
      take: 5,
    }),
  ]);

  const buildHref = (targetPage: number) => {
    const search = new URLSearchParams();
    if (active) search.set("category", active);
    if (targetPage > 1) search.set("page", String(targetPage));
    const query = search.toString();
    return `${base}/news${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title={`Notice Board — ${branch.shortName}`}
        description={`Announcements, circulars, examination schedules, and campus events for ${branch.name}.`}
        crumbs={[{ label: "Home", href: base }, { label: "Notice Board" }]}
      />

      <section className="py-12 bg-texture-subtle min-h-[75vh]">
        <div className="container-site">
          {/* Top Bar with Category Filter Pills and Status */}
          <div className="mb-8 flex flex-col gap-4 border-b border-ink-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Filter by category" className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((item) => {
                const href = item.value
                  ? `${base}/news?category=${item.value}`
                  : `${base}/news`;
                const isActive = item.value === active;

                return (
                  <Link
                    key={item.label}
                    href={href}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-[0.78rem] font-bold uppercase tracking-wider transition-all duration-200 shadow-xs",
                      isActive
                        ? "bg-brand-700 text-white shadow-sm ring-2 ring-brand-700/30"
                        : "border border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-700",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 text-xs font-semibold text-ink-500">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="tabular-nums">
                Showing {total} {total === 1 ? "bulletin" : "bulletins"}
              </span>
            </div>
          </div>

          {/* 2-Column Responsive Newsroom Layout */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Primary Notices Column (8 cols) */}
            <main className="lg:col-span-8">
              <NewsList items={items} basePath={base} />

              {totalPages > 1 ? (
                <div className="mt-8 pt-4">
                  <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
                </div>
              ) : null}
            </main>

            {/* Side Panel (4 cols): Animated Photo Slider, Official Documents & Office Contact */}
            <aside className="lg:col-span-4">
              <div className="sticky top-20">
                <NewsSidePanel
                  sliderItems={featuredItems}
                  basePath={base}
                  phone={branch.phone}
                  email={branch.email}
                  campusName={branch.shortName}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
