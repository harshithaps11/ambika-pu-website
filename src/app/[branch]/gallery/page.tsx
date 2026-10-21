import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { getAlbums } from "@/lib/data/content";
import { requireBranch } from "@/lib/data/require-branch";
import { formatDate } from "@/lib/utils";

export const revalidate = 600;

type Props = { params: Promise<{ branch: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  return { title: `Photo Gallery — ${branch.shortName}` };
}

export default async function BranchGalleryPage({ params }: Props) {
  const { branch: slug } = await params;
  const branch = await requireBranch(slug);
  const albums = await getAlbums(branch.id, 36);

  return (
    <>
      <PageHeader
        title="Photo Gallery"
        description="Photographs from events, activities and everyday life on this campus."
        crumbs={[{ label: "Home", href: `/${branch.slug}` }, { label: "Gallery" }]}
      />

      <section className="py-12">
        <div className="container-site">
          {albums.length === 0 ? (
            <p className="border border-dashed border-ink-300 bg-ink-50 px-5 py-10 text-center text-sm text-ink-500">
              No photo albums have been published for this campus yet.
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
                          "/images/campus-2.svg"
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
