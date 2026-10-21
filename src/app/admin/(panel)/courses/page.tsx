import Link from "next/link";
import { AdminPageHeader, DataTable, EmptyState, Panel } from "@/components/admin/ui";
import { ResourceForm, type FieldSpec } from "@/components/admin/resource-form";
import { Badge } from "@/components/ui/badge";
import { Capability } from "@/generated/prisma/enums";
import { deleteCourse, saveCourse } from "@/lib/actions/content";
import { allowedBranchIds, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Courses" };

export default async function CoursesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireCapability(Capability.COURSE_MANAGE);
  const { edit } = await searchParams;
  const allowed = allowedBranchIds(user);

  const [branches, rows, editing] = await Promise.all([
    prisma.branch.findMany({
      where: allowed === null ? {} : { id: { in: allowed } },
      orderBy: { orderIndex: "asc" },
      select: { id: true, shortName: true },
    }),
    prisma.course.findMany({
      where: allowed === null ? {} : { branchId: { in: allowed } },
      orderBy: [{ branchId: "asc" }, { orderIndex: "asc" }],
      include: {
        branch: { select: { shortName: true } },
        _count: { select: { applications: true } },
      },
    }),
    edit ? prisma.course.findUnique({ where: { id: edit } }) : Promise.resolve(null),
  ]);

  const fields: FieldSpec[] = [
    { name: "id", kind: "hidden", value: editing?.id ?? "" },
    {
      name: "branchId",
      kind: "select",
      label: "Campus",
      required: true,
      options: branches.map((b) => ({ value: b.id, label: b.shortName })),
    },
    { name: "code", kind: "text", label: "Code", required: true, placeholder: "PCMB" },
    { name: "name", kind: "text", label: "Full name", required: true, wide: true, placeholder: "Physics, Chemistry, Mathematics, Biology" },
    {
      name: "stream",
      kind: "select",
      label: "Stream",
      required: true,
      options: [
        { value: "SCIENCE", label: "Science" },
        { value: "COMMERCE", label: "Commerce" },
        { value: "ARTS", label: "Arts" },
      ],
    },
    { name: "subjects", kind: "text", label: "Subjects", hint: "Separate with commas.", wide: true, placeholder: "Physics, Chemistry, Mathematics, Biology" },
    { name: "description", kind: "textarea", label: "Description", rows: 3, wide: true },
    { name: "eligibility", kind: "textarea", label: "Eligibility", rows: 2, wide: true },
    { name: "durationYears", kind: "number", label: "Duration (years)" },
    { name: "intake", kind: "number", label: "Sanctioned intake" },
    { name: "annualFee", kind: "number", label: "Annual fee (₹)" },
    { name: "orderIndex", kind: "number", label: "Display order" },
    { name: "isActive", kind: "checkbox", label: "Open and shown on the website", defaultChecked: true },
  ];

  return (
    <>
      <AdminPageHeader
        title="Courses & combinations"
        description="Combinations offered at each campus, with intake and fees shown to applicants."
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <Panel title={`All combinations (${rows.length})`}>
          {rows.length === 0 ? (
            <EmptyState title="No combinations yet" />
          ) : (
            <DataTable headers={["Code", "Campus", "Intake", "Annual fee", "Applications", { label: "Actions", align: "right" }]}>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-ink-50">
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-ink-800">{row.code}</span>
                    <span className="block text-[0.74rem] text-ink-500">{row.name}</span>
                    {!row.isActive ? (
                      <span className="mt-1 inline-block">
                        <Badge tone="neutral">Closed</Badge>
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">{row.branch.shortName}</td>
                  <td className="px-4 py-2.5 text-ink-600">{row.intake ?? "—"}</td>
                  <td className="px-4 py-2.5 text-ink-600">{formatCurrency(row.annualFee)}</td>
                  <td className="px-4 py-2.5 text-ink-600">{row._count.applications}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/courses?edit=${row.id}`}
                        className="text-[0.76rem] font-semibold text-brand-700 underline underline-offset-4"
                      >
                        Edit
                      </Link>
                      <form action={deleteCourse}>
                        <input type="hidden" name="id" value={row.id} />
                        <button className="text-[0.76rem] font-semibold text-red-700 underline underline-offset-4">
                          {row._count.applications > 0 ? "Close" : "Delete"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
          <p className="border-t border-ink-200 px-5 py-3 text-[0.76rem] text-ink-500">
            A combination that already has applications is closed rather than
            deleted, so those records keep their course details.
          </p>
        </Panel>

        <Panel
          title={editing ? `Edit ${editing.code}` : "Add a combination"}
          action={
            editing ? (
              <Link href="/admin/courses" className="text-[0.76rem] font-semibold text-ink-600 underline underline-offset-4">
                Add new instead
              </Link>
            ) : null
          }
        >
          <ResourceForm
            key={editing?.id ?? "new"}
            action={saveCourse}
            fields={fields}
            initial={
              editing
                ? { ...editing, subjects: editing.subjects.join(", ") }
                : { branchId: branches[0]?.id, isActive: true, durationYears: 2 }
            }
            submitLabel={editing ? "Save changes" : "Add combination"}
            resetAfterSuccess={!editing}
          />
        </Panel>
      </div>
    </>
  );
}
