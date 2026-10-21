import Link from "next/link";
import { site } from "@/config/site";
import { formatPhone, telHref } from "@/lib/utils";

type QuickLink = { label: string; href: string };

const defaultLinks: QuickLink[] = [
  { label: "Notices", href: "/news?category=NOTICE" },
  { label: "Results", href: "/news?category=RESULT" },
  { label: "Gallery", href: "/gallery" },
  { label: "Staff Login", href: "/admin/login" },
];

export function TopUtilityBar({
  phone,
  email,
  links = defaultLinks,
}: {
  phone?: string | null;
  email?: string | null;
  links?: QuickLink[];
}) {
  const displayPhone = phone || site.contact.phone;
  const displayEmail = email || site.contact.email;

  return (
    <div className="hidden border-b border-white/10 bg-ink-900 text-white md:block">
      <div className="container-site flex h-9 items-center justify-between gap-6 text-[0.72rem]">
        <div className="flex items-center gap-5">
          <a
            href={telHref(displayPhone)}
            className="flex items-center gap-1.5 text-white/80 transition-colors hover:text-gold-300"
          >
            <PhoneIcon />
            {formatPhone(displayPhone) || displayPhone}
          </a>
          <a
            href={`mailto:${displayEmail}`}
            className="flex items-center gap-1.5 text-white/80 transition-colors hover:text-gold-300"
          >
            <MailIcon />
            {displayEmail}
          </a>
        </div>

        <nav aria-label="Quick links">
          <ul className="flex items-center gap-5">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-white/75 transition-colors hover:text-gold-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M2 3.5A1.5 1.5 0 013.5 2h1.6a1.5 1.5 0 011.46 1.14l.6 2.4a1.5 1.5 0 01-.4 1.45l-1 1a11.5 11.5 0 004.25 4.25l1-1a1.5 1.5 0 011.45-.4l2.4.6A1.5 1.5 0 0118 12.9v1.6a1.5 1.5 0 01-1.5 1.5A14.5 14.5 0 012 3.5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M2.5 5A1.5 1.5 0 014 3.5h12A1.5 1.5 0 0117.5 5v.4l-7.5 4.3L2.5 5.4V5z" />
      <path d="M17.5 7.3V15a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 15V7.3l7.1 4.1a.8.8 0 00.8 0l7.1-4.1z" />
    </svg>
  );
}
