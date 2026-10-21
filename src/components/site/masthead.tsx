import Link from "next/link";
import { Crest } from "@/components/brand/crest";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/config/site";

export function Masthead({
  homeHref,
  title,
  subtitle,
  affiliation,
  applyHref,
  admissionOpen = true,
}: {
  homeHref: string;
  title: string;
  subtitle?: string | null;
  affiliation?: string | null;
  applyHref?: string;
  admissionOpen?: boolean;
}) {
  return (
    <div className="border-b border-ink-200 bg-white">
      <div className="container-site flex items-center justify-between gap-4 py-3.5">
        <Link href={homeHref} className="flex items-center gap-3.5 sm:gap-4">
          <Crest className="h-12 text-brand-700 sm:h-16" />

          <span className="block">
            <span className="block font-serif text-[1.05rem] font-semibold leading-tight text-ink-900 sm:text-[1.45rem]">
              {title}
            </span>
            {subtitle ? (
              <span className="mt-0.5 block text-[0.68rem] font-medium uppercase tracking-[0.1em] text-brand-700 sm:text-[0.74rem]">
                {subtitle}
              </span>
            ) : null}
            {affiliation ? (
              <span className="mt-1 hidden text-[0.7rem] leading-snug text-ink-500 sm:block">
                {affiliation}
              </span>
            ) : null}
          </span>
        </Link>

        {applyHref ? (
          <div className="hidden shrink-0 flex-col items-end gap-1 lg:flex">
            <ButtonLink href={applyHref} variant="gold" size="md">
              {admissionOpen ? "Apply Online" : "Admission Enquiry"}
            </ButtonLink>
            <span className="text-[0.68rem] text-ink-500">
              Admissions {admissionOpen ? "open" : "enquiries"} for {new Date().getFullYear()}–
              {String(new Date().getFullYear() + 1).slice(2)}
            </span>
          </div>
        ) : (
          <span className="hidden text-right text-[0.72rem] leading-snug text-ink-500 lg:block">
            {site.trust}
          </span>
        )}
      </div>
    </div>
  );
}
