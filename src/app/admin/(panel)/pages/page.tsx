import Link from "next/link";
import { AdminPageHeader, DataTable, EmptyState, Panel } from "@/components/admin/ui";
import { ResourceForm, type FieldSpec } from "@/components/admin/resource-form";
import { Capability } from "@/generated/prisma/enums";
import { savePageContent } from "@/lib/actions/content";
import { allowedBranchIds, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Page content" };

/** Keys the public pages read. Anything else is simply unused until linked. */
const KNOWN_KEYS = [
  { key: "welcome", where: "Main site — welcome section" },
  { key: "management-message", where: "Main site — message from the management" },
  { key: "about", where: "About page (campus version overrides the main one)" },
  { key: "vision-mission", where: "About page — vision & mission" },
];

export default async function PagesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireCapability(Capability.PAGE_MANAGE);
  const { edit } = await searchParams;
  const allowed = allowedBranchIds(user);

  const [branches, rows, editing] = await Promise.all([
    prisma.branch.findMany({
      where: allowed === null ? {} : { id: { in: allowed } },
      orderBy: { orderIndex: "asc" },
      select: { id: true, shortName: true },
    }),
    prisma.pageContent.findMany({
      orderBy: [{ key: "asc" }],
      include: { branch: { select: { shortName: true } } },
    }),
    edit ? prisma.pageContent.findUnique({ where: { id: edit } }) : Promise.resolve(null),
  ]);

  const branchOptions = [
    ...(allowed === null ? [{ value: "", label: "Main site (institution-wide)" }] : []),
    ...branches.map((b) => ({ value: b.id, label: b.shortName })),
  ];

  const fields: FieldSpec[] = [
    { name: "id", kind: "hidden", value: editing?.id ?? "" },
    { name: "branchId", kind: "select", label: "Applies to", options: branchOptions },
    {
      name: "key",
      kind: "text",
      label: "Page key",
      required: true,
      hint: `Known keys: ${KNOWN_KEYS.map((item) => item.key).join(", ")}`,
    },
    { name: "title", kind: "text", label: "Heading", wide: true },
    {
      name: "body",
      kind: "textarea",
      label: "Content",
      required: true,
      rows: 14,
      wide: true,
      hint: "Leave a blank line between paragraphs. **Bold** works.",
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Page content"
        description="Editable text used by the public pages, so wording can change without a developer."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <Panel title={`Saved blocks (${rows.length})`}>
            {rows.length === 0 ? (
              <EmptyState title="No content blocks yet" />
            ) : (
              <DataTable headers={["Key", "Applies to", "Updated", { label: "", align: "right" }]}>
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-ink-50">
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-ink-800">{row.key}</span>
                      {row.title ? (
                        <span className="block text-[0.74rem] text-ink-500">{row.title}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-ink-600">
                      {row.branch?.shortName ?? "Main site"}
                    </td>
                    <td className="px-4 py-2.5 text-[0.76rem] text-ink-500">
                      {formatDateTime(row.updatedAt)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/admin/pages?edit=${row.id}`}
                        className="text-[0.76rem] font-semibold text-brand-700 underline underline-offset-4"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </DataTable>
            )}
          </Panel>

          <Panel title="Where each key appears">
            <ul className="divide-y divide-ink-200 text-[0.82rem]">
              {KNOWN_KEYS.map((item) => (
                <li key={item.key} className="flex gap-4 px-5 py-2.5">
                  <span className="w-44 shrink-0 font-mono text-[0.78rem] text-brand-700">
                    {item.key}
                  </span>
                  <span className="text-ink-600">{item.where}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel
          title={editing ? `Edit “${editing.key}”` : "Add or replace a block"}
          action={
            editing ? (
              <Link href="/admin/pages" className="text-[0.76rem] font-semibold text-ink-600 underline underline-offset-4">
                New block
              </Link>
            ) : null
          }
        >
          <ResourceForm
            key={editing?.id ?? "new"}
            action={savePageContent}
            fields={fields}
            initial={editing ? { ...editing, branchId: editing.branchId ?? "" } : {}}
            submitLabel="Save content"
          />
        </Panel>
      </div>
    </>
  );
}
