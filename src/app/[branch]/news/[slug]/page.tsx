import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/site/page-header";
import { Badge } from "@/components/ui/badge";
import { getNewsBySlug } from "@/lib/data/news";
import { requireBranch } from "@/lib/data/require-branch";
import { formatDate, truncate } from "@/lib/utils";

type Props = { params: Promise<{ branch: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  if (!item) return {};

  return {
    title: item.title,
    description: item.summary ? truncate(item.summary, 160) : undefined,
  };
}

export default async function BranchNewsItemPage({ params }: Props) {
  const { branch: branchSlug, slug } = await params;
  const branch = await requireBranch(branchSlug);
  const item = await getNewsBySlug(slug);

  // An item belongs here only if it is this campus's own or institution-wide.
  if (!item || (item.branchId !== null && item.branchId !== branch.id)) {
    notFound();
  }

  const base = `/${branch.slug}`;

  return (
    <>
      <PageHeader
        title={item.title}
        crumbs={[
          { label: "Home", href: base },
          { label: "Notice Board", href: `${base}/news` },
          { label: truncate(item.title, 35) },
        ]}
      />

      <article className="py-12 bg-texture-subtle min-h-[75vh]">
        <div className="container-site max-w-4xl">
          <div className="rounded-2xl border border-ink-200/90 bg-white p-6 sm:p-10 shadow-card">
            {/* Meta Bar */}
            <div className="flex flex-wrap items-center gap-3 border-b border-ink-200/80 pb-5">
              <Badge tone="brand">{item.category}</Badge>
              <time
                dateTime={new Date(item.publishedAt).toISOString()}
                className="font-sans text-[0.82rem] font-semibold tabular-nums text-ink-600"
              >
                Published {formatDate(item.publishedAt)}
              </time>
              {item.branch ? (
                <span className="text-xs font-semibold text-brand-700">🏛️ {item.branch.shortName}</span>
              ) : (
                <span className="text-xs font-semibold text-ink-500">🏛️ Institution-wide</span>
              )}
            </div>

            {/* Featured Photo (if present) */}
            {item.coverImageUrl ? (
              <div className="mt-7 overflow-hidden rounded-xl border border-ink-200/80 shadow-xs max-h-[460px]">
                <img
                  src={item.coverImageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover max-h-[460px]"
                />
              </div>
            ) : null}

            {/* Excerpt / Summary */}
            {item.summary ? (
              <div className="mt-7 rounded-xl border-l-4 border-gold-500 bg-gold-50/40 p-4 sm:p-5">
                <p className="text-[1.02rem] font-medium leading-relaxed text-ink-800">
                  {item.summary}
                </p>
              </div>
            ) : null}

            {/* Article Body */}
            {item.body ? (
              <div className="mt-8 space-y-4 text-[0.95rem] leading-relaxed text-ink-700">
                {item.body
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            ) : null}

            {/* Official Attachment Button */}
            {item.attachmentUrl ? (
              <div className="mt-8 pt-6 border-t border-ink-150">
                <a
                  href={item.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-colors hover:bg-brand-800"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Official Circular (PDF)</span>
                </a>
              </div>
            ) : null}

            {/* Back Link */}
            <div className="mt-10 border-t border-ink-150 pt-6">
              <Link
                href={`${base}/news`}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700 underline underline-offset-4 hover:text-brand-900"
              >
                <span>←</span>
                <span>Back to campus notice board</span>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
