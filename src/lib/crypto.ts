import { createHash } from "node:crypto";

/**
 * One-way hash for request metadata. Lets the office spot repeat abusive
 * submissions without the site ever storing a visitor's raw IP address.
 */
export function hashIdentifier(value: string | null | undefined) {
  if (!value) return null;
  const salt = process.env.AUTH_SECRET ?? "ambika-fallback-salt";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 32);
}
