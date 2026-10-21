"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import { Capability } from "@/generated/prisma/enums";
import { apiCapability, canAccessBranch } from "@/lib/permissions";
import { ApplicationStatus } from "@/generated/prisma/enums";

export type ApplicationUpdateState = { ok: boolean; message?: string };

const STATUSES = Object.values(ApplicationStatus) as string[];

export async function updateApplication(
  _previous: ApplicationUpdateState,
  formData: FormData,
): Promise<ApplicationUpdateState> {
  let user;

  try {
    user = await apiCapability(Capability.APPLICATION_MANAGE);
  } catch {
    return { ok: false, message: "You do not have permission to change applications." };
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const internalNotes = String(formData.get("internalNotes") ?? "").slice(0, 4000);

  if (!id || !STATUSES.includes(status)) {
    return { ok: false, message: "Invalid request." };
  }

  const application = await prisma.application.findUnique({
    where: { id },
    select: { id: true, branchId: true, applicationNo: true, status: true },
  });

  if (!application) return { ok: false, message: "Application not found." };

  if (!canAccessBranch(user, application.branchId)) {
    return { ok: false, message: "This application belongs to a campus you cannot access." };
  }

  await prisma.application.update({
    where: { id },
    data: {
      status: status as ApplicationStatus,
      internalNotes: internalNotes || null,
      reviewedById: user.id,
      reviewedAt: new Date(),
    },
  });

  await recordAudit({
    userId: user.id,
    action: "application.updated",
    entity: "Application",
    entityId: id,
    summary: `${application.applicationNo}: ${application.status} → ${status}`,
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);

  return { ok: true, message: "Application updated." };
}
