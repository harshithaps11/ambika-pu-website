import Link from "next/link";
import {
  AdminPageHeader,
  DataTable,
  EmptyState,
  Panel,
  StatCard,
  StatusPill,
} from "@/components/admin/ui";
import { Capability, Role } from "@/generated/prisma/enums";
import {
  branchScopeFilter,
  branchScopeFilterWithGlobal,
  can,
  CAPABILITY_GROUPS,
  requireUser,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

/**
 * Loads every figure the dashboard shows, skipping the queries this account
 * has no permission to see. Kept out of the component body so the reads — and
 * the clock they depend on — are not part of render.
 */
async function loadDashboard(user: Awaited<ReturnType<typeof requireUser>>) {
  const scope = branchScopeFilter(user);
  const globalScope = branchScopeFilterWithGlobal(user);

  const canSeeApplications = can(user, Capability.APPLICATION_VIEW);
  const canSeeNews = can(user, Capability.NEWS_VIEW) || can(user, Capability.NEWS_MANAGE);
  const canSeeEnquiries = can(user, Capability.CONTACT_VIEW);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalApplications,
    pendingApplications,
    recentApplications,
    admittedCount,
    publishedNews,
    recentApplicationRows,
  ] = await Promise.all([
    canSeeApplications ? prisma.application.count({ where: scope }) : 0,
    canSeeApplications
      ? prisma.application.count({ where: { ...scope, status: "SUBMITTED" } })
      : 0,
    canSeeApplications
      ? prisma.application.count({
          where: { ...scope, createdAt: { gte: thirtyDaysAgo } },
        })
      : 0,
    canSeeApplications
      ? prisma.application.count({ where: { ...scope, status: "ADMITTED" } })
      : 0,
    canSeeNews
      ? prisma.newsItem.count({ where: { ...globalScope, isPublished: true } })
      : 0,
    canSeeApplications
      ? prisma.application.findMany({
          where: scope,
          orderBy: { createdAt: "desc" },
          take: 8,
          select: {
            id: true,
            applicationNo: true,
            studentName: true,
            preferredCombination: true,
            status: true,
            createdAt: true,
            branch: { select: { shortName: true } },
          },
        })
      : [],
  ]);

  const unreadEnquiries = canSeeEnquiries
    ? await prisma.contactMessage.count({ where: { ...globalScope, isRead: false } })
    : 0;

  return {
    canSeeApplications,
    canSeeNews,
    canSeeEnquiries,
    totalApplications,
    pendingApplications,
    recentApplications,
    admittedCount,
    publishedNews,
    recentApplicationRows,
    unreadEnquiries,
  };
}

export default async function AdminDashboard() {
  const user = await requireUser();
  const {
    canSeeApplications,
    canSeeNews,
    canSeeEnquiries,
    totalApplications,
    pendingApplications,
    recentApplications,
    admittedCount,
    publishedNews,
    recentApplicationRows,
    unreadEnquiries,
  } = await loadDashboard(user);

  const grantedCount = user.role === Role.OWNER ? null : user.capabilities.length;
  const totalCapabilities = CAPABILITY_GROUPS.reduce(
    (total, group) => total + group.capabilities.length,
    0,
  );

  return (
    <>
      <AdminPageHeader
        title={`Welcome, ${user.name.split(" ")[0]}`}
        description={
          user.role === Role.OWNER
            ? "You have full control of the website and every campus."
            : `Your account has ${grantedCount} of ${totalCapabilities} permissions. Ask the site owner if you need more.`
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {canSeeApplications ? (
          <>
            <StatCard
              label="New applications"
              value={pendingApplications}
              hint="Awaiting first review"
              tone="brand"
              href="/admin/applications?status=SUBMITTED"
            />
            <StatCard
              label="Last 30 days"
              value={recentApplications}
              hint="Applications received"
              href="/admin/applications"
            />
            <StatCard
              label="Admitted"
              value={admittedCount}
              hint="Across your campuses"
              tone="green"
              href="/admin/applications?status=ADMITTED"
            />
            <StatCard
              label="Total applications"
              value={totalApplications}
              href="/admin/applications"
            />
          </>
        ) : null}

        {canSeeNews ? (
          <StatCard
            label="Published notices"
            value={publishedNews}
            hint="Live on the website"
            href="/admin/news"
          />
        ) : null}

        {canSeeEnquiries ? (
          <StatCard
            label="Unread enquiries"
            value={unreadEnquiries}
            tone="gold"
            href="/admin/enquiries"
          />
        ) : null}
      </div>

      {canSeeApplications ? (
        <Panel
          className="mt-7"
          title="Latest applications"
          description="The eight most recent submissions from your campuses."
          action={
            <Link
              href="/admin/applications"
              className="text-[0.78rem] font-semibold text-brand-700 underline underline-offset-4"
            >
              View all
            </Link>
          }
        >
          {recentApplicationRows.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Submissions from the online admission forms will appear here."
            />
          ) : (
            <DataTable
              headers={["Reference", "Student", "Campus", "Combination", "Received", "Status"]}
            >
              {recentApplicationRows.map((application) => (
                <tr key={application.id} className="hover:bg-ink-50">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/admin/applications/${application.id}`}
                      className="font-semibold text-brand-700 underline underline-offset-4"
                    >
                      {application.applicationNo}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-ink-800">
                    {application.studentName}
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">
                    {application.branch.shortName}
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">
                    {application.preferredCombination ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">
                    {formatDate(application.createdAt)}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusPill status={application.status} />
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
      ) : null}

      {!canSeeApplications && !canSeeNews && !canSeeEnquiries ? (
        <Panel className="mt-7">
          <EmptyState
            title="No sections have been enabled for your account yet"
            description="The site owner decides which parts of the admin panel each staff account can use. Once a permission is granted it appears in the menu on the left straight away."
          />
        </Panel>
      ) : null}

      <p className="mt-6 text-[0.75rem] text-ink-400">Signed in as {user.email}</p>
    </>
  );
}
