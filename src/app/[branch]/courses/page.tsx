import type { Metadata } from "next";
import { CourseGrid } from "@/components/site/course-grid";
import { PageHeader } from "@/components/site/page-header";
import { ButtonLink } from "@/components/ui/button";
import { getCourses } from "@/lib/data/content";
import { requireBranch } from "@/lib/data/require-branch";

export const revalidate = 600;

type Props = { params: Promise<{ branch: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  return {
    title: "Courses & Combinations",
    description: `Pre-University combinations offered at ${branch.name}.`,
  };
}

export default async function BranchCoursesPage({ params }: Props) {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  const courses = await getCourses(branch.id);

  return (
    <>
      <PageHeader
        title="Courses & Combinations"
        description="Two-year Pre-University course under the Karnataka Pre-University Board."
        crumbs={[
          { label: "Home", href: `/${branch.slug}` },
          { label: "Courses" },
        ]}
      />

      <section className="py-12">
        <div className="container-site">
          <CourseGrid courses={courses} />

          <div className="mt-10 flex flex-col items-start gap-4 border border-ink-200 bg-ink-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold text-ink-900">
                Not sure which combination suits you?
              </h2>
              <p className="mt-1 text-[0.88rem] text-ink-600">
                Our career guidance cell will help you choose. Call the office or
                submit an application and mention your preference.
              </p>
            </div>
            <ButtonLink href={`/${branch.slug}/admissions`} variant="primary">
              Apply online
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
