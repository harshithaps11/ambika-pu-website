import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/generated/prisma/enums";
import { CAPABILITY_GROUPS, requireOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { EditUserForm, ResetPasswordForm } from "./edit-user-form";

export const metadata = { title: "Staff account" };

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const owner = await requireOwner();
  const { id } = await params;

  const [user, branches] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        allBranches: true,
        mustChangePassword: true,
        lastLoginAt: true,
        createdAt: true,
        capabilities: { select: { capability: true } },
        branchAccess: { select: { branchId: true } },
      },
    }),
    prisma.branch.findMany({
      orderBy: { orderIndex: "asc" },
      select: { id: true, shortName: true },
    }),
  ]);

  if (!user) notFound();

  const isSelf = user.id === owner.id;

  return (
    <>
      <AdminPageHeader
        title={user.name}
        description={user.email}
        action={
          <Link
            href="/admin/users"
            className="text-[0.8rem] font-semibold text-ink-600 underline underline-offset-4"
          >
            ← Back to staff accounts
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Badge tone={user.role === Role.OWNER ? "brand" : "neutral"}>
          {user.role === Role.OWNER ? "Owner" : "College staff"}
        </Badge>
        {user.isActive ? (
          <Badge tone="green">Active</Badge>
        ) : (
          <Badge tone="red">Deactivated</Badge>
        )}
        {user.mustChangePassword ? <Badge tone="gold">Password pending</Badge> : null}
        <span className="text-[0.8rem] text-ink-500">
          {user.lastLoginAt
            ? `Last signed in ${formatDateTime(user.lastLoginAt)}`
            : "Has never signed in"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div>
          {user.role === Role.OWNER ? (
            <Panel title="Owner account">
              <div className="space-y-3 p-5 text-[0.88rem] text-ink-700">
                <p>
                  Owner accounts hold every permission on every campus by design, so
                  there is nothing to configure here.
                </p>
                {isSelf ? (
                  <p className="text-ink-500">
                    This is the account you are signed in with. Change its password
                    from{" "}
                    <Link
                      href="/admin/account"
                      className="font-semibold text-brand-700 underline underline-offset-4"
                    >
                      My Account
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
            </Panel>
          ) : (
            <EditUserForm
              userId={user.id}
              groups={CAPABILITY_GROUPS}
              granted={user.capabilities.map((row) => row.capability)}
              branches={branches}
              branchIds={user.branchAccess.map((row) => row.branchId)}
              allBranches={user.allBranches}
              isActive={user.isActive}
            />
          )}
        </div>

        <div className="space-y-6">
          <Panel
            title="Password"
            description="Generates a new temporary password and signs the account out everywhere."
          >
            {isSelf ? (
              <p className="p-5 text-[0.85rem] text-ink-600">
                Use the My Account page to change your own password.
              </p>
            ) : (
              <ResetPasswordForm userId={user.id} />
            )}
          </Panel>

          <Panel title="Record">
            <dl className="divide-y divide-ink-200 text-[0.85rem]">
              <div className="flex justify-between gap-4 px-5 py-2.5">
                <dt className="text-ink-500">Created</dt>
                <dd className="font-medium text-ink-800">
                  {formatDateTime(user.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-2.5">
                <dt className="text-ink-500">Permissions held</dt>
                <dd className="font-medium text-ink-800">
                  {user.role === Role.OWNER ? "All" : user.capabilities.length}
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
