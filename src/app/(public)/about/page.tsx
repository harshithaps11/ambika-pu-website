import type { Metadata } from "next";
import { BranchCard } from "@/components/site/branch-card";
import { PageHeader } from "@/components/site/page-header";
import { StatsStrip } from "@/components/site/stats-strip";
import { SectionHeading } from "@/components/ui/section-heading";
import { site, fullAddress } from "@/config/site";
import { getBranchCards } from "@/lib/data/branches";
import { getPageContent, getStats } from "@/lib/data/content";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "About the Institution",
  description: `About ${site.englishName}, ${site.address.city} — history, management, vision and mission.`,
};

const CAMPUS_IMAGES = ["/images/campus-1.svg", "/images/campus-4.svg"];

function Prose({ body }: { body: string }) {
  return (
    <div className="prose-content">
      {body
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((paragraph, index) =>
          paragraph.startsWith("**") && paragraph.endsWith("**") ? (
            <h3 key={index}>{paragraph.replaceAll("**", "")}</h3>
          ) : (
            <p key={index}>{paragraph}</p>
          ),
        )}
    </div>
  );
}

export default async function AboutPage() {
  const [about, visionMission, stats, branches] = await Promise.all([
    getPageContent("about", null),
    getPageContent("vision-mission", null),
    getStats(null),
    getBranchCards(),
  ]);

  return (
    <>
      <PageHeader
        title="About the Institution"
        description={`${site.affiliation}. Managed by ${site.trust}.`}
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <section className="py-12">
        <div className="container-site grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <SectionHeading
              eyebrow={`Established ${site.establishedYear}`}
              title={about?.title ?? "About the Institution"}
            />
            <div className="mt-5">{about?.body ? <Prose body={about.body} /> : null}</div>
          </div>

          <aside className="h-fit border border-ink-200 bg-ink-50 p-5">
            <h2 className="font-serif text-base font-semibold text-ink-900">
              At a glance
            </h2>
            <dl className="mt-4 space-y-3 text-[0.85rem]">
              <div>
                <dt className="text-ink-500">Institution</dt>
                <dd className="font-semibold text-ink-800">{site.name}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Managed by</dt>
                <dd className="font-semibold text-ink-800">{site.trust}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Affiliation</dt>
                <dd className="font-semibold text-ink-800">{site.affiliation}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Campuses</dt>
                <dd className="font-semibold text-ink-800">{branches.length}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Head office</dt>
                <dd className="font-semibold text-ink-800">{fullAddress()}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <StatsStrip stats={stats} />

      {visionMission?.body ? (
        <section id="vision" className="scroll-mt-16 bg-ink-50 py-12">
          <div className="container-site max-w-3xl">
            <SectionHeading
              eyebrow="What we work towards"
              title={visionMission.title ?? "Vision & Mission"}
            />
            <div className="mt-5">
              <Prose body={visionMission.body} />
            </div>
          </div>
        </section>
      ) : null}

      <section id="management" className="scroll-mt-16 py-12">
        <div className="container-site">
          <SectionHeading
            eyebrow="Two campuses, one institution"
            title="Our Campuses"
          />
          <div className="mt-8 grid gap-7 md:grid-cols-2">
            {branches.map((branch, index) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                imageUrl={CAMPUS_IMAGES[index % CAMPUS_IMAGES.length]}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
