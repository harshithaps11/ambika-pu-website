import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Photo Gallery",
  description: "Photographs from events and campus life at both campuses.",
};

export default async function GalleryIndexPage() {
  // The main site shows albums from every campus plus institution-wide ones.
  const albums = await prisma.galleryAlbum.findMany({
    where: { isPublished: true },
    orderBy: [{ orderIndex: "asc" }, { eventDate: "desc" }],
    include: {
      branch: { select: { shortName: true } },
      images: { orderBy: { orderIndex: "asc" }, take: 1 },
      _count: { select: { images: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Photo Gallery"
        description="Events, activities and everyday life across the institution."
        crumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />

      <section className="py-12">
        <div className="container-site">
          {albums.length === 0 ? (
            <p className="border border-dashed border-ink-300 bg-ink-50 px-5 py-12 text-center text-sm text-ink-500">
              No photo albums have been published yet.
            </p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <li key={album.id}>
                  <Link
                    href={`/gallery/${album.slug}`}
                    className="group block overflow-hidden border border-ink-200 bg-white shadow-card transition-shadow hover:shadow-raise"
                  >
                    <span
                      className="block h-44 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${
                          album.coverImageUrl ??
                          album.images[0]?.url ??
                          "/images/campus-3.svg"
                        }')`,
                      }}
                    />
                    <span className="block px-4 py-3.5">
                      <span className="block font-serif text-[1rem] font-semibold text-ink-900 group-hover:text-brand-700">
                        {album.title}
                      </span>
                      <span className="mt-1 block text-[0.75rem] text-ink-500">
                        {album._count.images} photographs
                        {album.eventDate ? ` · ${formatDate(album.eventDate)}` : ""}
                        {album.branch ? ` · ${album.branch.shortName}` : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
