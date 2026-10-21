import Link from "next/link";
import { AdminPageHeader, DataTable, EmptyState, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Capability } from "@/generated/prisma/enums";
import { deleteNewsItem, toggleNewsFlag } from "@/lib/actions/news";
import {
  branchScopeFilterWithGlobal,
  can,
  canAny,
  requireUser,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export const metadata = { title: "News & notices" };

const PER_PAGE = 20;

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; saved?: string; deleted?: string }>;
}) {
  const user = await requireUser();

  if (!canAny(user, Capability.NEWS_VIEW, Capability.NEWS_MANAGE)) {
    redirect(`/admin/no-access?needed=${Capability.NEWS_VIEW}`);
  }

  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const where = branchScopeFilterWithGlobal(user);
  const editable = can(user, Capability.NEWS_MANAGE);

  const [items, total] = await Promise.all([
    prisma.newsItem.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        title: true,
        category: true,
        isPublished: true,
        isTicker: true,
        isPinned: true,
        publishedAt: true,
        expiresAt: true,
        branch: { select: { shortName: true } },
      },
    }),
    prisma.newsItem.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const now = new Date();

  return (
    <>
      <AdminPageHeader
        title="News & notices"
        description="Everything published on the notice boards and in the scrolling updates strip."
        action={
          editable ? (
            <ButtonLink href="/admin/news/new" variant="primary">
              Add notice
            </ButtonLink>
          ) : null
        }
      />

      {params.saved ? (
        <div className="mb-5 border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-[0.86rem] text-emerald-900">
          Saved. The website has been updated.
        </div>
      ) : null}
      {params.deleted ? (
        <div className="mb-5 border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-[0.86rem] text-emerald-900">
          The notice has been deleted.
        </div>
      ) : null}

      <Panel>
        {items.length === 0 ? (
          <EmptyState
            title="No notices yet"
            description="Add your first notice and it will appear on the website immediately."
            action={
              editable ? (
                <ButtonLink href="/admin/news/new">Add notice</ButtonLink>
              ) : null
            }
          />
        ) : (
          <DataTable
            headers={[
              "Title",
              "Campus",
              "Published",
              "Status",
              { label: "Actions", align: "right" },
            ]}
          >
            {items.map((item) => {
              const expired = item.expiresAt ? item.expiresAt < now : false;
              const scheduled = item.publishedAt > now;

              return (
                <tr key={item.id} className="align-top hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <span className="block font-medium text-ink-800">
                      {item.title}
                    </span>
                    <span className="mt-1 inline-flex flex-wrap gap-1.5">
                      <Badge tone="neutral">{item.category}</Badge>
                      {item.isTicker ? <Badge tone="gold">Ticker</Badge> : null}
                      {item.isPinned ? <Badge tone="brand">Pinned</Badge> : null}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {item.branch?.shortName ?? "Institution-wide"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-600">
                    {formatDate(item.publishedAt)}
                    {item.expiresAt ? (
                      <span className="block text-[0.74rem] text-ink-400">
                        until {formatDate(item.expiresAt)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {!item.isPublished ? (
                      <Badge tone="neutral">Draft</Badge>
                    ) : expired ? (
                      <Badge tone="red">Expired</Badge>
                    ) : scheduled ? (
                      <Badge tone="blue">Scheduled</Badge>
                    ) : (
                      <Badge tone="green">Live</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editable ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        <form action={toggleNewsFlag}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="field" value="isTicker" />
                          <button
                            type="submit"
                            className="text-[0.76rem] font-semibold text-ink-600 underline underline-offset-4 hover:text-brand-700"
                          >
                            {item.isTicker ? "Remove from ticker" : "Add to ticker"}
                          </button>
                        </form>

                        <form action={toggleNewsFlag}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="field" value="isPublished" />
                          <button
                            type="submit"
                            className="text-[0.76rem] font-semibold text-ink-600 underline underline-offset-4 hover:text-brand-700"
                          >
                            {item.isPublished ? "Unpublish" : "Publish"}
                          </button>
                        </form>

                        <Link
                          href={`/admin/news/${item.id}`}
                          className="text-[0.76rem] font-semibold text-brand-700 underline underline-offset-4"
                        >
                          Edit
                        </Link>

                        <form action={deleteNewsItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <button
                            type="submit"
                            className="text-[0.76rem] font-semibold text-red-700 underline underline-offset-4"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-[0.76rem] text-ink-400">View only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </Panel>

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(target) =>
          target > 1 ? `/admin/news?page=${target}` : "/admin/news"
        }
      />
    </>
  );
}
