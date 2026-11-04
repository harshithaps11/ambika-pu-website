import Link from "next/link";
import { AdminPageHeader, DataTable, EmptyState, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Role } from "@/generated/prisma/enums";
import { isDatabaseConfigured } from "@/lib/data/mock-data";
import { ALL_CAPABILITIES, requireOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Staff accounts" };

export default async function UsersPage() {
  await requireOwner();

  type UserRow = {
    id: string;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    allBranches: boolean;
    lastLoginAt: Date | null;
    mustChangePassword: boolean;
    _count: { capabilities: number };
    branchAccess: { branch: { shortName: string } }[];
  };

  let users: UserRow[] = [];
  if (!isDatabaseConfigured()) {
    users = [
      {
        id: "mock_owner",
        name: "Dr. Srikanth Rao (Administrator)",
        email: "owner@ambikapucollege.edu.in",
        role: Role.OWNER,
        isActive: true,
        allBranches: true,
        lastLoginAt: new Date(),
        mustChangePassword: false,
        _count: { capabilities: 14 },
        branchAccess: [{ branch: { shortName: "All Campuses" } }],
      },
      {
        id: "mock_office",
        name: "Administration Office (Staff)",
        email: "office@ambikapucollege.edu.in",
        role: Role.COLLEGE_ADMIN,
        isActive: true,
        allBranches: false,
        lastLoginAt: new Date(Date.now() - 86400000),
        mustChangePassword: false,
        _count: { capabilities: 5 },
        branchAccess: [
          { branch: { shortName: "Nellikatte Campus" } },
          { branch: { shortName: "Bappalige Campus" } },
        ],
      },
    ];
  } else {
    try {
      users = await prisma.user.findMany({
        orderBy: [{ role: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          allBranches: true,
          lastLoginAt: true,
          mustChangePassword: true,
          _count: { select: { capabilities: true } },
          branchAccess: { select: { branch: { select: { shortName: true } } } },
        },
      });
    } catch (err) {
      console.error("Users query error:", err);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Staff accounts"
        description="You decide exactly what each college account can see and do. Permissions take effect immediately — there is no need for anyone to sign out and back in."
        action={
          <ButtonLink href="/admin/users/new" variant="primary">
            Add staff account
          </ButtonLink>
        }
      />

      <Panel>
        {users.length === 0 ? (
          <EmptyState title="No accounts yet" />
        ) : (
          <DataTable
            headers={["Name", "Role", "Campus access", "Permissions", "Last signed in", "Status"]}
          >
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-ink-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="font-semibold text-brand-700 underline underline-offset-4"
                  >
                    {user.name}
                  </Link>
                  <span className="block text-[0.76rem] text-ink-500">{user.email}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={user.role === Role.OWNER ? "brand" : "neutral"}>
                    {user.role === Role.OWNER ? "Owner" : "Staff"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {user.role === Role.OWNER || user.allBranches
                    ? "All campuses"
                    : user.branchAccess.map((a) => a.branch.shortName).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {user.role === Role.OWNER
                    ? `All ${ALL_CAPABILITIES.length}`
                    : `${user._count.capabilities} of ${ALL_CAPABILITIES.length}`}
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}
                </td>
                <td className="px-4 py-3">
                  {!user.isActive ? (
                    <Badge tone="red">Deactivated</Badge>
                  ) : user.mustChangePassword ? (
                    <Badge tone="gold">Password pending</Badge>
                  ) : (
                    <Badge tone="green">Active</Badge>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </>
  );
}
