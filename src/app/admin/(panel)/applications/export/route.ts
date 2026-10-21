import { NextResponse, type NextRequest } from "next/server";
import { ApplicationStatus, Capability } from "@/generated/prisma/enums";
import { recordAudit } from "@/lib/audit";
import { HttpError } from "@/lib/errors";
import { apiCapability, branchScopeFilter } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const COLUMNS = [
  "Application No",
  "Status",
  "Received On",
  "Campus",
  "Student Name",
  "Date of Birth",
  "Gender",
  "Category",
  "Phone",
  "Alternate Phone",
  "Email",
  "Combination",
  "Address",
  "Village / Post",
  "City",
  "District",
  "State",
  "PIN",
  "Father",
  "Mother",
  "Guardian Phone",
  "SSLC Board",
  "SSLC School",
  "SSLC Register No",
  "SSLC Year",
  "SSLC %",
  "Applicant Remarks",
  "Office Notes",
] as const;

/**
 * Escapes a value for CSV. The leading apostrophe on values that begin with
 * a formula character stops spreadsheets from executing text typed into the
 * public form (CSV injection).
 */
function csvCell(value: unknown) {
  if (value === null || value === undefined) return "";

  let text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);

  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\n\r]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;

  return text;
}

export async function GET(request: NextRequest) {
  let user;

  try {
    user = await apiCapability(Capability.APPLICATION_EXPORT);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message =
      error instanceof HttpError ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status });
  }

  const search = request.nextUrl.searchParams;
  const statusParam = search.get("status");
  const branchSlug = search.get("branch");
  const query = search.get("q")?.trim();

  const status = Object.values(ApplicationStatus).includes(
    statusParam as ApplicationStatus,
  )
    ? (statusParam as ApplicationStatus)
    : undefined;

  const branch = branchSlug
    ? await prisma.branch.findFirst({
        where: { slug: branchSlug },
        select: { id: true },
      })
    : null;

  const where = {
    ...branchScopeFilter(user),
    ...(branch ? { branchId: branch.id } : {}),
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

  const rows = await prisma.application.findMany({
    where,
    orderBy: { createdAt: "desc" },
    // A hard ceiling keeps one click from trying to stream the whole table.
    take: 5000,
    include: { branch: { select: { shortName: true } } },
  });

  const lines = [COLUMNS.join(",")];

  for (const row of rows) {
    lines.push(
      [
        row.applicationNo,
        row.status,
        row.createdAt,
        row.branch.shortName,
        row.studentName,
        row.dateOfBirth,
        row.gender,
        row.category,
        row.phone,
        row.altPhone,
        row.email,
        row.preferredCombination,
        row.addressLine1,
        row.addressLine2,
        row.city,
        row.district,
        row.state,
        row.pincode,
        row.fatherName,
        row.motherName,
        row.guardianPhone,
        row.sslcBoard,
        row.sslcSchool,
        row.sslcRegisterNo,
        row.sslcYear,
        row.sslcPercentage,
        row.remarksFromApplicant,
        row.internalNotes,
      ]
        .map(csvCell)
        .join(","),
    );
  }

  await recordAudit({
    userId: user.id,
    action: "application.exported",
    entity: "Application",
    summary: `${rows.length} rows exported`,
  });

  const stamp = new Date().toISOString().slice(0, 10);

  // The BOM makes Excel open UTF-8 names correctly.
  return new NextResponse(`﻿${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="admissions-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
