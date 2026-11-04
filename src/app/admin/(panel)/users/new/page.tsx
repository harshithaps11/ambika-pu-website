import { AdminPageHeader } from "@/components/admin/ui";
import { isDatabaseConfigured, MOCK_BRANCHES } from "@/lib/data/mock-data";
import { CAPABILITY_GROUPS, requireOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NewUserForm } from "./new-user-form";

export const metadata = { title: "Add staff account" };

export default async function NewUserPage() {
  await requireOwner();

  let branches: { id: string; shortName: string }[] = [];
  if (!isDatabaseConfigured()) {
    branches = MOCK_BRANCHES.map((b) => ({ id: b.id, shortName: b.shortName }));
  } else {
    try {
      branches = await prisma.branch.findMany({
        orderBy: { orderIndex: "asc" },
        select: { id: true, shortName: true },
      });
    } catch (err) {
      console.error("New user branch query error:", err);
      branches = MOCK_BRANCHES.map((b) => ({ id: b.id, shortName: b.shortName }));
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Add a staff account"
        description="Create a sign-in for college staff and choose exactly what they can do."
      />
      <div className="max-w-3xl">
        <NewUserForm groups={CAPABILITY_GROUPS} branches={branches} />
      </div>
    </>
  );
}
