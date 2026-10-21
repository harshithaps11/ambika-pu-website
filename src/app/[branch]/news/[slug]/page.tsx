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
          { label: "News & Notices", href: `${base}/news` },
          { label: truncate(item.title, 40) },
        ]}
      />

      <article className="py-12">
        <div className="container-site max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 border-b border-ink-200 pb-4">
            <Badge tone="brand">{item.category}</Badge>
            <time
              dateTime={new Date(item.publishedAt).toISOString()}
              className="text-[0.8rem] text-ink-500"
            >
              Published {formatDate(item.publishedAt)}
            </time>
            {item.branch ? (
              <span className="text-[0.8rem] text-ink-500">{item.branch.shortName}</span>
            ) : (
              <span className="text-[0.8rem] text-ink-500">Institution-wide</span>
            )}
          </div>

          {item.summary ? (
            <p className="mt-6 border-l-2 border-gold-500 pl-4 text-[1rem] leading-relaxed text-ink-700">
              {item.summary}
            </p>
          ) : null}

          {item.body ? (
            <div className="prose-content mt-6">
              {item.body
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          ) : null}

          {item.attachmentUrl ? (
            <a
              href={item.attachmentUrl}
              className="mt-7 inline-flex h-10 items-center rounded-sm border border-ink-300 px-4 text-[0.82rem] font-semibold text-ink-800 transition-colors hover:border-brand-700 hover:text-brand-700"
            >
              Download attachment
            </a>
          ) : null}

          <div className="mt-10 border-t border-ink-200 pt-5">
            <Link
              href={`${base}/news`}
              className="text-[0.82rem] font-semibold uppercase tracking-wider text-brand-700 underline underline-offset-4"
            >
              ← Back to all notices
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
