import Link from "next/link";
import { AdminPageHeader, DataTable, EmptyState, Panel } from "@/components/admin/ui";
import { ResourceForm, type FieldSpec } from "@/components/admin/resource-form";
import { Capability } from "@/generated/prisma/enums";
import { deleteTopper, saveTopper } from "@/lib/actions/content";
import { allowedBranchIds, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Toppers" };

export default async function ToppersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireCapability(Capability.TOPPER_MANAGE);
  const { edit } = await searchParams;
  const allowed = allowedBranchIds(user);

  const [branches, rows, editing] = await Promise.all([
    prisma.branch.findMany({
      where: allowed === null ? {} : { id: { in: allowed } },
      orderBy: { orderIndex: "asc" },
      select: { id: true, shortName: true },
    }),
    prisma.topper.findMany({
      where: allowed === null ? {} : { branchId: { in: allowed } },
      orderBy: [{ academicYear: "desc" }, { percentage: "desc" }],
      include: { branch: { select: { shortName: true } } },
    }),
    edit ? prisma.topper.findUnique({ where: { id: edit } }) : Promise.resolve(null),
  ]);

  const currentYear = new Date().getFullYear();
  const defaultYear = `${currentYear}–${String(currentYear + 1).slice(2)}`;

  const fields: FieldSpec[] = [
    { name: "id", kind: "hidden", value: editing?.id ?? "" },
    {
      name: "branchId",
      kind: "select",
      label: "Campus",
      required: true,
      options: branches.map((b) => ({ value: b.id, label: b.shortName })),
    },
    { name: "studentName", kind: "text", label: "Student name", required: true },
    { name: "academicYear", kind: "text", label: "Academic year", required: true, placeholder: defaultYear },
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
    { name: "percentage", kind: "text", label: "Percentage", required: true, placeholder: "96.33" },
    { name: "marksObtained", kind: "number", label: "Marks obtained" },
    { name: "totalMarks", kind: "number", label: "Out of", placeholder: "600" },
    { name: "rankLabel", kind: "text", label: "Label", placeholder: "College First" },
    { name: "photoUrl", kind: "text", label: "Photo address", wide: true },
    { name: "orderIndex", kind: "number", label: "Display order" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Toppers & results"
        description="Students shown on the Results page and in the achievers strip."
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Panel title={`Published toppers (${rows.length})`}>
          {rows.length === 0 ? (
            <EmptyState title="No toppers published yet" />
          ) : (
            <DataTable headers={["Student", "Year", "Stream", "%", "Campus", { label: "Actions", align: "right" }]}>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-ink-50">
                  <td className="px-4 py-2.5 font-medium text-ink-800">{row.studentName}</td>
                  <td className="px-4 py-2.5 text-ink-600">{row.academicYear}</td>
                  <td className="px-4 py-2.5 text-ink-600">{row.stream}</td>
                  <td className="px-4 py-2.5 font-semibold text-brand-700">
                    {row.percentage.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">{row.branch.shortName}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/toppers?edit=${row.id}`}
                        className="text-[0.76rem] font-semibold text-brand-700 underline underline-offset-4"
                      >
                        Edit
                      </Link>
                      <form action={deleteTopper}>
                        <input type="hidden" name="id" value={row.id} />
                        <button className="text-[0.76rem] font-semibold text-red-700 underline underline-offset-4">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>

        <Panel
          title={editing ? `Edit ${editing.studentName}` : "Add a topper"}
          action={
            editing ? (
              <Link
                href="/admin/toppers"
                className="text-[0.76rem] font-semibold text-ink-600 underline underline-offset-4"
              >
                Add new instead
              </Link>
            ) : null
          }
        >
          <ResourceForm
            key={editing?.id ?? "new"}
            action={saveTopper}
            fields={fields}
            initial={
              editing ?? { branchId: branches[0]?.id, academicYear: defaultYear, totalMarks: 600 }
            }
            submitLabel={editing ? "Save changes" : "Add topper"}
            resetAfterSuccess={!editing}
          />
        </Panel>
      </div>
    </>
  );
}
