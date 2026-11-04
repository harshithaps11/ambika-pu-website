import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/ui";
import { Capability } from "@/generated/prisma/enums";
import { isDatabaseConfigured, MOCK_BRANCHES, MOCK_NEWS } from "@/lib/data/mock-data";
import {
  allowedBranchIds,
  canAccessBranch,
  requireCapability,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { toDateInputValue } from "@/lib/utils";
import { NewsForm } from "../news-form";

export const metadata = { title: "Edit notice" };

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCapability(Capability.NEWS_MANAGE);

  let item: any = null;
  let branches: { id: string; shortName: string }[] = [];
  const allowed = allowedBranchIds(user);

  if (!isDatabaseConfigured()) {
    item = MOCK_NEWS.find((n) => n.id === id) ?? MOCK_NEWS[0];
    branches = MOCK_BRANCHES.map((b) => ({ id: b.id, shortName: b.shortName }));
  } else {
    try {
      const [dbItem, dbBranches] = await Promise.all([
        prisma.newsItem.findUnique({ where: { id } }),
        prisma.branch.findMany({
          where: allowed === null ? {} : { id: { in: allowed } },
          orderBy: { orderIndex: "asc" },
          select: { id: true, shortName: true },
        }),
      ]);
      item = dbItem;
      branches = dbBranches;
    } catch (err) {
      console.error("News item query error:", err);
    }
  }

  if (!item || !canAccessBranch(user, item.branchId)) notFound();

  return (
    <>
      <AdminPageHeader title="Edit notice" description={item.title} />
      <div className="max-w-3xl">
        <NewsForm
          branches={branches}
          canPublishGlobally={allowed === null}
          item={{
            id: item.id,
            branchId: item.branchId ?? "",
            title: item.title,
            category: item.category,
            summary: item.summary ?? "",
            body: item.body ?? "",
            linkUrl: item.linkUrl ?? "",
            attachmentUrl: item.attachmentUrl ?? "",
            publishedAt: toDateInputValue(item.publishedAt),
            expiresAt: toDateInputValue(item.expiresAt),
            isTicker: item.isTicker,
            isPinned: item.isPinned,
            isPublished: item.isPublished,
          }}
        />
      </div>
    </>
  );
}
