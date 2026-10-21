import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/site/page-header";
import { getAlbumBySlug } from "@/lib/data/content";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return {};
  return { title: album.title, description: album.description ?? undefined };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);

  if (!album) notFound();

  return (
    <>
      <PageHeader
        title={album.title}
        description={album.description}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Gallery", href: "/gallery" },
          { label: album.title },
        ]}
      />

      <section className="py-12">
        <div className="container-site">
          <p className="mb-6 text-[0.82rem] text-ink-500">
            {album.images.length} photographs
            {album.eventDate ? ` · ${formatDate(album.eventDate)}` : ""}
            {album.branch ? ` · ${album.branch.shortName}` : ""}
          </p>

          {album.images.length === 0 ? (
            <p className="border border-dashed border-ink-300 bg-ink-50 px-5 py-12 text-center text-sm text-ink-500">
              Photographs for this album have not been uploaded yet.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {album.images.map((image) => (
                <li key={image.id} className="border border-ink-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.caption ?? album.title}
                    loading="lazy"
                    className="h-56 w-full object-cover"
                  />
                  {image.caption ? (
                    <p className="px-3 py-2 text-[0.8rem] text-ink-600">
                      {image.caption}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 border-t border-ink-200 pt-5">
            <Link
              href="/gallery"
              className="text-[0.82rem] font-semibold uppercase tracking-wider text-brand-700 underline underline-offset-4"
            >
              ← Back to all albums
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
