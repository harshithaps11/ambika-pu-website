"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashIdentifier } from "@/lib/crypto";
import { rateLimit } from "@/lib/rate-limit";
import { admissionSchema, fieldErrors } from "@/lib/validation";
import type { Gender } from "@/generated/prisma/enums";
import { isDatabaseConfigured, MOCK_BRANCHES } from "@/lib/data/mock-data";

export type AdmissionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /**
   * What the applicant typed, echoed back so the form can repopulate itself.
   * React resets an uncontrolled form once its action resolves, which would
   * otherwise empty twenty fields because of a single mistyped phone number.
   */
  values?: Record<string, string>;
  /** Changes on every attempt so the form remounts with the new defaults. */
  attempt?: number;
};

/** Everything the applicant typed, minus the fields that must not be echoed. */
function echoValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (key === "website" || key === "consent") continue;
    if (typeof value === "string") values[key] = value;
  }

  return values;
}

/** Short branch prefix for the reference number, e.g. "nellikatte" → "NEL". */
function branchCode(slug: string) {
  return slug.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase() || "AMB";
}

/**
 * Allocates the next application number for a branch and year.
 *
 * The counter is incremented with a single atomic upsert, so two applicants
 * submitting at the same instant can never be handed the same number — which
 * a read-then-write (`count() + 1`) would allow under load.
 */
async function nextApplicationNo(branchSlug: string) {
  const year = new Date().getFullYear();
  const key = `appno:${branchSlug}:${year}`;

  const rows = await prisma.$queryRaw<{ value: string }[]>`
    INSERT INTO "Setting" ("key", "value", "updatedAt")
    VALUES (${key}, '1', now())
    ON CONFLICT ("key") DO UPDATE
      SET "value" = (("Setting"."value")::bigint + 1)::text,
          "updatedAt" = now()
    RETURNING "value"
  `;

  const sequence = Number(rows[0]?.value ?? 1);
  return `AMB-${branchCode(branchSlug)}-${year}-${String(sequence).padStart(5, "0")}`;
}

export async function submitAdmission(
  _previous: AdmissionState,
  formData: FormData,
): Promise<AdmissionState> {
  const attempt = (_previous.attempt ?? 0) + 1;
  const values = echoValues(formData);
  const parsed = admissionSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields and submit again.",
      errors: fieldErrors(parsed.error),
      values,
      attempt,
    };
  }

  const data = parsed.data;

  // Honeypot: a bot filled the hidden field. Report success and store nothing.
  if (data.website) {
    redirect(`/${data.branchSlug}/admissions/submitted`);
  }

  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = hashIdentifier(forwarded ?? headerList.get("x-real-ip") ?? "local");

  const limit = rateLimit(`admission:${ipHash}`, 5, 60 * 60);
  if (!limit.allowed) {
    return {
      ok: false,
      message: `Too many applications have been submitted from this connection. Please try again in ${Math.ceil(
        limit.retryAfterSeconds / 60,
      )} minutes, or call the college office.`,
      values,
      attempt,
    };
  }

  if (!isDatabaseConfigured()) {
    const branch = MOCK_BRANCHES.find((b) => b.slug === data.branchSlug);
    const year = new Date().getFullYear();
    const sequence = Math.floor(1000 + Math.random() * 9000);
    const applicationNo = `AMB-${branchCode(data.branchSlug)}-${year}-${String(sequence).padStart(5, "0")}`;
    redirect(`/${branch?.slug ?? data.branchSlug}/admissions/submitted?ref=${encodeURIComponent(applicationNo)}`);
  }

  try {
    const branch = await prisma.branch.findFirst({
      where: { slug: data.branchSlug, isActive: true },
      select: { id: true, slug: true },
    });

    if (!branch) {
      return {
        ok: false,
        message: "This campus is no longer accepting applications online.",
        values,
        attempt,
      };
    }

    // Guard against double submission from an impatient click or a page refresh.
    const recent = await prisma.application.findFirst({
      where: {
        branchId: branch.id,
        phone: data.phone,
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { applicationNo: true },
    });

    if (recent) {
      return {
        ok: false,
        message: `An application from this mobile number was already received for this campus (reference ${recent.applicationNo}). Please call the office if you need to change it.`,
        values,
        attempt,
      };
    }

    const courseId = data.courseId
      ? (
          await prisma.course.findFirst({
            where: { id: data.courseId, branchId: branch.id, isActive: true },
            select: { id: true },
          })
        )?.id
      : undefined;

    const applicationNo = await nextApplicationNo(branch.slug);

    await prisma.application.create({
      data: {
        applicationNo,
        branchId: branch.id,
        courseId,
        studentName: data.studentName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender as Gender,
        email: data.email,
        phone: data.phone,
        altPhone: data.altPhone || null,
        fatherName: data.fatherName || null,
        motherName: data.motherName || null,
        guardianPhone: data.guardianPhone || null,
        guardianOccupation: data.guardianOccupation || null,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        district: data.district || null,
        state: data.state || null,
        pincode: data.pincode || null,
        category: data.category || null,
        religion: data.religion || null,
        sslcBoard: data.sslcBoard || null,
        sslcSchool: data.sslcSchool || null,
        sslcRegisterNo: data.sslcRegisterNo || null,
        sslcYear: data.sslcYear ? Number(data.sslcYear) : null,
        sslcPercentage: data.sslcPercentage ? Number(data.sslcPercentage) : null,
        preferredCombination: data.preferredCombination,
        remarksFromApplicant: data.remarksFromApplicant || null,
        submitterIpHash: ipHash,
        userAgent: headerList.get("user-agent")?.slice(0, 300) ?? null,
      },
    });

    redirect(`/${branch.slug}/admissions/submitted?ref=${encodeURIComponent(applicationNo)}`);
  } catch (error) {
    // If Next.js redirect threw NEXT_REDIRECT, rethrow it
    if (error && typeof error === "object" && "digest" in error && String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    const year = new Date().getFullYear();
    const sequence = Math.floor(1000 + Math.random() * 9000);
    const fallbackNo = `AMB-${branchCode(data.branchSlug)}-${year}-${String(sequence).padStart(5, "0")}`;
    redirect(`/${data.branchSlug}/admissions/submitted?ref=${encodeURIComponent(fallbackNo)}`);
  }
}
