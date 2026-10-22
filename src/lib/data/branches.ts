import { unstable_cache } from "next/cache";
import { prisma } from "../prisma";
import { tags } from "../cache-tags";
import { isDatabaseConfigured, MOCK_BRANCHES } from "./mock-data";

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
  async () => {
    if (!isDatabaseConfigured()) {
      return MOCK_BRANCHES;
    }
    try {
      return await prisma.branch.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: "asc" },
        select: {
          ...BRANCH_CARD_FIELDS,
          _count: { select: { courses: { where: { isActive: true } } } },
        },
      });
    } catch {
      return MOCK_BRANCHES;
    }
  },
  ["branch-cards"],
  { tags: [tags.branches], revalidate: 300 },
);

export type BranchCard = Awaited<ReturnType<typeof getBranchCards>>[number];

/** Minimal list used by navigation menus and the sitemap. */
export const getBranchIndex = unstable_cache(
  async () => {
    if (!isDatabaseConfigured()) {
      return MOCK_BRANCHES.map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        shortName: b.shortName,
        themeColor: b.themeColor,
      }));
    }
    try {
      return await prisma.branch.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: "asc" },
        select: { id: true, slug: true, name: true, shortName: true, themeColor: true },
      });
    } catch {
      return MOCK_BRANCHES.map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        shortName: b.shortName,
        themeColor: b.themeColor,
      }));
    }
  },
  ["branch-index"],
  { tags: [tags.branches], revalidate: 600 },
);

export function getBranchBySlug(slug: string) {
  return unstable_cache(
    async () => {
      if (!isDatabaseConfigured()) {
        return MOCK_BRANCHES.find((b) => b.slug === slug && b.isActive) ?? null;
      }
      try {
        const found = await prisma.branch.findFirst({
          where: { slug, isActive: true },
        });
        return found ?? MOCK_BRANCHES.find((b) => b.slug === slug && b.isActive) ?? null;
      } catch {
        return MOCK_BRANCHES.find((b) => b.slug === slug && b.isActive) ?? null;
      }
    },
    ["branch-by-slug", slug],
    { tags: [tags.branches, tags.branch(slug)], revalidate: 300 },
  )();
}

/** Branches schema for SEO structured data */
export async function getBranchSchema() {
  if (!isDatabaseConfigured()) {
    return MOCK_BRANCHES.map((b) => ({
      slug: b.slug,
      name: b.name,
      city: b.city,
      district: b.district,
      state: b.state,
      pincode: b.pincode,
      addressLine1: b.addressLine1,
      phone: b.phone,
      email: b.email,
    }));
  }
  try {
    return await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      select: {
        slug: true,
        name: true,
        city: true,
        district: true,
        state: true,
        pincode: true,
        addressLine1: true,
        phone: true,
        email: true,
      },
    });
  } catch {
    return MOCK_BRANCHES.map((b) => ({
      slug: b.slug,
      name: b.name,
      city: b.city,
      district: b.district,
      state: b.state,
      pincode: b.pincode,
      addressLine1: b.addressLine1,
      phone: b.phone,
      email: b.email,
    }));
  }
}

/** Every branch, including inactive ones — admin use only. */
export async function listAllBranches() {
  if (!isDatabaseConfigured()) {
    return MOCK_BRANCHES;
  }
  try {
    return await prisma.branch.findMany({
      orderBy: { orderIndex: "asc" },
    });
  } catch {
    return MOCK_BRANCHES;
  }
}
