import Link from "next/link";
import {
  AdminPageHeader,
  DataTable,
  EmptyState,
  Panel,
  StatusPill,
  Toolbar,
} from "@/components/admin/ui";
import { Pagination } from "@/components/ui/pagination";
import { Input, Label, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ApplicationStatus, Capability } from "@/generated/prisma/enums";
import { STATUS_LABELS } from "@/components/admin/ui";
import { isDatabaseConfigured, MOCK_BRANCHES } from "@/lib/data/mock-data";
import { branchScopeFilter, can, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admissions" };

const PER_PAGE = 25;

type Props = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    branch?: string;
    q?: string;
  }>;
};

export default async function ApplicationsPage({ searchParams }: Props) {
  const user = await requireCapability(Capability.APPLICATION_VIEW);
  const params = await searchParams;

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const status = Object.values(ApplicationStatus).includes(
    params.status as ApplicationStatus,
  )
    ? (params.status as ApplicationStatus)
    : undefined;
  const query = params.q?.trim();

  let branches: { id: string; shortName: string; slug: string }[] = [];
  let rows: {
    id: string;
    applicationNo: string;
    studentName: string;
    phone: string;
    preferredCombination: string | null;
    status: ApplicationStatus;
    createdAt: Date;
    branch: { shortName: string };
  }[] = [];
  let total = 0;

  if (!isDatabaseConfigured()) {
    branches = MOCK_BRANCHES.map((b) => ({
      id: b.id,
      shortName: b.shortName,
      slug: b.slug,
    }));
    rows = [
      {
        id: "mock_app_1",
        applicationNo: "AMB-NLK-2026-00001",
        studentName: "Aishwarya Hegde",
        phone: "9845012345",
        preferredCombination: "PCMB",
        status: ApplicationStatus.SUBMITTED,
        createdAt: new Date(Date.now() - 3600000 * 4),
        branch: { shortName: "Nellikatte Campus" },
      },
      {
        id: "mock_app_2",
        applicationNo: "AMB-NLK-2026-00002",
        studentName: "Karthik Shetty",
        phone: "9845023456",
        preferredCombination: "PCMC",
        status: ApplicationStatus.ADMITTED,
        createdAt: new Date(Date.now() - 86400000),
        branch: { shortName: "Nellikatte Campus" },
      },
      {
        id: "mock_app_3",
        applicationNo: "AMB-BPL-2026-00003",
        studentName: "Fathima Nasreen",
        phone: "9845034567",
        preferredCombination: "SEBA",
        status: ApplicationStatus.SHORTLISTED,
        createdAt: new Date(Date.now() - 86400000 * 2),
        branch: { shortName: "Bappalige Campus" },
      },
      {
        id: "mock_app_4",
        applicationNo: "AMB-BPL-2026-00004",
        studentName: "Vignesh Rai",
        phone: "9845045678",
        preferredCombination: "PCMB",
        status: ApplicationStatus.UNDER_REVIEW,
        createdAt: new Date(Date.now() - 86400000 * 3),
        branch: { shortName: "Bappalige Campus" },
      },
      {
        id: "mock_app_5",
        applicationNo: "AMB-NLK-2026-00005",
        studentName: "Sahana Bhat",
        phone: "9845056789",
        preferredCombination: "CEBA",
        status: ApplicationStatus.ADMITTED,
        createdAt: new Date(Date.now() - 86400000 * 4),
        branch: { shortName: "Nellikatte Campus" },
      },
    ];
    total = rows.length;
  } else {
    try {
      branches = await prisma.branch.findMany({
        where: branchScopeFilter(user).branchId
          ? { id: { in: branchScopeFilter(user).branchId!.in } }
          : {},
        orderBy: { orderIndex: "asc" },
        select: { id: true, shortName: true, slug: true },
      });

      const branchFilter =
        params.branch && branches.some((branch) => branch.slug === params.branch)
          ? branches.find((branch) => branch.slug === params.branch)?.id
          : undefined;

      const where = {
        ...branchScopeFilter(user),
        ...(branchFilter ? { branchId: branchFilter } : {}),
        ...(status ? { status } : {}),
        ...(query
          ? {
              OR: [
                { studentName: { contains: query, mode: "insensitive" as const } },
                { applicationNo: { contains: query, mode: "insensitive" as const } },
                { phone: { contains: query } },
                { email: { contains: query, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };

      const [dbRows, dbTotal] = await Promise.all([
        prisma.application.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PER_PAGE,
          take: PER_PAGE,
          select: {
            id: true,
            applicationNo: true,
            studentName: true,
            phone: true,
            preferredCombination: true,
            status: true,
            createdAt: true,
            branch: { select: { shortName: true } },
          },
        }),
        prisma.application.count({ where }),
      ]);
      rows = dbRows;
      total = dbTotal;
    } catch (err) {
      console.error("Applications query error:", err);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const buildHref = (targetPage: number) => {
    const search = new URLSearchParams();
    if (status) search.set("status", status);
    if (params.branch) search.set("branch", params.branch);
    if (query) search.set("q", query);
    if (targetPage > 1) search.set("page", String(targetPage));
    const qs = search.toString();
    return `/admin/applications${qs ? `?${qs}` : ""}`;
  };

  const exportHref = (() => {
    const search = new URLSearchParams();
    if (status) search.set("status", status);
    if (params.branch) search.set("branch", params.branch);
    if (query) search.set("q", query);
    const qs = search.toString();
    return `/admin/applications/export${qs ? `?${qs}` : ""}`;
  })();

  return (
    <>
      <AdminPageHeader
        title="Admission applications"
        description={`${total} ${total === 1 ? "application" : "applications"} match the current filters.`}
        action={
          can(user, Capability.APPLICATION_EXPORT) ? (
            <a
              href={exportHref}
              className="inline-flex h-10 items-center rounded-sm border border-ink-300 bg-white px-4 text-[0.8rem] font-semibold text-ink-800 transition-colors hover:border-brand-700 hover:text-brand-700"
            >
              Download CSV
            </a>
          ) : null
        }
      />

      <Panel>
        <form method="get">
          <Toolbar>
            <div className="w-full sm:w-64">
              <Label htmlFor="q">Search</Label>
              <Input
                id="q"
                name="q"
                defaultValue={query ?? ""}
                placeholder="Name, reference, phone or email"
              />
            </div>

            <div className="w-full sm:w-44">
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={status ?? ""}>
                <option value="">All statuses</option>
                {Object.values(ApplicationStatus).map((value) => (
                  <option key={value} value={value}>
                    {STATUS_LABELS[value]}
                  </option>
                ))}
              </Select>
            </div>

            {branches.length > 1 ? (
              <div className="w-full sm:w-48">
                <Label htmlFor="branch">Campus</Label>
                <Select id="branch" name="branch" defaultValue={params.branch ?? ""}>
                  <option value="">All campuses</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.slug}>
                      {branch.shortName}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}

            <Button type="submit" variant="secondary">
              Apply filters
            </Button>

            {status || query || params.branch ? (
              <Link
                href="/admin/applications"
                className="text-[0.8rem] font-semibold text-ink-600 underline underline-offset-4"
              >
                Clear
              </Link>
            ) : null}
          </Toolbar>
        </form>

        {rows.length === 0 ? (
          <EmptyState
            title="No applications found"
            description="Try clearing the filters, or wait for new submissions to arrive from the website."
          />
        ) : (
          <DataTable
            headers={["Reference", "Student", "Campus", "Combination", "Phone", "Received", "Status"]}
          >
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-ink-50">
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <Link
                    href={`/admin/applications/${row.id}`}
                    className="font-semibold text-brand-700 underline underline-offset-4"
                  >
                    {row.applicationNo}
                  </Link>
                </td>
                <td className="px-4 py-2.5 font-medium text-ink-800">
                  {row.studentName}
                </td>
                <td className="px-4 py-2.5 text-ink-600">{row.branch.shortName}</td>
                <td className="px-4 py-2.5 text-ink-600">
                  {row.preferredCombination ?? "—"}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-ink-600">
                  {row.phone}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-ink-600">
                  {formatDate(row.createdAt)}
                </td>
                <td className="px-4 py-2.5">
                  <StatusPill status={row.status} />
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </>
  );
}
