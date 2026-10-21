import { site, fullAddress, siteUrl } from "@/config/site";

type BranchForSchema = {
  slug: string;
  name: string;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
  addressLine1?: string | null;
  phone?: string | null;
  email?: string | null;
};

/**
 * schema.org markup so search engines show the college with its address and
 * phone number rather than guessing from page text.
 */
export function OrganizationSchema({ branches }: { branches: BranchForSchema[] }) {
  const base = siteUrl();

  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: site.englishName,
    alternateName: site.name,
    url: base,
    description: `${site.englishName}, ${site.address.city}. ${site.affiliation}.`,
    foundingDate: String(site.establishedYear),
    parentOrganization: { "@type": "Organization", name: site.trust },
    address: {
      "@type": "PostalAddress",
      streetAddress: [site.address.line1, site.address.line2].filter(Boolean).join(", "),
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.pincode,
      addressCountry: "IN",
    },
    telephone: site.contact.phone,
    email: site.contact.email,
    department: branches.map((branch) => ({
      "@type": "EducationalOrganization",
      name: branch.name,
      url: `${base}/${branch.slug}`,
      telephone: branch.phone ?? undefined,
      email: branch.email ?? undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: branch.addressLine1 ?? undefined,
        addressLocality: branch.city ?? undefined,
        addressRegion: branch.state ?? undefined,
        postalCode: branch.pincode ?? undefined,
        addressCountry: "IN",
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // The payload is built from our own data, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export { fullAddress };
