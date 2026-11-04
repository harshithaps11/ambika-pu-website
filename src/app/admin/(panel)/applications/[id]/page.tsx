import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader, Panel, StatusPill } from "@/components/admin/ui";
import { ApplicationStatus, Capability } from "@/generated/prisma/enums";
import { isDatabaseConfigured } from "@/lib/data/mock-data";
import { can, canAccessBranch, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime, telHref } from "@/lib/utils";
import { ReviewForm } from "./review-form";

export const metadata = { title: "Application" };

type Props = { params: Promise<{ id: string }> };

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-4 px-5 py-2.5">
      <dt className="w-44 shrink-0 text-ink-500">{label}</dt>
      <dd className="min-w-0 font-medium text-ink-800">{value || "—"}</dd>
    </div>
  );
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await requireCapability(Capability.APPLICATION_VIEW);

  let application: any = null;

  if (!isDatabaseConfigured()) {
    application = {
      id,
      applicationNo: "AMB-NLK-2026-00001",
      branchId: "branch_nellikatte",
      courseId: "course_nel_pcmb",
      studentName: "Aishwarya Hegde",
      dateOfBirth: new Date(2009, 4, 15),
      gender: "FEMALE",
      email: "aishwarya.sample@example.com",
      phone: "9845012345",
      altPhone: "9845099999",
      fatherName: "Shri. Ramesh Hegde",
      motherName: "Smt. Geetha Hegde",
      guardianPhone: "9845012345",
      guardianOccupation: "Agriculture / Business",
      addressLine1: "Near Mahalingeshwara Temple",
      addressLine2: "Main Road",
      city: "Puttur",
      district: "Dakshina Kannada",
      state: "Karnataka",
      pincode: "574201",
      category: "General",
      sslcBoard: "Karnataka Secondary Education Examination Board (KSEEB)",
      sslcSchool: "Vivekananda High School, Puttur",
      sslcYear: 2025,
      sslcRegisterNo: "2025091283",
      sslcMarks: 580,
      sslcMaxMarks: 625,
      sslcPercentage: 92.8,
      preferredCombination: "PCMB",
      secondLanguage: "Kannada",
      hostelRequired: true,
      transportRequired: false,
      sportsQuota: false,
      status: ApplicationStatus.SUBMITTED,
      officeNotes: "Applicant scored distinction in SSLC. Called for initial document verification on Friday.",
      reviewedAt: null,
      reviewedById: null,
      createdAt: new Date(Date.now() - 3600000 * 4),
      updatedAt: new Date(Date.now() - 3600000 * 4),
      branch: { shortName: "Nellikatte Campus", slug: "nellikatte" },
      course: { code: "PCMB", name: "Physics, Chemistry, Mathematics, Biology" },
      reviewedBy: null,
    };
  } else {
    try {
      application = await prisma.application.findUnique({
        where: { id },
        include: {
          branch: { select: { shortName: true, slug: true } },
          course: { select: { code: true, name: true } },
          reviewedBy: { select: { name: true } },
        },
      });
    } catch (err) {
      console.error("Application detail query error:", err);
    }
  }

  if (!application) notFound();

  // A scoped account must not read an application from another campus.
  if (!canAccessBranch(user, application.branchId)) notFound();

  const address = [
    application.addressLine1,
    application.addressLine2,
    application.city,
    application.district,
    application.state,
    application.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <AdminPageHeader
        title={application.studentName}
        description={`${application.applicationNo} · ${application.branch.shortName}`}
        action={
          <Link
            href="/admin/applications"
            className="text-[0.8rem] font-semibold text-ink-600 underline underline-offset-4"
          >
            ← Back to list
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <StatusPill status={application.status} />
        <span className="text-[0.8rem] text-ink-500">
          Received {formatDateTime(application.createdAt)}
        </span>
        {application.reviewedBy ? (
          <span className="text-[0.8rem] text-ink-500">
            · Last updated by {application.reviewedBy.name}
            {application.reviewedAt ? ` on ${formatDate(application.reviewedAt)}` : ""}
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Panel title="Student">
            <dl className="divide-y divide-ink-200 text-[0.85rem]">
              <Row label="Full name" value={application.studentName} />
              <Row label="Date of birth" value={formatDate(application.dateOfBirth)} />
              <Row label="Gender" value={application.gender} />
              <Row label="Category" value={application.category} />
              <Row label="Religion" value={application.religion} />
            </dl>
          </Panel>

          <Panel title="Contact">
            <dl className="divide-y divide-ink-200 text-[0.85rem]">
              <div className="flex gap-4 px-5 py-2.5">
                <dt className="w-44 shrink-0 text-ink-500">Mobile</dt>
                <dd className="font-medium">
                  <a
                    href={telHref(application.phone)}
                    className="text-brand-700 underline underline-offset-4"
                  >
                    {application.phone}
                  </a>
                </dd>
              </div>
              <Row label="Alternate mobile" value={application.altPhone} />
              <div className="flex gap-4 px-5 py-2.5">
                <dt className="w-44 shrink-0 text-ink-500">Email</dt>
                <dd className="min-w-0 break-words font-medium">
                  <a
                    href={`mailto:${application.email}`}
                    className="text-brand-700 underline underline-offset-4"
                  >
                    {application.email}
                  </a>
                </dd>
              </div>
              <Row label="Address" value={address} />
            </dl>
          </Panel>

          <Panel title="Parent or guardian">
            <dl className="divide-y divide-ink-200 text-[0.85rem]">
              <Row label="Father" value={application.fatherName} />
              <Row label="Mother" value={application.motherName} />
              <Row label="Guardian mobile" value={application.guardianPhone} />
              <Row label="Occupation" value={application.guardianOccupation} />
            </dl>
          </Panel>

          <Panel title="Previous education">
            <dl className="divide-y divide-ink-200 text-[0.85rem]">
              <Row label="Board" value={application.sslcBoard} />
              <Row label="School" value={application.sslcSchool} />
              <Row label="Register number" value={application.sslcRegisterNo} />
              <Row label="Year of passing" value={application.sslcYear?.toString()} />
              <Row
                label="Percentage"
                value={
                  application.sslcPercentage !== null
                    ? `${application.sslcPercentage}%`
                    : null
                }
              />
            </dl>
          </Panel>

          {application.remarksFromApplicant ? (
            <Panel title="Remarks from the applicant">
              <p className="px-5 py-4 text-[0.88rem] leading-relaxed text-ink-700">
                {application.remarksFromApplicant}
              </p>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-6">
          <Panel title="Course applied for">
            <dl className="divide-y divide-ink-200 text-[0.85rem]">
              <Row
                label="Combination"
                value={
                  application.course
                    ? `${application.course.code} — ${application.course.name}`
                    : application.preferredCombination
                }
              />
              <Row label="Campus" value={application.branch.shortName} />
            </dl>
          </Panel>

          {can(user, Capability.APPLICATION_MANAGE) ? (
            <Panel title="Review">
              <ReviewForm
                id={application.id}
                status={application.status}
                internalNotes={application.internalNotes}
              />
            </Panel>
          ) : (
            <Panel title="Office notes">
              <p className="px-5 py-4 text-[0.85rem] text-ink-600">
                {application.internalNotes || "No notes have been added."}
              </p>
              <p className="border-t border-ink-200 px-5 py-3 text-[0.76rem] text-ink-500">
                You can view applications but not change them. Ask the site owner for
                the &ldquo;Update application status&rdquo; permission if you need it.
              </p>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
