import Link from "next/link";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/generated/prisma/enums";
import { isDatabaseConfigured, MOCK_BRANCHES } from "@/lib/data/mock-data";
import { CAPABILITY_GROUPS, can, requireUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm, EditProfileForm } from "./account-form";

export const metadata = { title: "My account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ first?: string }>;
}) {
  const { first } = await searchParams;
  const user = await requireUser();

  let branches: { id: string; shortName: string }[] = [];
  if (user.branchIds.length) {
    if (!isDatabaseConfigured()) {
      branches = MOCK_BRANCHES.filter((b) => user.branchIds.includes(b.id)).map((b) => ({
        id: b.id,
        shortName: b.shortName,
      }));
    } else {
      try {
        branches = await prisma.branch.findMany({
          where: { id: { in: user.branchIds } },
          select: { id: true, shortName: true },
        });
      } catch (err) {
        console.error("Account branch query error:", err);
      }
    }
  }

  return (
    <>
      <AdminPageHeader
        title="My account"
        description="Manage your profile information, password security, and review your institutional permissions."
      />

      {first ? (
        <div className="mb-6 rounded-xl border-l-4 border-gold-500 bg-gold-100 px-5 py-4 text-[0.88rem] text-ink-900 shadow-xs">
          Please set a password of your own before you start using the administrative portal.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Panel
            title="Edit profile"
            description="Update your display name and email address for this portal."
          >
            <EditProfileForm
              initialUser={{
                name: user.name,
                email: user.email,
                role: user.role,
              }}
            />
          </Panel>

          <Panel
            title="Change password"
            description="Use a strong password with a mix of uppercase, lowercase, and numbers."
          >
            <ChangePasswordForm />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Account details">
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
                    {user.role === Role.OWNER ? "Owner / Super Admin" : "College Staff"}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-ink-500">Campus access</dt>
                <dd className="text-right font-medium text-ink-800">
                  {user.role === Role.OWNER || user.allBranches
                    ? "All campuses (Institution-wide)"
                    : branches.map((branch) => branch.shortName).join(", ") || "None"}
                </dd>
              </div>
            </dl>

            {user.role === Role.OWNER ? (
              <div className="border-t border-ink-100 bg-ink-50/60 p-4">
                <div className="flex items-center justify-between gap-3 text-xs text-ink-600">
                  <span>Need to manage other staff members or their permissions?</span>
                  <Link
                    href="/admin/users"
                    className="font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-800 shrink-0"
                  >
                    Staff Accounts →
                  </Link>
                </div>
              </div>
            ) : null}
          </Panel>

          <Panel
            title="Your permissions"
            description={
              user.role === Role.OWNER
                ? "Owner accounts hold unconditional access to all college modules."
                : "Assigned by the institution owner. Contact administration for changes."
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
                                ? "inline-block h-2 w-2 rounded-full bg-emerald-600 shadow-2xs"
                                : "inline-block h-2 w-2 rounded-full bg-ink-300"
                            }
                          />
                          <span className={granted ? "font-medium text-ink-800" : "text-ink-400"}>
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
