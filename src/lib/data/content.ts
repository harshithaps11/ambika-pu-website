import { unstable_cache } from "next/cache";
import { prisma } from "../prisma";
import { tags } from "../cache-tags";
import {
  isDatabaseConfigured,
  MOCK_ALBUMS,
  MOCK_COURSES,
  MOCK_FACILITIES,
  MOCK_FACULTY,
  MOCK_FAQS,
  MOCK_HERO_SLIDES,
  MOCK_PAGE_CONTENT,
  MOCK_STATS,
  MOCK_TOPPERS,
} from "./mock-data";

export function getCourses(branchId: string) {
  return unstable_cache(
    async () => {
      if (!isDatabaseConfigured()) {
        return MOCK_COURSES.filter(
          (c) => c.branchId === branchId && c.isActive,
        );
      }
      try {
        return await prisma.course.findMany({
          where: { branchId, isActive: true },
          orderBy: { orderIndex: "asc" },
        });
      } catch {
        return MOCK_COURSES.filter(
          (c) => c.branchId === branchId && c.isActive,
        );
      }
    },
    ["courses", branchId],
    { tags: [tags.courses(branchId)], revalidate: 600 },
  )();
}

export type CourseRecord = Awaited<ReturnType<typeof getCourses>>[number];

export function getFaculty(branchId: string) {
  return unstable_cache(
    async () => {
      if (!isDatabaseConfigured()) {
        return MOCK_FACULTY.filter(
          (f) => f.branchId === branchId && f.isActive,
        );
      }
      try {
        return await prisma.faculty.findMany({
          where: { branchId, isActive: true },
          orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
        });
      } catch {
        return MOCK_FACULTY.filter(
          (f) => f.branchId === branchId && f.isActive,
        );
      }
    },
    ["faculty", branchId],
    { tags: [tags.faculty(branchId)], revalidate: 600 },
  )();
}

export function getToppers(branchId: string, academicYear?: string) {
  return unstable_cache(
    async () => {
      if (!isDatabaseConfigured()) {
        return MOCK_TOPPERS.filter(
          (t) =>
            t.branchId === branchId &&
            (!academicYear || t.academicYear === academicYear),
        ).slice(0, 12);
      }
      try {
        return await prisma.topper.findMany({
          where: { branchId, ...(academicYear ? { academicYear } : {}) },
          orderBy: [
            { academicYear: "desc" },
            { orderIndex: "asc" },
            { percentage: "desc" },
          ],
          take: 12,
        });
      } catch {
        return MOCK_TOPPERS.filter(
          (t) =>
            t.branchId === branchId &&
            (!academicYear || t.academicYear === academicYear),
        ).slice(0, 12);
      }
    },
    ["toppers", branchId, academicYear ?? "latest"],
    { tags: [tags.toppers(branchId)], revalidate: 600 },
  )();
}

export function getHeroSlides(branchId: string | null) {
  const key = branchId ?? "main";

  return unstable_cache(
    async () => {
      if (!isDatabaseConfigured()) {
        return MOCK_HERO_SLIDES.filter(
          (s) => s.branchId === branchId && s.isActive,
        );
      }
      try {
        return await prisma.heroSlide.findMany({
          where: { branchId, isActive: true },
          orderBy: { orderIndex: "asc" },
        });
      } catch {
        return MOCK_HERO_SLIDES.filter(
          (s) => s.branchId === branchId && s.isActive,
        );
      }
    },
    ["hero", key],
    { tags: [tags.pages], revalidate: 600 },
  )();
}

export function getFacilities(branchId: string | null) {
  const key = branchId ?? "main";

  return unstable_cache(
    async () => {
      if (!isDatabaseConfigured()) {
        return MOCK_FACILITIES.filter(
          (f) => f.branchId === branchId || (branchId === null && f.branchId === null),
        );
      }
      try {
        return await prisma.facility.findMany({
          where: { branchId },
          orderBy: { orderIndex: "asc" },
        });
      } catch {
        return MOCK_FACILITIES.filter(
          (f) => f.branchId === branchId || (branchId === null && f.branchId === null),
        );
      }
    },
    ["facilities", key],
    { tags: [tags.pages], revalidate: 600 },
  )();
}

export function getStats(branchId: string | null) {
  const key = branchId ?? "main";

  return unstable_cache(
    async () => {
      if (!isDatabaseConfigured()) {
        return MOCK_STATS.filter((s) => s.branchId === branchId);
      }
      try {
        return await prisma.statItem.findMany({
          where: { branchId },
          orderBy: { orderIndex: "asc" },
        });
      } catch {
        return MOCK_STATS.filter((s) => s.branchId === branchId);
      }
    },
    ["stats", key],
    { tags: [tags.pages], revalidate: 600 },
  )();
}

export function getAlbums(branchId: string | null, take = 12) {
  const key = branchId ?? "main";

  return unstable_cache(
    async () => {
      if (!isDatabaseConfigured()) {
        return MOCK_ALBUMS.filter(
          (a) => branchId === null || a.branchId === branchId || a.branchId === null,
        ).slice(0, take);
      }
      try {
        return await prisma.galleryAlbum.findMany({
          where: branchId ? { branchId, isPublished: true } : { isPublished: true },
          orderBy: [{ orderIndex: "asc" }, { eventDate: "desc" }],
          take,
          include: {
            _count: { select: { images: true } },
            images: { orderBy: { orderIndex: "asc" }, take: 1 },
            branch: { select: { shortName: true } },
          },
        });
      } catch {
        return MOCK_ALBUMS.filter(
          (a) => branchId === null || a.branchId === branchId || a.branchId === null,
        ).slice(0, take);
      }
    },
    ["albums", key, String(take)],
    { tags: [tags.gallery], revalidate: 600 },
  )();
}

export async function getAlbumBySlug(slug: string) {
  if (!isDatabaseConfigured()) {
    const found = MOCK_ALBUMS.find((a) => a.slug === slug);
    return found ?? null;
  }
  try {
    const found = await prisma.galleryAlbum.findFirst({
      where: { slug, isPublished: true },
      include: {
        images: { orderBy: { orderIndex: "asc" } },
        branch: { select: { slug: true, shortName: true } },
      },
    });
    return found ?? MOCK_ALBUMS.find((a) => a.slug === slug) ?? null;
  } catch {
    return MOCK_ALBUMS.find((a) => a.slug === slug) ?? null;
  }
}

/**
 * Editable prose for a page. Falls back to the institution-wide block when a
 * branch has not written its own, so a new campus is never blank.
 */
export function getPageContent(key: string, branchId: string | null) {
  const cacheKey = `${key}:${branchId ?? "main"}`;

  return unstable_cache(
    async () => {
      if (!isDatabaseConfigured()) {
        const item = MOCK_PAGE_CONTENT[key];
        if (!item) return null;
        return {
          id: `page_${key}`,
          branchId,
          key,
          title: item.title,
          body: item.body,
          updatedById: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        };
      }
      try {
        if (branchId) {
          const own = await prisma.pageContent.findUnique({
            where: { branchId_key: { branchId, key } },
          });
          if (own) return own;
        }

        const fallback = await prisma.pageContent.findFirst({
          where: { branchId: null, key },
        });
        if (fallback) return fallback;

        const mockItem = MOCK_PAGE_CONTENT[key];
        if (!mockItem) return null;
        return {
          id: `page_${key}`,
          branchId,
          key,
          title: mockItem.title,
          body: mockItem.body,
          updatedById: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        };
      } catch {
        const item = MOCK_PAGE_CONTENT[key];
        if (!item) return null;
        return {
          id: `page_${key}`,
          branchId,
          key,
          title: item.title,
          body: item.body,
          updatedById: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        };
      }
    },
    ["page-content", cacheKey],
    { tags: [tags.pages], revalidate: 600 },
  )();
}

export function getFaqs(branchId: string | null) {
  const key = branchId ?? "main";

  return unstable_cache(
    async () => {
      if (!isDatabaseConfigured()) {
        return MOCK_FAQS.filter(
          (f) =>
            f.isActive &&
            (branchId ? f.branchId === branchId || f.branchId === null : f.branchId === null),
        );
      }
      try {
        return await prisma.faqEntry.findMany({
          where: {
            isActive: true,
            ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : { branchId: null }),
          },
          orderBy: { orderIndex: "asc" },
        });
      } catch {
        return MOCK_FAQS.filter(
          (f) =>
            f.isActive &&
            (branchId ? f.branchId === branchId || f.branchId === null : f.branchId === null),
        );
      }
    },
    ["faqs", key],
    { tags: [tags.faqs], revalidate: 300 },
  )();
}

/** Highest scorers across every branch — used on the main landing page. */
export const getFeaturedToppers = unstable_cache(
  async () => {
    if (!isDatabaseConfigured()) {
      return MOCK_TOPPERS.slice(0, 4);
    }
    try {
      const latest = await prisma.topper.findFirst({
        orderBy: { academicYear: "desc" },
        select: { academicYear: true },
      });

      if (!latest) return MOCK_TOPPERS.slice(0, 4);

      return await prisma.topper.findMany({
        where: { academicYear: latest.academicYear },
        orderBy: [{ percentage: "desc" }],
        take: 4,
        include: { branch: { select: { shortName: true, slug: true } } },
      });
    } catch {
      return MOCK_TOPPERS.slice(0, 4);
    }
  },
  ["featured-toppers"],
  { tags: [tags.branches], revalidate: 900 },
);
