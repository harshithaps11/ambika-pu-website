import Link from "next/link";
import { AdminPageHeader, DataTable, EmptyState, Panel } from "@/components/admin/ui";
import { ResourceForm, type FieldSpec } from "@/components/admin/resource-form";
import { Badge } from "@/components/ui/badge";
import { Capability } from "@/generated/prisma/enums";
import { deleteFaq, saveFaq } from "@/lib/actions/content";
import { allowedBranchIds, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Chatbot answers" };

export default async function FaqAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireCapability(Capability.FAQ_MANAGE);
  const { edit } = await searchParams;
  const allowed = allowedBranchIds(user);

  const [branches, rows, editing] = await Promise.all([
    prisma.branch.findMany({
      where: allowed === null ? {} : { id: { in: allowed } },
      orderBy: { orderIndex: "asc" },
      select: { id: true, shortName: true },
    }),
    prisma.faqEntry.findMany({
      orderBy: [{ orderIndex: "asc" }],
      include: { branch: { select: { shortName: true } } },
    }),
    edit ? prisma.faqEntry.findUnique({ where: { id: edit } }) : Promise.resolve(null),
  ]);

  const branchOptions = [
    ...(allowed === null
      ? [{ value: "", label: "All campuses (institution-wide)" }]
      : []),
    ...branches.map((b) => ({ value: b.id, label: b.shortName })),
  ];

  const fields: FieldSpec[] = [
    { name: "id", kind: "hidden", value: editing?.id ?? "" },
    { name: "branchId", kind: "select", label: "Applies to", options: branchOptions },
    { name: "category", kind: "text", label: "Category", placeholder: "Admissions" },
    { name: "question", kind: "text", label: "Question", required: true, wide: true },
    { name: "answer", kind: "textarea", label: "Answer", required: true, rows: 5, wide: true },
    {
      name: "keywords",
      kind: "text",
      label: "Matching words",
      required: false,
      wide: true,
      hint: "Comma separated. The assistant matches a visitor's question against these, so add the words people actually type — including misspellings.",
      placeholder: "fee, fees, cost, payment, charges",
    },
    { name: "orderIndex", kind: "number", label: "Display order" },
    { name: "isActive", kind: "checkbox", label: "Active", defaultChecked: true },
  ];

  return (
    <>
      <AdminPageHeader
        title="Chatbot answers"
        description="The website assistant answers only from this list. It never invents an answer, so fees and dates can be trusted."
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <Panel title={`Answers (${rows.length})`}>
          {rows.length === 0 ? (
            <EmptyState title="No answers yet" />
          ) : (
            <DataTable headers={["Question", "Applies to", "Times used", { label: "Actions", align: "right" }]}>
              {rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-ink-50">
                  <td className="px-4 py-2.5">
                    <span className="block font-medium text-ink-800">{row.question}</span>
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {row.category ? <Badge tone="neutral">{row.category}</Badge> : null}
                      {!row.isActive ? <Badge tone="red">Inactive</Badge> : null}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">
                    {row.branch?.shortName ?? "All campuses"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">{row.hitCount}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/faqs?edit=${row.id}`}
                        className="text-[0.76rem] font-semibold text-brand-700 underline underline-offset-4"
                      >
                        Edit
                      </Link>
                      <form action={deleteFaq}>
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
          title={editing ? "Edit answer" : "Add an answer"}
          action={
            editing ? (
              <Link href="/admin/faqs" className="text-[0.76rem] font-semibold text-ink-600 underline underline-offset-4">
                Add new instead
              </Link>
            ) : null
          }
        >
          <ResourceForm
            key={editing?.id ?? "new"}
            action={saveFaq}
            fields={fields}
            initial={
              editing
                ? { ...editing, keywords: editing.keywords.join(", "), branchId: editing.branchId ?? "" }
                : { isActive: true }
            }
            submitLabel={editing ? "Save changes" : "Add answer"}
            resetAfterSuccess={!editing}
          />
        </Panel>
      </div>
    </>
  );
}
