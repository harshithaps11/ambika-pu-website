import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { getCourses } from "@/lib/data/content";
import { requireBranch } from "@/lib/data/require-branch";
import { formatPhone, telHref } from "@/lib/utils";
import { AdmissionForm } from "./admission-form";

type Props = { params: Promise<{ branch: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  return {
    title: "Online Admission Application",
    description: `Apply online for the Pre-University course at ${branch.name}.`,
  };
}

const DOCUMENTS = [
  "SSLC / Class 10 marks card (original and two photocopies)",
  "Transfer Certificate from the school last attended",
  "Conduct / Character certificate",
  "Caste and income certificates, where applicable",
  "Aadhaar card copy of the student",
  "Four recent passport-size photographs",
];

export default async function AdmissionsPage({ params }: Props) {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  const courses = await getCourses(branch.id);

  return (
    <>
      <PageHeader
        title="Online Admission Application"
        description={`First year Pre-University course at ${branch.shortName}.`}
        crumbs={[{ label: "Home", href: `/${branch.slug}` }, { label: "Admissions" }]}
      />

      <section className="py-12">
        <div className="container-site grid gap-10 lg:grid-cols-[1.7fr_1fr]">
          <div>
            {!branch.admissionOpen ? (
              <div className="mb-8 border-l-4 border-gold-500 bg-gold-100 px-4 py-3 text-[0.88rem] text-ink-800">
                Online admissions for this campus are currently closed. You may still
                submit the form as an enquiry and the office will contact you when
                applications reopen.
              </div>
            ) : null}

            {branch.admissionNote ? (
              <p className="mb-8 text-[0.92rem] leading-relaxed text-ink-600">
                {branch.admissionNote}
              </p>
            ) : null}

            <AdmissionForm
              branchSlug={branch.slug}
              courses={courses.map((course) => ({
                id: course.id,
                code: course.code,
                name: course.name,
                stream: course.stream,
              }))}
              defaultDistrict={branch.district}
              defaultState={branch.state}
            />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-20 lg:h-fit">
            <div className="border border-ink-200 bg-ink-50 p-5">
              <h2 className="font-serif text-base font-semibold text-ink-900">
                Documents to keep ready
              </h2>
              <ul className="mt-3 space-y-2 text-[0.84rem] text-ink-600">
                {DOCUMENTS.map((document) => (
                  <li key={document} className="flex gap-2">
                    <span
                      aria-hidden
                      className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rotate-45"
                      style={{ backgroundColor: "var(--branch-color)" }}
                    />
                    {document}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.78rem] text-ink-500">
                Originals are needed only at the time of verification at the campus.
              </p>
            </div>

            <div
              className="p-5 text-white"
              style={{ backgroundColor: "var(--branch-color)" }}
            >
              <h2 className="font-serif text-base font-semibold text-white">
                Need help with the form?
              </h2>
              <p className="mt-2 text-[0.84rem] text-white/80">
                Call the admission office during working hours and we will help you
                complete it.
              </p>
              {branch.phone ? (
                <a
                  href={telHref(branch.phone)}
                  className="mt-3 inline-block font-serif text-lg font-semibold text-gold-300 underline underline-offset-4"
                >
                  {formatPhone(branch.phone) || branch.phone}
                </a>
              ) : null}
              {branch.email ? (
                <p className="mt-1 text-[0.82rem] text-white/80">{branch.email}</p>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
