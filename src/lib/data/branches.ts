import { unstable_cache } from "next/cache";
import { prisma } from "../prisma";
import { tags } from "../cache-tags";

const BRANCH_CARD_FIELDS = {
  id: true,
  slug: true,
  name: true,
  shortName: true,
  tagline: true,
  about: true,
  city: true,
  district: true,
  phone: true,
  email: true,
  themeColor: true,
  admissionOpen: true,
  establishedYear: true,
} as const;

/** Branches shown on the main landing page, in display order. */
export const getBranchCards = unstable_cache(
  async () =>
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      select: {
        ...BRANCH_CARD_FIELDS,
        _count: { select: { courses: { where: { isActive: true } } } },
      },
    }),
  ["branch-cards"],
  { tags: [tags.branches], revalidate: 300 },
);

export type BranchCard = Awaited<ReturnType<typeof getBranchCards>>[number];

/** Minimal list used by navigation menus and the sitemap. */
export const getBranchIndex = unstable_cache(
  async () =>
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      select: { id: true, slug: true, name: true, shortName: true, themeColor: true },
    }),
  ["branch-index"],
  { tags: [tags.branches], revalidate: 600 },
);

export function getBranchBySlug(slug: string) {
  return unstable_cache(
    async () =>
      prisma.branch.findFirst({
        where: { slug, isActive: true },
      }),
    ["branch-by-slug", slug],
    { tags: [tags.branches, tags.branch(slug)], revalidate: 300 },
  )();
}

/** Every branch, including inactive ones — admin use only. */
export function listAllBranches() {
  return prisma.branch.findMany({
    orderBy: { orderIndex: "asc" },
  });
}
