import Link from "next/link";
import { Crest } from "@/components/brand/crest";
import { site, fullAddress } from "@/config/site";
import { branchHref } from "@/lib/branch-routing";
import { formatPhone, telHref } from "@/lib/utils";

type FooterBranch = { slug: string; shortName: string };

export function SiteFooter({
  branches,
  quickLinks,
  contact,
  addressLines,
}: {
  branches: FooterBranch[];
  quickLinks: { label: string; href: string }[];
  contact?: { phone?: string | null; email?: string | null };
  addressLines?: string;
}) {
  const phone = contact?.phone || site.contact.phone;
  const email = contact?.email || site.contact.email;
  const address = addressLines || fullAddress();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink-900 text-white/70">
      <div className="container-site grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="lg:pr-6">
          <div className="flex items-center gap-3">
            <Crest className="h-12 text-white/90" />
            <span className="font-serif text-[1.05rem] font-semibold leading-tight text-white">
              {site.name}
            </span>
          </div>

          <p className="mt-4 text-[0.82rem] leading-relaxed">
            {site.affiliation}. Managed by {site.trust}.
          </p>
        </div>

        <nav aria-labelledby="footer-links">
          <h2
            id="footer-links"
            className="mb-4 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white"
          >
            Quick Links
          </h2>
          <ul className="space-y-2.5 text-[0.84rem]">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-gold-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-campuses">
          <h2
            id="footer-campuses"
            className="mb-4 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white"
          >
            Our Campuses
          </h2>
          <ul className="space-y-2.5 text-[0.84rem]">
            {branches.map((branch) => (
              <li key={branch.slug}>
                <Link
                  href={branchHref(branch.slug)}
                  className="transition-colors hover:text-gold-300"
                >
                  {branch.shortName}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/" className="transition-colors hover:text-gold-300">
                Main Website
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white">
            Reach Us
          </h2>
          <address className="space-y-2.5 text-[0.84rem] not-italic leading-relaxed">
            <p>{address}</p>
            <p>
              <a href={telHref(phone)} className="transition-colors hover:text-gold-300">
                {formatPhone(phone) || phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${email}`} className="transition-colors hover:text-gold-300">
                {email}
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-4 text-[0.75rem] sm:flex-row">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-3">
            <Link href="/admin/login" className="transition-colors hover:text-gold-300">
              Staff Login
            </Link>
            {site.developerCredit.name ? (
              <span className="text-white/45">
                Designed &amp; developed by {site.developerCredit.name}
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </footer>
  );
}
