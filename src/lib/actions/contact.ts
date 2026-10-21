"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashIdentifier } from "@/lib/crypto";
import { rateLimit } from "@/lib/rate-limit";
import { contactSchema, fieldErrors } from "@/lib/validation";

export type ContactState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Echoed back so a validation error does not clear the message. */
  values?: Record<string, string>;
  attempt?: number;
};

export async function submitContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const attempt = (_previous.attempt ?? 0) + 1;
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "website" && typeof value === "string") values[key] = value;
  }

  const parsed = contactSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      errors: fieldErrors(parsed.error),
      values,
      attempt,
    };
  }

  const data = parsed.data;

  // Honeypot: acknowledge without storing anything.
  if (data.website) {
    return { ok: true, message: "Thank you. Your message has been sent." };
  }

  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = hashIdentifier(forwarded ?? headerList.get("x-real-ip") ?? "local");

  const limit = rateLimit(`contact:${ipHash}`, 6, 60 * 60);
  if (!limit.allowed) {
    return {
      ok: false,
      message:
        "Too many messages have been sent from this connection. Please try again later, or call the office directly.",
      values,
      attempt,
    };
  }

  const branch = data.branchSlug
    ? await prisma.branch.findFirst({
        where: { slug: data.branchSlug },
        select: { id: true },
      })
    : null;

  await prisma.contactMessage.create({
    data: {
      branchId: branch?.id ?? null,
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      subject: data.subject || null,
      message: data.message,
      submitterIpHash: ipHash,
    },
  });

  return {
    ok: true,
    message:
      "Thank you. Your message has reached the college office and we will get back to you.",
  };
}
