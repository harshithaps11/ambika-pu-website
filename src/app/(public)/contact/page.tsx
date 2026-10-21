import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/site/contact-form";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { site, fullAddress } from "@/config/site";
import { branchHref } from "@/lib/branch-routing";
import { getBranchCards } from "@/lib/data/branches";
import { formatPhone, telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact details for ${site.englishName} and both of its campuses.`,
};

export default async function ContactPage() {
  const branches = await getBranchCards();

  return (
    <>
      <PageHeader
        title="Contact Us"
        description="Reach the institution or either campus directly."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="py-12">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading eyebrow="Head office" title="Institution" />

            <address className="mt-5 space-y-4 text-[0.92rem] not-italic leading-relaxed text-ink-700">
              <div>
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  Postal address
                </p>
                <p className="mt-1">{fullAddress()}</p>
              </div>
              <div>
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  Telephone
                </p>
                <p className="mt-1">
                  <a
                    href={telHref(site.contact.phone)}
                    className="font-semibold text-brand-700 underline underline-offset-4"
                  >
                    {formatPhone(site.contact.phone) || site.contact.phone}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  Email
                </p>
                <p className="mt-1">
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="font-semibold text-brand-700 underline underline-offset-4"
                  >
                    {site.contact.email}
                  </a>
                </p>
              </div>
            </address>

            <div className="mt-8">
              <SectionHeading eyebrow="Campuses" title="Reach a campus directly" />
              <ul className="mt-5 space-y-4">
                {branches.map((branch) => (
                  <li key={branch.id} className="border border-ink-200 bg-white p-4">
                    <p className="font-serif text-[1rem] font-semibold text-ink-900">
                      {branch.shortName}
                    </p>
                    <p className="mt-1 text-[0.84rem] text-ink-600">
                      {[branch.city, branch.district].filter(Boolean).join(", ")}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.84rem]">
                      {branch.phone ? (
                        <a
                          href={telHref(branch.phone)}
                          className="font-semibold text-brand-700 underline underline-offset-4"
                        >
                          {formatPhone(branch.phone) || branch.phone}
                        </a>
                      ) : null}
                      <Link
                        href={branchHref(branch.slug, "/contact")}
                        className="font-semibold text-brand-700 underline underline-offset-4"
                      >
                        Campus contact page →
                      </Link>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="Enquiry" title="Send us a message" />
            <p className="mt-3 text-[0.9rem] text-ink-600">
              For an admission enquiry about a specific campus, please use that
              campus&rsquo;s contact page so it reaches the right office.
            </p>
            <div className="mt-5">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
