import { unstable_cache } from "next/cache";
import { prisma } from "../prisma";
import { tags } from "../cache-tags";
import type { NewsCategory } from "@/generated/prisma/enums";

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

function scopeWhere({ branchId, categories, allBranches }: NewsScope) {
  const now = new Date();

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

/**
 * Headlines for the scrolling ticker: pinned first, then newest.
 * Institution-wide items always scroll on every branch site too.
 */
export function getTickerItems(branchId?: string | null) {
  const key = branchId ?? "main";

  return unstable_cache(
    async () =>
      prisma.newsItem.findMany({
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
      }),
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
    async () =>
      prisma.newsItem.findMany({
        where: scopeWhere(scope),
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        take: scope.take ?? 6,
        select: LIST_FIELDS,
      }),
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
}

export function getNewsBySlug(slug: string) {
  return prisma.newsItem.findFirst({
    where: { slug, isPublished: true },
    include: { branch: { select: { slug: true, name: true, shortName: true } } },
  });
}
