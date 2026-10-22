import { unstable_cache } from "next/cache";
import { prisma } from "../prisma";
import { tags } from "../cache-tags";
import type { NewsCategory } from "@/generated/prisma/enums";
import { isDatabaseConfigured, MOCK_NEWS } from "./mock-data";

const LIST_FIELDS = {
  id: true,
  title: true,
  slug: true,
  category: true,
  summary: true,
  publishedAt: true,
  isPinned: true,
  linkUrl: true,
  attachmentUrl: true,
  branch: { select: { slug: true, shortName: true } },
} as const;

type NewsScope = {
  /** Branch to include alongside institution-wide items. */
  branchId?: string | null;
  /**
   * Main-site listings show everything the institution has published,
   * including each campus's own notices.
   */
  allBranches?: boolean;
  categories?: NewsCategory[];
  take?: number;
};

function scopeWhere(scope: NewsScope) {
  const now = new Date();
  const { branchId, categories, allBranches } = scope;

  const branchClause = allBranches
    ? {}
    : branchId
      ? { OR: [{ branchId }, { branchId: null }] }
      : { branchId: null };

  const base = {
    isPublished: true,
    publishedAt: { lte: now },
    AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }, branchClause],
  };

  if (categories?.length) {
    return { ...base, category: { in: categories } };
  }

  return base;
}

function filterMockNews(scope: NewsScope = {}) {
  const { branchId, categories, allBranches } = scope;
  return MOCK_NEWS.filter((item) => {
    if (!item.isPublished) return false;
    if (categories?.length && !categories.includes(item.category)) return false;
    if (allBranches) return true;
    if (branchId) return item.branchId === branchId || item.branchId === null;
    return item.branchId === null;
  }).sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });
}

/**
 * Headlines for the scrolling ticker: pinned first, then newest.
 * Institution-wide items always scroll on every branch site too.
 */
export function getTickerItems(branchId?: string | null) {
  const key = branchId ?? "main";

  return unstable_cache(
    async () => {
      if (!isDatabaseConfigured()) {
        return filterMockNews({ branchId })
          .filter((item) => item.isTicker)
          .slice(0, 12)
          .map((item) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            category: item.category,
            linkUrl: item.linkUrl,
            publishedAt: item.publishedAt,
          }));
      }
      try {
        return await prisma.newsItem.findMany({
          where: { ...scopeWhere({ branchId }), isTicker: true },
          orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
          take: 12,
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            linkUrl: true,
            publishedAt: true,
          },
        });
      } catch {
        return filterMockNews({ branchId })
          .filter((item) => item.isTicker)
          .slice(0, 12)
          .map((item) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            category: item.category,
            linkUrl: item.linkUrl,
            publishedAt: item.publishedAt,
          }));
      }
    },
    ["ticker", key],
    { tags: [tags.ticker, tags.news], revalidate: 60 },
  )();
}

export function getLatestNews(scope: NewsScope = {}) {
  const key = [
    scope.allBranches ? "all-branches" : (scope.branchId ?? "main"),
    scope.categories?.join("|") ?? "all",
    String(scope.take ?? 6),
  ];

  return unstable_cache(
    async () => {
      if (!isDatabaseConfigured()) {
        return filterMockNews(scope).slice(0, scope.take ?? 6);
      }
      try {
        return await prisma.newsItem.findMany({
          where: scopeWhere(scope),
          orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
          take: scope.take ?? 6,
          select: LIST_FIELDS,
        });
      } catch {
        return filterMockNews(scope).slice(0, scope.take ?? 6);
      }
    },
    ["latest-news", ...key],
    { tags: [tags.news], revalidate: 120 },
  )();
}

export type NewsListItem = Awaited<ReturnType<typeof getLatestNews>>[number];

/** Paginated archive listing. */
export async function getNewsPage(
  scope: NewsScope & { page?: number; perPage?: number } = {},
) {
  const perPage = scope.perPage ?? 10;
  const page = Math.max(1, scope.page ?? 1);

  if (!isDatabaseConfigured()) {
    const all = filterMockNews(scope);
    const total = all.length;
    const items = all.slice((page - 1) * perPage, page * perPage);
    return {
      items,
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  try {
    const where = scopeWhere(scope);
    const [items, total] = await Promise.all([
      prisma.newsItem.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * perPage,
        take: perPage,
        select: LIST_FIELDS,
      }),
      prisma.newsItem.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  } catch {
    const all = filterMockNews(scope);
    const total = all.length;
    const items = all.slice((page - 1) * perPage, page * perPage);
    return {
      items,
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }
}

export async function getNewsBySlug(slug: string) {
  if (!isDatabaseConfigured()) {
    return MOCK_NEWS.find((n) => n.slug === slug) ?? null;
  }
  try {
    const item = await prisma.newsItem.findFirst({
      where: { slug, isPublished: true },
      include: { branch: { select: { slug: true, name: true, shortName: true } } },
    });
    return item ?? MOCK_NEWS.find((n) => n.slug === slug) ?? null;
  } catch {
    return MOCK_NEWS.find((n) => n.slug === slug) ?? null;
  }
}
