import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

/**
 * Built from the database so a new campus, notice or album is discoverable
 * without anyone remembering to update a list.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const [branches, news, albums] = await Promise.all([
    prisma.branch.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.newsItem.findMany({
      where: {
        isPublished: true,
        publishedAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { publishedAt: "desc" },
      take: 500,
      select: { slug: true, updatedAt: true, branch: { select: { slug: true } } },
    }),
    prisma.galleryAlbum.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/news`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  const branchPages: MetadataRoute.Sitemap = branches.flatMap((branch) =>
    [
      "",
      "/about",
      "/courses",
      "/faculty",
      "/results",
      "/gallery",
      "/news",
      "/contact",
      "/admissions",
    ].map((path) => ({
      url: `${base}/${branch.slug}${path}`,
      lastModified: branch.updatedAt,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 0.9 : path === "/admissions" ? 0.85 : 0.6,
    })),
  );

  const newsPages: MetadataRoute.Sitemap = news.map((item) => ({
    url: item.branch
      ? `${base}/${item.branch.slug}/news/${item.slug}`
      : `${base}/news/${item.slug}`,
    lastModified: item.updatedAt,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  const albumPages: MetadataRoute.Sitemap = albums.map((album) => ({
    url: `${base}/gallery/${album.slug}`,
    lastModified: album.updatedAt,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...staticPages, ...branchPages, ...newsPages, ...albumPages];
}
