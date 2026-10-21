import { AdminPageHeader, DataTable, EmptyState, Panel } from "@/components/admin/ui";
import { Pagination } from "@/components/ui/pagination";
import { Capability } from "@/generated/prisma/enums";
import { requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Activity log" };

const PER_PAGE = 40;

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireCapability(Capability.AUDIT_VIEW);
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Activity log"
        description="Who changed what, and when. Sign-in attempts are recorded too."
      />

      <Panel>
        {entries.length === 0 ? (
          <EmptyState title="Nothing recorded yet" />
        ) : (
          <DataTable headers={["When", "Who", "Action", "Details"]}>
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-ink-50">
                <td className="whitespace-nowrap px-4 py-2.5 text-[0.78rem] text-ink-500">
                  {formatDateTime(entry.createdAt)}
                </td>
                <td className="px-4 py-2.5 text-ink-700">
                  {entry.user?.name ?? "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span className="font-mono text-[0.76rem] text-brand-700">
                    {entry.action}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-ink-600">{entry.summary ?? "—"}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PER_PAGE))}
        buildHref={(target) =>
          target > 1 ? `/admin/activity?page=${target}` : "/admin/activity"
        }
      />
    </>
  );
}
