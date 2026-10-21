import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader, EmptyState, Panel } from "@/components/admin/ui";
import { ResourceForm, type FieldSpec } from "@/components/admin/resource-form";
import { Capability } from "@/generated/prisma/enums";
import { addAlbumImage, deleteAlbumImage } from "@/lib/actions/content";
import { canAccessBranch, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Album photographs" };

export default async function AlbumImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCapability(Capability.GALLERY_MANAGE);

  const album = await prisma.galleryAlbum.findUnique({
    where: { id },
    include: {
      images: { orderBy: { orderIndex: "asc" } },
      branch: { select: { shortName: true } },
    },
  });

  if (!album || !canAccessBranch(user, album.branchId)) notFound();

  const fields: FieldSpec[] = [
    { name: "albumId", kind: "hidden", value: album.id },
    {
      name: "url",
      kind: "text",
      label: "Image address",
      required: true,
      wide: true,
      placeholder: "https://… or /images/…",
      hint: "Paste the web address of the photograph.",
    },
    { name: "caption", kind: "text", label: "Caption", wide: true },
    { name: "orderIndex", kind: "number", label: "Display order" },
  ];

  return (
    <>
      <AdminPageHeader
        title={album.title}
        description={`${album.images.length} photographs · ${album.branch?.shortName ?? "Main site"}`}
        action={
          <Link
            href="/admin/gallery"
            className="text-[0.8rem] font-semibold text-ink-600 underline underline-offset-4"
          >
            ← Back to albums
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Photographs">
          {album.images.length === 0 ? (
            <EmptyState
              title="This album is empty"
              description="Add the first photograph using the form beside this panel."
            />
          ) : (
            <ul className="grid gap-4 p-5 sm:grid-cols-2">
              {album.images.map((image) => (
                <li key={image.id} className="border border-ink-200">
                  <span
                    className="block h-36 bg-cover bg-center"
                    style={{ backgroundImage: `url('${image.url}')` }}
                  />
                  <div className="flex items-start justify-between gap-3 px-3 py-2">
                    <span className="min-w-0 text-[0.78rem] text-ink-600">
                      {image.caption || <span className="text-ink-400">No caption</span>}
                    </span>
                    <form action={deleteAlbumImage}>
                      <input type="hidden" name="id" value={image.id} />
                      <button className="shrink-0 text-[0.74rem] font-semibold text-red-700 underline underline-offset-4">
                        Remove
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Add a photograph">
          <ResourceForm
            action={addAlbumImage}
            fields={fields}
            submitLabel="Add photograph"
            resetAfterSuccess
          />
          <p className="border-t border-ink-200 px-5 py-3 text-[0.76rem] text-ink-500">
            Photographs are referenced by address. See the handover notes for how to
            host image files once the college chooses where to keep them.
          </p>
        </Panel>
      </div>
    </>
  );
}
