import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { ButtonLink } from "@/components/ui/button";
import { requireBranch } from "@/lib/data/require-branch";
import { formatPhone, telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Application received",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ branch: string }>;
  searchParams: Promise<{ ref?: string }>;
};

export default async function AdmissionSubmittedPage({ params, searchParams }: Props) {
  const { branch: slug } = await params;
  const { ref } = await searchParams;
  const branch = await requireBranch(slug);

  return (
    <>
      <PageHeader
        title="Your application has been received"
        crumbs={[
          { label: "Home", href: `/${branch.slug}` },
          { label: "Admissions", href: `/${branch.slug}/admissions` },
          { label: "Submitted" },
        ]}
      />

      <section className="py-14">
        <div className="container-site max-w-2xl text-center">
          <span
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: "var(--branch-color)" }}
            aria-hidden
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
              <path d="M9.6 16.2 5.4 12l-1.4 1.4 5.6 5.6L20.4 8.2 19 6.8z" />
            </svg>
          </span>

          <h2 className="mt-6 font-serif text-2xl font-semibold text-ink-900">
            Thank you for applying to {branch.shortName}
          </h2>

          {ref ? (
            <div className="mx-auto mt-6 inline-block border-2 border-dashed border-ink-300 bg-ink-50 px-6 py-4">
              <p className="text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-ink-500">
                Your application reference
              </p>
              <p className="mt-1 font-serif text-xl font-semibold text-brand-700">
                {ref}
              </p>
            </div>
          ) : null}

          <p className="mt-6 text-[0.95rem] leading-relaxed text-ink-600">
            Please note this reference number down. Our office will contact you on the
            mobile number you provided to arrange document verification. Keep your
            SSLC marks card and other originals ready for that visit.
          </p>

          {branch.phone ? (
            <p className="mt-4 text-[0.9rem] text-ink-600">
              For any question, call{" "}
              <a
                href={telHref(branch.phone)}
                className="font-semibold text-brand-700 underline underline-offset-4"
              >
                {formatPhone(branch.phone) || branch.phone}
              </a>
              .
            </p>
          ) : null}

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href={`/${branch.slug}`} variant="primary">
              Back to campus home
            </ButtonLink>
            <ButtonLink href={`/${branch.slug}/courses`} variant="outline">
              View combinations
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
