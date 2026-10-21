import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { branchHref } from "@/lib/branch-routing";
import type { BranchCard as BranchCardData } from "@/lib/data/branches";
import { truncate } from "@/lib/utils";

/**
 * The two gateway panels on the landing page. Each one is the entrance to a
 * campus's own site, so it carries that campus's accent colour and its own
 * admission call to action.
 */
export function BranchCard({
  branch,
  imageUrl,
}: {
  branch: BranchCardData;
  imageUrl: string;
}) {
  const href = branchHref(branch.slug);
  const location = [branch.city, branch.district].filter(Boolean).join(", ");

  return (
    <article
      className="group relative flex flex-col overflow-hidden border border-ink-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raise"
      style={{ ["--branch-color" as string]: branch.themeColor }}
    >
      <span
        aria-hidden
        className="block h-1.5 w-full"
        style={{ backgroundColor: branch.themeColor }}
      />

      <div
        className="relative h-44 bg-cover bg-center sm:h-52"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />

        {branch.admissionOpen ? (
          <span className="absolute right-3 top-3">
            <Badge tone="green">Admissions Open</Badge>
          </span>
        ) : null}

        <div className="absolute bottom-0 left-0 p-4">
          {location ? (
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-gold-300">
              {location}
            </p>
          ) : null}
          <h3 className="mt-1 font-serif text-xl font-semibold leading-tight text-white sm:text-[1.4rem]">
            {branch.shortName}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {branch.tagline ? (
          <p
            className="text-[0.78rem] font-semibold uppercase tracking-[0.1em]"
            style={{ color: branch.themeColor }}
          >
            {branch.tagline}
          </p>
        ) : null}

        {branch.about ? (
          <p className="mt-2.5 text-[0.88rem] leading-relaxed text-ink-600">
            {truncate(branch.about, 180)}
          </p>
        ) : null}

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-ink-200 py-3 text-[0.78rem]">
          {branch.establishedYear ? (
            <div>
              <dt className="text-ink-500">Established</dt>
              <dd className="font-semibold text-ink-800">{branch.establishedYear}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-ink-500">Combinations</dt>
            <dd className="font-semibold text-ink-800">{branch._count.courses}</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={href}
            className="inline-flex h-10 items-center gap-2 rounded-sm px-5 text-[0.8rem] font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: branch.themeColor }}
          >
            Visit Campus Site
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4L11.6 10 7.3 5.7a1 1 0 010-1.4z" />
            </svg>
          </Link>

          <Link
            href={branchHref(branch.slug, "/admissions")}
            className="text-[0.8rem] font-semibold text-ink-700 underline underline-offset-4 transition-colors hover:text-brand-700"
          >
            Apply online
          </Link>
        </div>
      </div>
    </article>
  );
}
