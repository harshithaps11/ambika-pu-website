import Link from "next/link";
import { BranchCard } from "@/components/site/branch-card";
import { HeroSlider } from "@/components/site/hero-slider";
import { NoticeBoard } from "@/components/site/notice-board";
import { PrincipalMessage } from "@/components/site/principal-message";
import { QuickLinks } from "@/components/site/quick-links";
import { StatsStrip } from "@/components/site/stats-strip";
import { ToppersStrip } from "@/components/site/toppers-strip";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/config/site";
import { branchHref } from "@/lib/branch-routing";
import { getBranchCards } from "@/lib/data/branches";
import {
  getAlbums,
  getFeaturedToppers,
  getHeroSlides,
  getPageContent,
  getStats,
} from "@/lib/data/content";
import { getLatestNews } from "@/lib/data/news";

export const revalidate = 300;

const FALLBACK_CAMPUS_IMAGES = [
  "/images/campus-1.svg",
  "/images/campus-4.svg",
  "/images/campus-2.svg",
  "/images/campus-3.svg",
];

export default async function HomePage() {
  const [slides, branches, notices, stats, toppers, albums, welcome, management] =
    await Promise.all([
      getHeroSlides(null),
      getBranchCards(),
      getLatestNews({ allBranches: true, take: 6 }),
      getStats(null),
      getFeaturedToppers(),
      getAlbums(null, 4),
      getPageContent("welcome", null),
      getPageContent("management-message", null),
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

      <QuickLinks
        tiles={[
          { label: "Admissions", href: "/#campuses", icon: "admission" },
          { label: "Courses", href: "/#campuses", icon: "course" },
          { label: "Results", href: "/news?category=RESULT", icon: "result" },
          { label: "Gallery", href: "/gallery", icon: "gallery" },
          { label: "Notices", href: "/news?category=NOTICE", icon: "download" },
          { label: "Contact", href: "/contact", icon: "contact" },
        ]}
      />

      {/* Welcome + notice board */}
      <section className="py-14">
        <div className="container-site grid gap-10 lg:grid-cols-[1.55fr_1fr]">
          <div>
            <SectionHeading
              eyebrow={`Established ${site.establishedYear}`}
              title={welcome?.title ?? `Welcome to ${site.name}`}
            />

            {welcome?.body ? (
              <div className="prose-content mt-5">
                {welcome.body
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/about" variant="primary">
                About the Institution
              </ButtonLink>
              <ButtonLink href="#campuses" variant="outline">
                Explore our campuses
              </ButtonLink>
            </div>
          </div>

          <NoticeBoard items={notices} viewAllHref="/news" />
        </div>
      </section>

      {/* The two branch gateways */}
      <section id="campuses" className="scroll-mt-16 bg-ink-50 py-14">
        <div className="container-site">
          <SectionHeading
            align="center"
            eyebrow="Two campuses, one institution"
            title="Our Campuses"
            description="Each campus runs its own admissions, faculty and notices. Choose a campus to visit its website."
          />

          <div className="mt-10 grid gap-7 md:grid-cols-2">
            {branches.map((branch, index) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                imageUrl={
                  FALLBACK_CAMPUS_IMAGES[index % FALLBACK_CAMPUS_IMAGES.length]
                }
              />
            ))}
          </div>
        </div>
      </section>

      <StatsStrip stats={stats} />

      {management?.body ? (
        <PrincipalMessage
          name={management.title ?? site.trust}
          message={management.body}
          designation="Management"
        />
      ) : null}

      {/* Achievers */}
      {toppers.length ? (
        <section className="py-14">
          <div className="container-site">
            <SectionHeading
              align="center"
              eyebrow={`PUC Board Examination ${toppers[0].academicYear}`}
              title="Our Achievers"
              description="Congratulations to our students for their results in the Karnataka Second PUC examinations."
            />

            <div className="mt-9">
              <ToppersStrip
                toppers={toppers.map((topper) => ({
                  id: topper.id,
                  studentName: topper.studentName,
                  photoUrl: topper.photoUrl,
                  percentage: topper.percentage,
                  stream: topper.stream,
                  academicYear: topper.academicYear,
                  rankLabel: topper.rankLabel ?? topper.branch.shortName,
                }))}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* Gallery preview */}
      {albums.length ? (
        <section className="border-t border-ink-200 bg-ink-50 py-14">
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Campus life" title="Photo Gallery" />
              <Link
                href="/gallery"
                className="text-[0.8rem] font-semibold uppercase tracking-wider text-brand-700 underline underline-offset-4"
              >
                View all albums
              </Link>
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {albums.map((album, index) => (
                <li key={album.id}>
                  <Link
                    href={`/gallery/${album.slug}`}
                    className="group block overflow-hidden border border-ink-200 bg-white shadow-card transition-shadow hover:shadow-raise"
                  >
                    <span
                      className="block h-36 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.03]"
                      style={{
                        backgroundImage: `url('${
                          album.coverImageUrl ??
                          album.images[0]?.url ??
                          FALLBACK_CAMPUS_IMAGES[index % FALLBACK_CAMPUS_IMAGES.length]
                        }')`,
                      }}
                    />
                    <span className="block px-4 py-3">
                      <span className="block text-[0.88rem] font-semibold text-ink-800 group-hover:text-brand-700">
                        {album.title}
                      </span>
                      <span className="mt-0.5 block text-[0.72rem] text-ink-500">
                        {album._count.images} photographs
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Admission call to action */}
      <section
        className="py-12"
        style={{ backgroundColor: "var(--branch-color)" }}
      >
        <div className="container-site flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
          <div>
            <h2 className="font-serif text-[1.5rem] font-semibold text-white">
              Admissions are open for the new academic year
            </h2>
            <p className="mt-1.5 text-[0.92rem] text-white/80">
              Apply online to the campus of your choice. Our office will contact you
              after your application is received.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {branches.map((branch) => (
              <ButtonLink
                key={branch.id}
                href={branchHref(branch.slug, "/admissions")}
                variant="gold"
                size="lg"
              >
                Apply — {branch.shortName}
              </ButtonLink>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
