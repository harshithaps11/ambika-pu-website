import Link from "next/link";
import { AdminPageHeader, DataTable, EmptyState, Panel } from "@/components/admin/ui";
import { ResourceForm, type FieldSpec } from "@/components/admin/resource-form";
import { Badge } from "@/components/ui/badge";
import { Capability } from "@/generated/prisma/enums";
import { deleteAlbum, saveAlbum } from "@/lib/actions/content";
import { allowedBranchIds, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Gallery" };

export default async function GalleryAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await requireCapability(Capability.GALLERY_MANAGE);
  const { edit } = await searchParams;
  const allowed = allowedBranchIds(user);

  const [branches, albums, editing] = await Promise.all([
    prisma.branch.findMany({
      where: allowed === null ? {} : { id: { in: allowed } },
      orderBy: { orderIndex: "asc" },
      select: { id: true, shortName: true },
    }),
    prisma.galleryAlbum.findMany({
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
      include: {
        branch: { select: { shortName: true } },
        _count: { select: { images: true } },
      },
    }),
    edit ? prisma.galleryAlbum.findUnique({ where: { id: edit } }) : Promise.resolve(null),
  ]);

  const branchOptions = [
    ...(allowed === null ? [{ value: "", label: "Main site (institution-wide)" }] : []),
    ...branches.map((b) => ({ value: b.id, label: b.shortName })),
  ];

  const fields: FieldSpec[] = [
    { name: "id", kind: "hidden", value: editing?.id ?? "" },
    { name: "branchId", kind: "select", label: "Belongs to", options: branchOptions },
    { name: "eventDate", kind: "date", label: "Event date" },
    { name: "title", kind: "text", label: "Album title", required: true, wide: true },
    { name: "description", kind: "textarea", label: "Description", rows: 3, wide: true },
    { name: "coverImageUrl", kind: "text", label: "Cover image address", wide: true },
    { name: "orderIndex", kind: "number", label: "Display order" },
    { name: "isPublished", kind: "checkbox", label: "Visible on the website", defaultChecked: true },
  ];

  return (
    <>
      <AdminPageHeader
        title="Photo gallery"
        description="Albums shown on the gallery pages. Create an album, then add photographs to it."
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <Panel title={`Albums (${albums.length})`}>
          {albums.length === 0 ? (
            <EmptyState title="No albums yet" />
          ) : (
            <DataTable headers={["Album", "Belongs to", "Photos", { label: "Actions", align: "right" }]}>
              {albums.map((album) => (
                <tr key={album.id} className="hover:bg-ink-50">
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-ink-800">{album.title}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      {album.eventDate ? (
                        <span className="text-[0.74rem] text-ink-500">
                          {formatDate(album.eventDate)}
                        </span>
                      ) : null}
                      {!album.isPublished ? <Badge tone="neutral">Hidden</Badge> : null}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">
                    {album.branch?.shortName ?? "Main site"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">{album._count.images}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/gallery/${album.id}`}
                        className="text-[0.76rem] font-semibold text-brand-700 underline underline-offset-4"
                      >
                        Photos
                      </Link>
                      <Link
                        href={`/admin/gallery?edit=${album.id}`}
                        className="text-[0.76rem] font-semibold text-brand-700 underline underline-offset-4"
                      >
                        Edit
                      </Link>
                      <form action={deleteAlbum}>
                        <input type="hidden" name="id" value={album.id} />
                        <button className="text-[0.76rem] font-semibold text-red-700 underline underline-offset-4">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>

        <Panel
          title={editing ? `Edit ${editing.title}` : "Create an album"}
          action={
            editing ? (
              <Link href="/admin/gallery" className="text-[0.76rem] font-semibold text-ink-600 underline underline-offset-4">
                New album
              </Link>
            ) : null
          }
        >
          <ResourceForm
            key={editing?.id ?? "new"}
            action={saveAlbum}
            fields={fields}
            initial={editing ? { ...editing, branchId: editing.branchId ?? "" } : { isPublished: true }}
            submitLabel={editing ? "Save changes" : "Create album"}
            resetAfterSuccess={!editing}
          />
        </Panel>
      </div>
    </>
  );
}
