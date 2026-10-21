import { unstable_cache } from "next/cache";
import { prisma } from "../prisma";
import { tags } from "../cache-tags";

export function getCourses(branchId: string) {
  return unstable_cache(
    async () =>
      prisma.course.findMany({
        where: { branchId, isActive: true },
        orderBy: { orderIndex: "asc" },
      }),
    ["courses", branchId],
    { tags: [tags.courses(branchId)], revalidate: 600 },
  )();
}

export type CourseRecord = Awaited<ReturnType<typeof getCourses>>[number];

export function getFaculty(branchId: string) {
  return unstable_cache(
    async () =>
      prisma.faculty.findMany({
        where: { branchId, isActive: true },
        orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
      }),
    ["faculty", branchId],
    { tags: [tags.faculty(branchId)], revalidate: 600 },
  )();
}

export function getToppers(branchId: string, academicYear?: string) {
  return unstable_cache(
    async () =>
      prisma.topper.findMany({
        where: { branchId, ...(academicYear ? { academicYear } : {}) },
        orderBy: [{ academicYear: "desc" }, { orderIndex: "asc" }, { percentage: "desc" }],
        take: 12,
      }),
    ["toppers", branchId, academicYear ?? "latest"],
    { tags: [tags.toppers(branchId)], revalidate: 600 },
  )();
}

export function getHeroSlides(branchId: string | null) {
  const key = branchId ?? "main";

  return unstable_cache(
    async () =>
      prisma.heroSlide.findMany({
        where: { branchId, isActive: true },
        orderBy: { orderIndex: "asc" },
      }),
    ["hero", key],
    { tags: [tags.pages], revalidate: 600 },
  )();
}

export function getFacilities(branchId: string | null) {
  const key = branchId ?? "main";

  return unstable_cache(
    async () =>
      prisma.facility.findMany({
        where: { branchId },
        orderBy: { orderIndex: "asc" },
      }),
    ["facilities", key],
    { tags: [tags.pages], revalidate: 600 },
  )();
}

export function getStats(branchId: string | null) {
  const key = branchId ?? "main";

  return unstable_cache(
    async () =>
      prisma.statItem.findMany({
        where: { branchId },
        orderBy: { orderIndex: "asc" },
      }),
    ["stats", key],
    { tags: [tags.pages], revalidate: 600 },
  )();
}

export function getAlbums(branchId: string | null, take = 12) {
  const key = branchId ?? "main";

  return unstable_cache(
    async () =>
      prisma.galleryAlbum.findMany({
        where: { branchId, isPublished: true },
        orderBy: [{ orderIndex: "asc" }, { eventDate: "desc" }],
        take,
        include: {
          _count: { select: { images: true } },
          images: { orderBy: { orderIndex: "asc" }, take: 1 },
        },
      }),
    ["albums", key, String(take)],
    { tags: [tags.gallery], revalidate: 600 },
  )();
}

export function getAlbumBySlug(slug: string) {
  return prisma.galleryAlbum.findFirst({
    where: { slug, isPublished: true },
    include: {
      images: { orderBy: { orderIndex: "asc" } },
      branch: { select: { slug: true, shortName: true } },
    },
  });
}

/**
 * Editable prose for a page. Falls back to the institution-wide block when a
 * branch has not written its own, so a new campus is never blank.
 */
export function getPageContent(key: string, branchId: string | null) {
  const cacheKey = `${key}:${branchId ?? "main"}`;

  return unstable_cache(
    async () => {
      if (branchId) {
        const own = await prisma.pageContent.findUnique({
          where: { branchId_key: { branchId, key } },
        });
        if (own) return own;
      }

      return prisma.pageContent.findFirst({
        where: { branchId: null, key },
      });
    },
    ["page-content", cacheKey],
    { tags: [tags.pages], revalidate: 600 },
  )();
}

export function getFaqs(branchId: string | null) {
  const key = branchId ?? "main";

  return unstable_cache(
    async () =>
      prisma.faqEntry.findMany({
        where: {
          isActive: true,
          ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : { branchId: null }),
        },
        orderBy: { orderIndex: "asc" },
      }),
    ["faqs", key],
    { tags: [tags.faqs], revalidate: 300 },
  )();
}

/** Highest scorers across every branch — used on the main landing page. */
export const getFeaturedToppers = unstable_cache(
  async () => {
    const latest = await prisma.topper.findFirst({
      orderBy: { academicYear: "desc" },
      select: { academicYear: true },
    });

    if (!latest) return [];

    return prisma.topper.findMany({
      where: { academicYear: latest.academicYear },
      orderBy: [{ percentage: "desc" }],
      take: 4,
      include: { branch: { select: { shortName: true, slug: true } } },
    });
  },
  ["featured-toppers"],
  { tags: [tags.branches], revalidate: 900 },
);
