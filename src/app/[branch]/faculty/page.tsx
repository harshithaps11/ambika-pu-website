import type { Metadata } from "next";
import { Avatar } from "@/components/site/avatar";
import { PageHeader } from "@/components/site/page-header";
import { getFaculty } from "@/lib/data/content";
import { requireBranch } from "@/lib/data/require-branch";

export const revalidate = 600;

type Props = { params: Promise<{ branch: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  return { title: `Faculty — ${branch.shortName}` };
}

export default async function BranchFacultyPage({ params }: Props) {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  const faculty = await getFaculty(branch.id);

  const departments = [...new Set(faculty.map((member) => member.department ?? "Faculty"))];

  return (
    <>
      <PageHeader
        title="Faculty"
        description="Teaching and administrative staff of this campus."
        crumbs={[
          { label: "Home", href: `/${branch.slug}` },
          { label: "Faculty" },
        ]}
      />

      <section className="py-12">
        <div className="container-site space-y-12">
          {faculty.length === 0 ? (
            <p className="border border-dashed border-ink-300 bg-ink-50 px-5 py-10 text-center text-sm text-ink-500">
              Faculty profiles have not been published yet.
            </p>
          ) : (
            departments.map((department) => (
              <div key={department}>
                <h2 className="rule-gold font-serif text-xl font-semibold text-ink-900">
                  {department}
                </h2>

                <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {faculty
                    .filter((member) => (member.department ?? "Faculty") === department)
                    .map((member) => (
                      <li
                        key={member.id}
                        className="flex gap-4 border border-ink-200 bg-white p-4 shadow-card"
                      >
                        <Avatar
                          name={member.name}
                          src={member.photoUrl}
                          rounded="sm"
                          className="h-20 w-16 shrink-0 text-lg"
                        />

                        <div className="min-w-0">
                          <h3 className="font-serif text-[1rem] font-semibold leading-snug text-ink-900">
                            {member.name}
                          </h3>
                          <p className="mt-0.5 text-[0.8rem] font-medium text-brand-700">
                            {member.designation}
                          </p>
                          {member.qualification ? (
                            <p className="mt-1 text-[0.78rem] text-ink-600">
                              {member.qualification}
                            </p>
                          ) : null}
                          {member.experienceYears ? (
                            <p className="mt-0.5 text-[0.75rem] text-ink-500">
                              {member.experienceYears} years of experience
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
