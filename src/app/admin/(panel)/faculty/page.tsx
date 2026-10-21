import Link from "next/link";
import { AdminPageHeader, DataTable, EmptyState, Panel } from "@/components/admin/ui";
import { ResourceForm, type FieldSpec } from "@/components/admin/resource-form";
import { Badge } from "@/components/ui/badge";
import { Capability } from "@/generated/prisma/enums";
import { deleteFaculty, saveFaculty } from "@/lib/actions/content";
import { allowedBranchIds, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Faculty" };

export default async function FacultyAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireCapability(Capability.FACULTY_MANAGE);
  const { edit } = await searchParams;
  const allowed = allowedBranchIds(user);

  const branchWhere = allowed === null ? {} : { id: { in: allowed } };

  const [branches, rows, editing] = await Promise.all([
    prisma.branch.findMany({
      where: branchWhere,
      orderBy: { orderIndex: "asc" },
      select: { id: true, shortName: true },
    }),
    prisma.faculty.findMany({
      where: allowed === null ? {} : { branchId: { in: allowed } },
      orderBy: [{ branchId: "asc" }, { orderIndex: "asc" }, { name: "asc" }],
      include: { branch: { select: { shortName: true } } },
    }),
    edit
      ? prisma.faculty.findUnique({ where: { id: edit } })
      : Promise.resolve(null),
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
    { name: "name", kind: "text", label: "Name", required: true },
    { name: "designation", kind: "text", label: "Designation", required: true, placeholder: "Lecturer in Physics" },
    { name: "department", kind: "text", label: "Department", placeholder: "Science" },
    { name: "qualification", kind: "text", label: "Qualification", placeholder: "M.Sc., B.Ed." },
    { name: "experienceYears", kind: "number", label: "Years of experience" },
    { name: "email", kind: "email", label: "Email" },
    { name: "photoUrl", kind: "text", label: "Photo address", hint: "Paste the web address of the photograph.", wide: true },
    { name: "bio", kind: "textarea", label: "Short profile", rows: 3, wide: true },
    { name: "orderIndex", kind: "number", label: "Display order", hint: "Lower numbers appear first." },
    { name: "isActive", kind: "checkbox", label: "Shown on the website", defaultChecked: true },
  ];

  return (
    <>
      <AdminPageHeader
        title="Faculty"
        description="Teaching and administrative staff shown on each campus's Faculty page."
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Panel title={`All staff (${rows.length})`}>
          {rows.length === 0 ? (
            <EmptyState title="No faculty profiles yet" />
          ) : (
            <DataTable headers={["Name", "Designation", "Campus", { label: "Actions", align: "right" }]}>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-ink-50">
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-ink-800">{row.name}</span>
                    {!row.isActive ? (
                      <span className="ml-2 inline-block align-middle">
                        <Badge tone="neutral">Hidden</Badge>
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">{row.designation}</td>
                  <td className="px-4 py-2.5 text-ink-600">{row.branch.shortName}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/faculty?edit=${row.id}`}
                        className="text-[0.76rem] font-semibold text-brand-700 underline underline-offset-4"
                      >
                        Edit
                      </Link>
                      <form action={deleteFaculty}>
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
          title={editing ? `Edit ${editing.name}` : "Add a staff member"}
          action={
            editing ? (
              <Link
                href="/admin/faculty"
                className="text-[0.76rem] font-semibold text-ink-600 underline underline-offset-4"
              >
                Add new instead
              </Link>
            ) : null
          }
        >
          <ResourceForm
            key={editing?.id ?? "new"}
            action={saveFaculty}
            fields={fields}
            initial={editing ?? { isActive: true, branchId: branches[0]?.id }}
            submitLabel={editing ? "Save changes" : "Add staff member"}
            resetAfterSuccess={!editing}
          />
        </Panel>
      </div>
    </>
  );
}
