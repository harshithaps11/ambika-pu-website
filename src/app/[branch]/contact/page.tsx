import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { requireBranch } from "@/lib/data/require-branch";
import { formatPhone, telHref } from "@/lib/utils";

type Props = { params: Promise<{ branch: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  return { title: `Contact — ${branch.shortName}` };
}

export default async function BranchContactPage({ params }: Props) {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);

  const address = [
    branch.addressLine1,
    branch.addressLine2,
    branch.city,
    branch.district,
    branch.state,
    branch.pincode,
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        title="Contact Us"
        description={`Reach the office of ${branch.shortName}.`}
        crumbs={[{ label: "Home", href: `/${branch.slug}` }, { label: "Contact" }]}
      />

      <section className="py-12">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading eyebrow="Office" title="Address & contact" />

            <address className="mt-5 space-y-4 text-[0.92rem] not-italic leading-relaxed text-ink-700">
              <div>
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  Postal address
                </p>
                <p className="mt-1">{address.join(", ")}</p>
              </div>

              {branch.phone ? (
                <div>
                  <p className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
                    Telephone
                  </p>
                  <p className="mt-1">
                    <a
                      href={telHref(branch.phone)}
                      className="font-semibold text-brand-700 underline underline-offset-4"
                    >
                      {formatPhone(branch.phone) || branch.phone}
                    </a>
                    {branch.altPhone ? (
                      <>
                        {" · "}
                        <a
                          href={telHref(branch.altPhone)}
                          className="font-semibold text-brand-700 underline underline-offset-4"
                        >
                          {formatPhone(branch.altPhone) || branch.altPhone}
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
              ) : null}

              {branch.email ? (
                <div>
                  <p className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
                    Email
                  </p>
                  <p className="mt-1">
                    <a
                      href={`mailto:${branch.email}`}
                      className="font-semibold text-brand-700 underline underline-offset-4"
                    >
                      {branch.email}
                    </a>
                  </p>
                </div>
              ) : null}

              <div>
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  Office hours
                </p>
                <p className="mt-1">
                  Monday to Friday, 9:00 am – 4:30 pm
                  <br />
                  Saturday, 9:00 am – 12:30 pm
                </p>
              </div>
            </address>

            {branch.whatsappNo ? (
              <a
                href={`https://wa.me/${branch.whatsappNo.replace(/\D/g, "")}`}
                rel="noopener noreferrer"
                target="_blank"
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-sm bg-emerald-700 px-4 text-[0.82rem] font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                Chat on WhatsApp
              </a>
            ) : null}
          </div>

          <div>
            <SectionHeading eyebrow="Enquiry" title="Send us a message" />
            <div className="mt-5">
              <ContactForm branchSlug={branch.slug} />
            </div>
          </div>
        </div>

        {branch.mapEmbedUrl ? (
          <div className="container-site mt-12">
            <div className="aspect-[16/7] w-full overflow-hidden border border-ink-200">
              <iframe
                src={branch.mapEmbedUrl}
                title={`Map to ${branch.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
              />
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
