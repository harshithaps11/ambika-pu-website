import type { Metadata } from "next";
import { NewsList } from "@/components/site/news-list";
import { PageHeader } from "@/components/site/page-header";
import { ToppersStrip } from "@/components/site/toppers-strip";
import { SectionHeading } from "@/components/ui/section-heading";
import { getToppers } from "@/lib/data/content";
import { getLatestNews } from "@/lib/data/news";
import { requireBranch } from "@/lib/data/require-branch";

export const revalidate = 600;

type Props = { params: Promise<{ branch: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  return { title: `Results & Toppers — ${branch.shortName}` };
}

export default async function BranchResultsPage({ params }: Props) {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);

  const [toppers, resultNews] = await Promise.all([
    getToppers(branch.id),
    getLatestNews({ branchId: branch.id, categories: ["RESULT"], take: 10 }),
  ]);

  const byYear = [...new Set(toppers.map((topper) => topper.academicYear))];

  return (
    <>
      <PageHeader
        title="Results & Toppers"
        description="Karnataka Second PUC board examination results."
        crumbs={[
          { label: "Home", href: `/${branch.slug}` },
          { label: "Results" },
        ]}
      />

      <section className="py-12">
        <div className="container-site space-y-12">
          {byYear.length === 0 ? (
            <p className="border border-dashed border-ink-300 bg-ink-50 px-5 py-10 text-center text-sm text-ink-500">
              Results have not been published yet.
            </p>
          ) : (
            byYear.map((year) => (
              <div key={year}>
                <SectionHeading eyebrow="Academic year" title={year} />
                <div className="mt-7">
                  <ToppersStrip
                    toppers={toppers.filter((topper) => topper.academicYear === year)}
                  />
                </div>
              </div>
            ))
          )}

          {resultNews.length ? (
            <div>
              <SectionHeading eyebrow="Announcements" title="Result notices" />
              <div className="mt-6">
                <NewsList items={resultNews} basePath={`/${branch.slug}`} />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
