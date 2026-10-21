"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  endSession,
  getCurrentUser,
  hashPassword,
  startSession,
  verifyPassword,
} from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { hashIdentifier } from "@/lib/crypto";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { changePasswordSchema, fieldErrors, loginSchema } from "@/lib/validation";

export type AuthState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Echoed back so a failed attempt does not clear the email field. */
  values?: { email?: string };
  attempt?: number;
};

async function requestIpHash() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return hashIdentifier(forwarded ?? headerList.get("x-real-ip") ?? "local");
}

export async function login(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const typedEmail = String(formData.get("email") ?? "");
  const attempt = (_previous.attempt ?? 0) + 1;
  const echo = { values: { email: typedEmail }, attempt };

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), ...echo };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const ipHash = await requestIpHash();

  // Two limiters: one slows a single account being guessed at from anywhere,
  // the other slows one source spraying many accounts.
  const perAccount = rateLimit(`login:acct:${email}`, 8, 15 * 60);
  const perSource = rateLimit(`login:ip:${ipHash}`, 20, 15 * 60);

  if (!perAccount.allowed || !perSource.allowed) {
    const wait = Math.max(perAccount.retryAfterSeconds, perSource.retryAfterSeconds);
    return {
      ok: false,
      message: `Too many sign-in attempts. Please try again in ${Math.ceil(wait / 60)} minutes.`,
      ...echo,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
      isActive: true,
      sessionVersion: true,
      mustChangePassword: true,
    },
  });

  // Always run a comparison so a missing account and a wrong password take
  // the same amount of time and cannot be told apart from outside.
  const placeholder = "$2b$12$0000000000000000000000000000000000000000000000000000";
  const passwordOk = await verifyPassword(
    parsed.data.password,
    user?.passwordHash ?? placeholder,
  );

  if (!user || !passwordOk || !user.isActive) {
    await recordAudit({
      action: "auth.login_failed",
      entity: "User",
      summary: email,
      ipHash,
    });

    return { ok: false, message: "Incorrect email or password.", ...echo };
  }

  resetRateLimit(`login:acct:${email}`);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await startSession(user.id, user.sessionVersion);

  await recordAudit({
    userId: user.id,
    action: "auth.login",
    entity: "User",
    entityId: user.id,
    ipHash,
  });

  const next = String(formData.get("next") ?? "");
  const safeNext = next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";

  redirect(user.mustChangePassword ? "/admin/account?first=1" : safeNext);
}

export async function logout() {
  const user = await getCurrentUser();

  if (user) {
    await recordAudit({
      userId: user.id,
      action: "auth.logout",
      entity: "User",
      entityId: user.id,
    });
  }

  await endSession();
  redirect("/admin/login");
}

export async function changePassword(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Your session has expired. Please sign in again." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!record || !(await verifyPassword(parsed.data.currentPassword, record.passwordHash))) {
    return { ok: false, errors: { currentPassword: "That is not your current password." } };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  // Bumping sessionVersion signs out every other device immediately…
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      mustChangePassword: false,
      sessionVersion: { increment: 1 },
    },
    select: { sessionVersion: true },
  });

  // …so this device needs a token carrying the new version.
  await startSession(user.id, updated.sessionVersion);

  await recordAudit({
    userId: user.id,
    action: "auth.password_changed",
    entity: "User",
    entityId: user.id,
    ipHash: await requestIpHash(),
  });

  return { ok: true, message: "Your password has been changed." };
}
