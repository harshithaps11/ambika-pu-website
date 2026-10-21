import { AdminPageHeader } from "@/components/admin/ui";
import { Capability } from "@/generated/prisma/enums";
import { allowedBranchIds, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NewsForm } from "../news-form";

export const metadata = { title: "Add notice" };

export default async function NewNewsPage() {
  const user = await requireCapability(Capability.NEWS_MANAGE);
  const allowed = allowedBranchIds(user);

  const branches = await prisma.branch.findMany({
    where: allowed === null ? {} : { id: { in: allowed } },
    orderBy: { orderIndex: "asc" },
    select: { id: true, shortName: true },
  });

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
