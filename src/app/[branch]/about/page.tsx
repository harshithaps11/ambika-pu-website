import type { Metadata } from "next";
import { FacilitiesGrid } from "@/components/site/facilities-grid";
import { PageHeader } from "@/components/site/page-header";
import { PrincipalMessage } from "@/components/site/principal-message";
import { StatsStrip } from "@/components/site/stats-strip";
import { SectionHeading } from "@/components/ui/section-heading";
import { getFacilities, getPageContent, getStats } from "@/lib/data/content";
import { requireBranch } from "@/lib/data/require-branch";

export const revalidate = 600;

type Props = { params: Promise<{ branch: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  return { title: `About ${branch.shortName}` };
}

export default async function BranchAboutPage({ params }: Props) {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);

  const [stats, facilities, about] = await Promise.all([
    getStats(branch.id),
    getFacilities(branch.id),
    getPageContent("about", branch.id),
  ]);

  const body = branch.about ?? about?.body ?? "";

  return (
    <>
      <PageHeader
        title={`About ${branch.shortName}`}
        description={branch.tagline}
        crumbs={[
          { label: "Home", href: `/${branch.slug}` },
          { label: "About" },
        ]}
      />

      <section className="py-12">
        <div className="container-site grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="prose-content">
            {body
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>

          <aside className="h-fit border border-ink-200 bg-ink-50 p-5">
            <h2 className="font-serif text-base font-semibold text-ink-900">
              Campus at a glance
            </h2>
            <dl className="mt-4 space-y-3 text-[0.85rem]">
              {branch.establishedYear ? (
                <div>
                  <dt className="text-ink-500">Established</dt>
                  <dd className="font-semibold text-ink-800">
                    {branch.establishedYear}
                  </dd>
                </div>
              ) : null}
              {branch.affiliation ? (
                <div>
                  <dt className="text-ink-500">Affiliation</dt>
                  <dd className="font-semibold text-ink-800">{branch.affiliation}</dd>
                </div>
              ) : null}
              {branch.principalName ? (
                <div>
                  <dt className="text-ink-500">Principal</dt>
                  <dd className="font-semibold text-ink-800">
                    {branch.principalName}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-ink-500">Address</dt>
                <dd className="font-semibold text-ink-800">
                  {[
                    branch.addressLine1,
                    branch.addressLine2,
                    branch.city,
                    branch.district,
                    branch.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <StatsStrip stats={stats} />

      {branch.principalName && branch.principalMessage ? (
        <PrincipalMessage
          name={branch.principalName}
          message={branch.principalMessage}
          photoUrl={branch.principalPhotoUrl}
        />
      ) : null}

      {facilities.length ? (
        <section className="py-14">
          <div className="container-site">
            <SectionHeading eyebrow="On campus" title="Facilities" />
            <div className="mt-8">
              <FacilitiesGrid facilities={facilities} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
