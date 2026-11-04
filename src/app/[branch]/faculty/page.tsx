import type { Metadata } from "next";
import { FacultyGrid } from "@/components/site/faculty-grid";
import { PageHeader } from "@/components/site/page-header";
import { getFaculty } from "@/lib/data/content";
import { requireBranch } from "@/lib/data/require-branch";

export const revalidate = 600;

type Props = { params: Promise<{ branch: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  return { title: `Faculty & Staff — ${branch.shortName}` };
}

export default async function BranchFacultyPage({ params }: Props) {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  const faculty = await getFaculty(branch.id);

  return (
    <>
      <PageHeader
        title="Faculty & Teaching Staff"
        description={`Distinguished lecturers and academic staff of ${branch.shortName}.`}
        crumbs={[
          { label: "Home", href: `/${branch.slug}` },
          { label: "Faculty" },
        ]}
      />

      <section className="py-14 bg-texture-subtle min-h-[60vh]">
        <div className="container-site">
          {faculty.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center text-ink-500 shadow-sm">
              <span className="text-3xl">👨‍🏫</span>
              <p className="mt-3 text-base font-semibold text-ink-800">
                Faculty profiles are currently being updated.
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Please check back soon or contact the campus administration.
              </p>
            </div>
          ) : (
            <FacultyGrid faculty={faculty} />
          )}
        </div>
      </section>
    </>
  );
}
