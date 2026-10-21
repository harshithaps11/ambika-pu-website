import Link from "next/link";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { ResourceForm, type FieldSpec } from "@/components/admin/resource-form";
import { Capability } from "@/generated/prisma/enums";
import { saveBranchSettings } from "@/lib/actions/content";
import { allowedBranchIds, requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata = { title: "Campus settings" };

export default async function BranchesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>;
}) {
  const user = await requireCapability(Capability.SETTINGS_MANAGE);
  const { branch: branchSlug } = await searchParams;
  const allowed = allowedBranchIds(user);

  const branches = await prisma.branch.findMany({
    where: allowed === null ? {} : { id: { in: allowed } },
    orderBy: { orderIndex: "asc" },
  });

  const selected =
    branches.find((branch) => branch.slug === branchSlug) ?? branches[0];

  if (!selected) {
    return (
      <>
        <AdminPageHeader title="Campus settings" />
        <Panel>
          <p className="px-5 py-8 text-center text-sm text-ink-500">
            No campuses are available to your account.
          </p>
        </Panel>
      </>
    );
  }

  const fields: FieldSpec[] = [
    { name: "id", kind: "hidden", value: selected.id },
    { name: "shortName", kind: "text", label: "Short name", required: true },
    { name: "tagline", kind: "text", label: "Tagline", placeholder: "Science & Commerce" },
    { name: "about", kind: "textarea", label: "About this campus", rows: 6, wide: true },

    { name: "addressLine1", kind: "text", label: "Address line 1", wide: true },
    { name: "addressLine2", kind: "text", label: "Address line 2", wide: true },
    { name: "city", kind: "text", label: "Town / city" },
    { name: "district", kind: "text", label: "District" },
    { name: "state", kind: "text", label: "State" },
    { name: "pincode", kind: "text", label: "PIN code" },

    { name: "phone", kind: "text", label: "Telephone" },
    { name: "altPhone", kind: "text", label: "Alternate telephone" },
    { name: "email", kind: "email", label: "Email" },
    { name: "whatsappNo", kind: "text", label: "WhatsApp number", hint: "With country code, e.g. 919900000001" },
    { name: "mapEmbedUrl", kind: "text", label: "Google Maps embed address", wide: true, hint: "From Google Maps → Share → Embed a map → copy the src value." },

    { name: "principalName", kind: "text", label: "Principal's name" },
    { name: "principalPhotoUrl", kind: "text", label: "Principal's photo address" },
    { name: "principalMessage", kind: "textarea", label: "Principal's message", rows: 7, wide: true },

    { name: "admissionNote", kind: "textarea", label: "Admission note", rows: 3, wide: true, hint: "Shown at the top of the admission form." },
    { name: "themeColor", kind: "color", label: "Campus colour", required: true },
    { name: "admissionOpen", kind: "checkbox", label: "Admissions are open", description: "When off, the form still works but is presented as an enquiry." },
  ];

  return (
    <>
      <AdminPageHeader
        title="Campus settings"
        description="Addresses, contact numbers, the principal's message and the admission status shown on each campus site."
      />

      {branches.length > 1 ? (
        <nav className="mb-5 flex flex-wrap gap-2">
          {branches.map((branch) => (
            <Link
              key={branch.id}
              href={`/admin/branches?branch=${branch.slug}`}
              className={cn(
                "border px-4 py-2 text-[0.8rem] font-semibold transition-colors",
                branch.id === selected.id
                  ? "border-transparent bg-brand-700 text-white"
                  : "border-ink-300 bg-white text-ink-700 hover:border-brand-700 hover:text-brand-700",
              )}
            >
              {branch.shortName}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="max-w-3xl">
        <Panel title={selected.name}>
          <ResourceForm
            key={selected.id}
            action={saveBranchSettings}
            fields={fields}
            initial={selected}
            submitLabel="Save campus settings"
          />
        </Panel>
      </div>
    </>
  );
}
