"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Capability } from "@/generated/prisma/enums";
import { recordAudit } from "@/lib/audit";
import { tags } from "@/lib/cache-tags";
import { apiCapability, canAccessBranch } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils";
import { fieldErrors, newsSchema } from "@/lib/validation";

export type NewsFormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  attempt?: number;
};

/**
 * Refreshes every public surface that can show a notice.
 *
 * `{ expire: 0 }` drops the cached entry straight away rather than merely
 * marking it stale, so a notice published in the panel is on the website by
 * the time the editor clicks through to look at it.
 */
function refreshPublicNews() {
  revalidateTag(tags.news, { expire: 0 });
  revalidateTag(tags.ticker, { expire: 0 });
  revalidatePath("/", "layout");
}

function toDate(value: string | undefined, fallback?: Date) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export async function saveNewsItem(
  _previous: NewsFormState,
  formData: FormData,
): Promise<NewsFormState> {
  let user;

  try {
    user = await apiCapability(Capability.NEWS_MANAGE);
  } catch {
    return { ok: false, message: "You do not have permission to manage notices." };
  }

  const attempt = (_previous.attempt ?? 0) + 1;
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }

  const id = String(formData.get("id") ?? "");

  const parsed = newsSchema.safeParse({
    branchId: formData.get("branchId") ?? "",
    title: formData.get("title"),
    category: formData.get("category"),
    summary: formData.get("summary") ?? "",
    body: formData.get("body") ?? "",
    linkUrl: formData.get("linkUrl") ?? "",
    attachmentUrl: formData.get("attachmentUrl") ?? "",
    publishedAt: formData.get("publishedAt") ?? "",
    expiresAt: formData.get("expiresAt") ?? "",
    isTicker: formData.get("isTicker") === "on",
    isPinned: formData.get("isPinned") === "on",
    isPublished: formData.get("isPublished") === "on",
  });

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
  const branchId = data.branchId || null;

  if (!canAccessBranch(user, branchId)) {
    return {
      ok: false,
      message: branchId
        ? "You cannot publish to that campus."
        : "Only an account with access to every campus can publish an institution-wide notice.",
      values,
      attempt,
    };
  }

  const payload = {
    branchId,
    title: data.title,
    category: data.category,
    summary: data.summary || null,
    body: data.body || null,
    linkUrl: data.linkUrl || null,
    attachmentUrl: data.attachmentUrl || null,
    isTicker: Boolean(data.isTicker),
    isPinned: Boolean(data.isPinned),
    isPublished: Boolean(data.isPublished),
    publishedAt: toDate(data.publishedAt, new Date())!,
    expiresAt: toDate(data.expiresAt) ?? null,
  };

  if (id) {
    const existing = await prisma.newsItem.findUnique({
      where: { id },
      select: { id: true, branchId: true, title: true },
    });

    if (!existing) return { ok: false, message: "Notice not found.", values, attempt };

    if (!canAccessBranch(user, existing.branchId)) {
      return { ok: false, message: "That notice belongs to another campus.", values, attempt };
    }

    await prisma.newsItem.update({ where: { id }, data: payload });

    await recordAudit({
      userId: user.id,
      action: "news.updated",
      entity: "NewsItem",
      entityId: id,
      summary: data.title,
    });
  } else {
    const slug = await uniqueSlug(data.title, async (candidate) =>
      Boolean(await prisma.newsItem.findUnique({ where: { slug: candidate }, select: { id: true } })),
    );

    const created = await prisma.newsItem.create({
      data: { ...payload, slug, createdById: user.id },
      select: { id: true },
    });

    await recordAudit({
      userId: user.id,
      action: "news.created",
      entity: "NewsItem",
      entityId: created.id,
      summary: data.title,
    });
  }

  refreshPublicNews();
  revalidatePath("/admin/news");
  redirect("/admin/news?saved=1");
}

export async function deleteNewsItem(formData: FormData) {
  const user = await apiCapability(Capability.NEWS_MANAGE);
  const id = String(formData.get("id") ?? "");

  const existing = await prisma.newsItem.findUnique({
    where: { id },
    select: { id: true, branchId: true, title: true },
  });

  if (!existing || !canAccessBranch(user, existing.branchId)) {
    redirect("/admin/news");
  }

  await prisma.newsItem.delete({ where: { id } });

  await recordAudit({
    userId: user.id,
    action: "news.deleted",
    entity: "NewsItem",
    entityId: id,
    summary: existing.title,
  });

  refreshPublicNews();
  revalidatePath("/admin/news");
  redirect("/admin/news?deleted=1");
}

/** Quick toggle straight from the list. */
export async function toggleNewsFlag(formData: FormData) {
  const user = await apiCapability(Capability.NEWS_MANAGE);
  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");

  if (!["isPublished", "isTicker", "isPinned"].includes(field)) {
    redirect("/admin/news");
  }

  const existing = await prisma.newsItem.findUnique({
    where: { id },
    select: { id: true, branchId: true, isPublished: true, isTicker: true, isPinned: true, title: true },
  });

  if (!existing || !canAccessBranch(user, existing.branchId)) {
    redirect("/admin/news");
  }

  const current = existing[field as "isPublished" | "isTicker" | "isPinned"];

  await prisma.newsItem.update({
    where: { id },
    data: { [field]: !current },
  });

  await recordAudit({
    userId: user.id,
    action: "news.toggled",
    entity: "NewsItem",
    entityId: id,
    summary: `${existing.title}: ${field} → ${!current}`,
  });

  refreshPublicNews();
  revalidatePath("/admin/news");
}
