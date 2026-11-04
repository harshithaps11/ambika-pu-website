import { AdminPageHeader } from "@/components/admin/ui";
import { Capability } from "@/generated/prisma/enums";
import { isDatabaseConfigured, MOCK_BRANCHES } from "@/lib/data/mock-data";
import { allowedBranchIds, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NewsForm } from "../news-form";

export const metadata = { title: "Add notice" };

export default async function NewNewsPage() {
  const user = await requireCapability(Capability.NEWS_MANAGE);
  const allowed = allowedBranchIds(user);

  let branches: { id: string; shortName: string }[] = [];
  if (!isDatabaseConfigured()) {
    branches = MOCK_BRANCHES.map((b) => ({ id: b.id, shortName: b.shortName }));
  } else {
    try {
      branches = await prisma.branch.findMany({
        where: allowed === null ? {} : { id: { in: allowed } },
        orderBy: { orderIndex: "asc" },
        select: { id: true, shortName: true },
      });
    } catch (err) {
      console.error("New news branch query error:", err);
      branches = MOCK_BRANCHES.map((b) => ({ id: b.id, shortName: b.shortName }));
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Add a notice"
        description="It appears on the website as soon as you publish it."
      />
      <div className="max-w-3xl">
        <NewsForm branches={branches} canPublishGlobally={allowed === null} />
      </div>
    </>
  );
}
