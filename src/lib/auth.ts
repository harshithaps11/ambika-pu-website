import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Capability, Role } from "@/generated/prisma/enums";

const SESSION_COOKIE = "ambika_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // one working day
const BCRYPT_ROUNDS = 12;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  allBranches: boolean;
  mustChangePassword: boolean;
  /** Abilities granted by an owner. Empty for a staff account with no grants. */
  capabilities: Capability[];
  /** Branches this account may act on. Ignored when `allBranches` is true. */
  branchIds: string[];
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be set to at least 32 characters. Generate one with: openssl rand -base64 48",
    );
  }

  return new TextEncoder().encode(secret);
}

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

/**
 * Signs a short-lived session token. `v` pins the token to the user's current
 * `sessionVersion`, so bumping that column signs the account out everywhere.
 */
async function signSessionToken(userId: string, sessionVersion: number) {
  return new SignJWT({ v: sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function startSession(userId: string, sessionVersion: number) {
  const token = await signSessionToken(userId, sessionVersion);
  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Resolves the signed-in user for the current request.
 *
 * Every call re-reads the account from the database rather than trusting
 * claims baked into the cookie. That costs one indexed query per request and
 * buys the behaviour the college needs: when the owner revokes a permission
 * or deactivates an account, it takes effect on the very next request instead
 * of whenever the token happens to expire.
 *
 * `cache` dedupes the lookup across one render pass.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  let userId: string;
  let tokenVersion: number;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });

    if (!payload.sub || typeof payload.v !== "number") return null;
    userId = payload.sub;
    tokenVersion = payload.v;
  } catch {
    // Expired, tampered with, or signed by an older AUTH_SECRET.
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      allBranches: true,
      mustChangePassword: true,
      sessionVersion: true,
      capabilities: { select: { capability: true } },
      branchAccess: { select: { branchId: true } },
    },
  });

  if (!user || !user.isActive || user.sessionVersion !== tokenVersion) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    allBranches: user.allBranches,
    mustChangePassword: user.mustChangePassword,
    capabilities: user.capabilities.map((row) => row.capability),
    branchIds: user.branchAccess.map((row) => row.branchId),
  };
});

/** Signs every active session for a user out at once. */
export async function revokeAllSessions(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  });
}
