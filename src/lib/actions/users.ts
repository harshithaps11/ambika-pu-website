"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Capability, Role } from "@/generated/prisma/enums";
import { recordAudit } from "@/lib/audit";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { ALL_CAPABILITIES, capabilityLabel } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { fieldErrors } from "@/lib/validation";

export type UserActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Shown once, immediately after creating an account or resetting a password. */
  temporaryPassword?: string;
};

/** Only an owner may administer accounts. */
async function requireOwnerAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.OWNER) return null;
  return user;
}

/**
 * A readable temporary password: random, but easy to read aloud over the
 * phone to a staff member who then has to change it on first sign-in.
 */
function temporaryPassword() {
  const words = ["Ambika", "Puttur", "Campus", "College", "Vidya", "Deepa"];
  const word = words[randomBytes(1)[0] % words.length];
  const digits = (randomBytes(2).readUInt16BE(0) % 9000) + 1000;
  const symbol = "@#$%"[randomBytes(1)[0] % 4];
  return `${word}${symbol}${digits}pu`;
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Enter the staff member's name").max(120),
  email: z.email("Enter a valid email address").max(160),
  allBranches: z.coerce.boolean().optional(),
});

export async function createStaffUser(
  _previous: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const owner = await requireOwnerAction();
  if (!owner) return { ok: false, message: "Only the site owner can add accounts." };

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    allBranches: formData.get("allBranches") === "on",
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const email = parsed.data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return { ok: false, errors: { email: "An account with this email already exists." } };
  }

  const password = temporaryPassword();
  const branchIds = formData.getAll("branchIds").map(String).filter(Boolean);
  const capabilities = formData
    .getAll("capabilities")
    .map(String)
    .filter((value): value is Capability =>
      ALL_CAPABILITIES.includes(value as Capability),
    );

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(password),
      role: Role.COLLEGE_ADMIN,
      allBranches: parsed.data.allBranches ?? false,
      mustChangePassword: true,
      createdById: owner.id,
      capabilities: {
        create: capabilities.map((capability) => ({
          capability,
          grantedById: owner.id,
        })),
      },
      branchAccess: {
        create: branchIds.map((branchId) => ({ branchId })),
      },
    },
    select: { id: true, email: true },
  });

  await recordAudit({
    userId: owner.id,
    action: "user.created",
    entity: "User",
    entityId: user.id,
    summary: `${user.email} with ${capabilities.length} permissions`,
  });

  revalidatePath("/admin/users");

  return {
    ok: true,
    message: `Account created for ${user.email}.`,
    temporaryPassword: password,
  };
}

export async function updateStaffPermissions(
  _previous: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const owner = await requireOwnerAction();
  if (!owner) return { ok: false, message: "Only the site owner can change permissions." };

  const userId = String(formData.get("userId") ?? "");

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!target) return { ok: false, message: "Account not found." };

  if (target.role === Role.OWNER) {
    return {
      ok: false,
      message: "Owner accounts always hold every permission and cannot be limited here.",
    };
  }

  const requested = formData
    .getAll("capabilities")
    .map(String)
    .filter((value): value is Capability =>
      ALL_CAPABILITIES.includes(value as Capability),
    );

  const branchIds = formData.getAll("branchIds").map(String).filter(Boolean);
  const allBranches = formData.get("allBranches") === "on";
  const isActive = formData.get("isActive") === "on";

  const current = await prisma.userCapability.findMany({
    where: { userId },
    select: { capability: true },
  });

  const currentSet = new Set(current.map((row) => row.capability));
  const requestedSet = new Set(requested);

  const added = requested.filter((capability) => !currentSet.has(capability));
  const removed = [...currentSet].filter((capability) => !requestedSet.has(capability));

  // One transaction so a half-applied permission change can never be observed.
  await prisma.$transaction([
    prisma.userCapability.deleteMany({
      where: { userId, capability: { in: removed } },
    }),
    prisma.userCapability.createMany({
      data: added.map((capability) => ({
        userId,
        capability,
        grantedById: owner.id,
      })),
      skipDuplicates: true,
    }),
    prisma.branchAccess.deleteMany({
      where: { userId, branchId: { notIn: branchIds.length ? branchIds : ["__none__"] } },
    }),
    ...branchIds.map((branchId) =>
      prisma.branchAccess.upsert({
        where: { userId_branchId: { userId, branchId } },
        update: {},
        create: { userId, branchId },
      }),
    ),
    prisma.user.update({
      where: { id: userId },
      data: {
        allBranches,
        isActive,
        // Revoking access takes effect on the very next request anyway, but
        // deactivating should also drop any session already open.
        ...(isActive ? {} : { sessionVersion: { increment: 1 } }),
      },
    }),
  ]);

  await recordAudit({
    userId: owner.id,
    action: "user.permissions_updated",
    entity: "User",
    entityId: userId,
    summary: [
      added.length ? `granted ${added.map(capabilityLabel).join(", ")}` : null,
      removed.length ? `revoked ${removed.map(capabilityLabel).join(", ")}` : null,
      isActive ? null : "account deactivated",
    ]
      .filter(Boolean)
      .join("; ") || "no permission change",
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return {
    ok: true,
    message:
      added.length || removed.length
        ? `Saved. ${added.length} granted, ${removed.length} revoked. The change applies immediately.`
        : "Saved.",
  };
}

export async function resetStaffPassword(
  _previous: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const owner = await requireOwnerAction();
  if (!owner) return { ok: false, message: "Only the site owner can reset passwords." };

  const userId = String(formData.get("userId") ?? "");

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!target) return { ok: false, message: "Account not found." };
  if (target.id === owner.id) {
    return {
      ok: false,
      message: "Change your own password from the My Account page instead.",
    };
  }

  const password = temporaryPassword();

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(password),
      mustChangePassword: true,
      sessionVersion: { increment: 1 },
    },
  });

  await recordAudit({
    userId: owner.id,
    action: "user.password_reset",
    entity: "User",
    entityId: userId,
    summary: target.email,
  });

  revalidatePath(`/admin/users/${userId}`);

  return {
    ok: true,
    message: `A new temporary password has been set for ${target.email}. They will be asked to change it when they sign in.`,
    temporaryPassword: password,
  };
}
