import { AdminPageHeader } from "@/components/admin/ui";
import { CAPABILITY_GROUPS, requireOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NewUserForm } from "./new-user-form";

export const metadata = { title: "Add staff account" };

export default async function NewUserPage() {
  await requireOwner();

  const branches = await prisma.branch.findMany({
    orderBy: { orderIndex: "asc" },
    select: { id: true, shortName: true },
  });

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
