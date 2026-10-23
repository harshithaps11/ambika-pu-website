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
      <div className="container-wide flex items-center justify-between gap-4 py-2 sm:py-2.5">
        <Link href={homeHref} className="flex items-center gap-3.5 sm:gap-4">
          <Crest className="h-11 text-brand-700 sm:h-12 lg:h-14 shrink-0" />

          <span className="block">
            <span className="block font-serif text-[1.05rem] font-semibold leading-tight text-ink-900 sm:text-[1.3rem] lg:text-[1.5rem]">
              {title}
            </span>
            {subtitle ? (
              <span className="mt-0.5 block text-[0.68rem] font-medium uppercase tracking-[0.08em] text-brand-700 sm:text-[0.74rem]">
                {subtitle}
              </span>
            ) : null}
            {affiliation ? (
              <span className="mt-0.5 hidden text-[0.68rem] leading-snug text-ink-500 sm:block lg:text-[0.74rem]">
                {affiliation}
              </span>
            ) : null}
          </span>
        </Link>

        {applyHref ? (
          <div className="hidden shrink-0 flex-col items-end gap-0.5 lg:flex">
            <ButtonLink href={applyHref} variant="gold" size="sm" className="font-bold uppercase tracking-wider">
              {admissionOpen ? "Apply Online" : "Admission Enquiry"}
            </ButtonLink>
            <span className="text-[0.64rem] text-ink-500">
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
