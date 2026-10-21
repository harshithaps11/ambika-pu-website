import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/generated/prisma/enums";
import { CAPABILITY_GROUPS, can, requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "./account-form";

export const metadata = { title: "My account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ first?: string }>;
}) {
  const { first } = await searchParams;
  const user = await requireUser();

  const branches = user.branchIds.length
    ? await prisma.branch.findMany({
        where: { id: { in: user.branchIds } },
        select: { id: true, shortName: true },
      })
    : [];

  return (
    <>
      <AdminPageHeader
        title="My account"
        description="Your sign-in details and the permissions your account currently holds."
      />

      {first ? (
        <div className="mb-6 border-l-4 border-gold-500 bg-gold-100 px-4 py-3 text-[0.88rem] text-ink-800">
          Please set a password of your own before you start using the panel.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Change password">
          <ChangePasswordForm />
        </Panel>

        <div className="space-y-6">
          <Panel title="Account">
            <dl className="divide-y divide-ink-200 text-[0.85rem]">
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-ink-500">Name</dt>
                <dd className="font-medium text-ink-800">{user.name}</dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-ink-500">Email</dt>
                <dd className="font-medium text-ink-800">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-ink-500">Role</dt>
                <dd>
                  <Badge tone={user.role === Role.OWNER ? "brand" : "neutral"}>
                    {user.role === Role.OWNER ? "Owner" : "College staff"}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-ink-500">Campus access</dt>
                <dd className="text-right font-medium text-ink-800">
                  {user.role === Role.OWNER || user.allBranches
                    ? "All campuses"
                    : branches.map((branch) => branch.shortName).join(", ") || "None"}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel
            title="Your permissions"
            description={
              user.role === Role.OWNER
                ? "Owner accounts have every permission."
                : "Granted by the site owner. Ask them if you need more."
            }
          >
            <ul className="divide-y divide-ink-200">
              {CAPABILITY_GROUPS.map((group) => (
                <li key={group.id} className="px-5 py-3">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-ink-500">
                    {group.label}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {group.capabilities.map((capability) => {
                      const granted = can(user, capability.capability);

                      return (
                        <li
                          key={capability.capability}
                          className="flex items-center gap-2 text-[0.83rem]"
                        >
                          <span
                            aria-hidden
                            className={
                              granted
                                ? "inline-block h-1.5 w-1.5 rounded-full bg-emerald-600"
                                : "inline-block h-1.5 w-1.5 rounded-full bg-ink-300"
                            }
                          />
                          <span className={granted ? "text-ink-800" : "text-ink-400"}>
                            {capability.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
