import { notFound } from "next/navigation";
import { CourseGrid } from "@/components/site/course-grid";
import { FacilitiesGrid } from "@/components/site/facilities-grid";
import { HeroSlider } from "@/components/site/hero-slider";
import { NoticeBoard } from "@/components/site/notice-board";
import { PrincipalMessage } from "@/components/site/principal-message";
import { StatsStrip } from "@/components/site/stats-strip";
import { ToppersStrip } from "@/components/site/toppers-strip";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getBranchBySlug } from "@/lib/data/branches";
import {
  getCourses,
  getFacilities,
  getHeroSlides,
  getStats,
  getToppers,
} from "@/lib/data/content";
import { getLatestNews } from "@/lib/data/news";

export const revalidate = 300;

export default async function BranchHomePage({
  params,
}: {
  params: Promise<{ branch: string }>;
}) {
  const { branch: slug } = await params;
  const branch = await getBranchBySlug(slug);

  if (!branch) notFound();

  const base = `/${branch.slug}`;

  const [slides, courses, notices, stats, toppers, facilities] = await Promise.all([
    getHeroSlides(branch.id),
    getCourses(branch.id),
    getLatestNews({ branchId: branch.id, take: 6 }),
    getStats(branch.id),
    getToppers(branch.id),
    getFacilities(branch.id),
  ]);

  return (
    <>
      <HeroSlider
        slides={slides.map((slide) => ({
          id: slide.id,
          imageUrl: slide.imageUrl,
          headline: slide.headline,
          subtext: slide.subtext,
          ctaLabel: slide.ctaLabel,
          ctaUrl: slide.ctaUrl,
        }))}
      />

      <section className="py-14">
        <div className="container-site grid gap-10 lg:grid-cols-[1.55fr_1fr]">
          <div>
            <SectionHeading
              eyebrow={
                branch.establishedYear
                  ? `Established ${branch.establishedYear}`
                  : undefined
              }
              title={`About ${branch.shortName}`}
            />

            {branch.about ? (
              <div className="prose-content mt-5">
                {branch.about
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            ) : null}

            {branch.admissionNote ? (
              <div
                className="mt-6 border-l-2 bg-ink-50 px-4 py-3 text-[0.88rem] text-ink-700"
                style={{ borderColor: "var(--branch-color)" }}
              >
                {branch.admissionNote}
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={`${base}/admissions`} variant="primary">
                Apply for admission
              </ButtonLink>
              <ButtonLink href={`${base}/about`} variant="outline">
                More about this campus
              </ButtonLink>
            </div>
          </div>

          <NoticeBoard
            items={notices}
            basePath={base}
            viewAllHref={`${base}/news`}
            title="Campus Notices"
          />
        </div>
      </section>

      <section className="border-t border-ink-200 bg-ink-50 py-14">
        <div className="container-site">
          <SectionHeading
            eyebrow="Pre-University Course"
            title="Combinations offered"
            description="All combinations follow the syllabus prescribed by the Karnataka Pre-University Board."
          />
          <div className="mt-9">
            <CourseGrid courses={courses} />
          </div>
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

      {toppers.length ? (
        <section className="py-14">
          <div className="container-site">
            <SectionHeading
              align="center"
              eyebrow={`Second PUC ${toppers[0].academicYear}`}
              title="Our Toppers"
            />
            <div className="mt-9">
              <ToppersStrip toppers={toppers} />
            </div>
          </div>
        </section>
      ) : null}

      {facilities.length ? (
        <section className="border-t border-ink-200 bg-ink-50 py-14">
          <div className="container-site">
            <SectionHeading eyebrow="On campus" title="Facilities" />
            <div className="mt-9">
              <FacilitiesGrid facilities={facilities} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-12" style={{ backgroundColor: "var(--branch-color)" }}>
        <div className="container-site flex flex-col items-center gap-5 text-center lg:flex-row lg:justify-between lg:text-left">
          <div>
            <h2 className="font-serif text-[1.5rem] font-semibold text-white">
              {branch.admissionOpen
                ? "Admissions are open at this campus"
                : "Admission enquiries welcome"}
            </h2>
            <p className="mt-1.5 text-[0.92rem] text-white/80">
              Fill the online form and our office will call you to arrange document
              verification.
            </p>
          </div>

          <ButtonLink href={`${base}/admissions`} variant="gold" size="lg">
            Apply Online
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
