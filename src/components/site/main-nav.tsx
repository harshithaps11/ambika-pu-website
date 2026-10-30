"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export function MainNav({
  items,
  ctaHref,
  ctaLabel = "Apply Online",
}: {
  items: NavItem[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [lastPathname, setLastPathname] = useState(pathname);
  const menuId = useId();

  // Any navigation closes whatever was open. Adjusting state during render is
  // React's documented way to react to a changed value without an effect, and
  // avoids the extra paint an effect would cause.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
    setOpenMenu(null);
  }

  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-40 shadow-sm"
      style={{ backgroundColor: "var(--branch-color)" }}
    >
      <div className="container-wide flex items-stretch justify-between">
        <ul className="hidden items-stretch lg:flex">
          {items.map((item) => {
            const active = isActive(item.href);
            const hasChildren = Boolean(item.children?.length);
            const itemKey = `${item.label}-${item.href}`;

            return (
              <li
                key={itemKey}
                className="relative"
                onMouseEnter={() => hasChildren && setOpenMenu(itemKey)}
                onMouseLeave={() => hasChildren && setOpenMenu(null)}
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  aria-expanded={hasChildren ? openMenu === itemKey : undefined}
                  className={cn(
                    "flex h-12 lg:h-13 items-center gap-2 px-4 lg:px-5 xl:px-6 text-[0.8rem] lg:text-[0.85rem] font-semibold uppercase tracking-[0.06em] text-white/95 transition-colors hover:bg-black/20 hover:text-white",
                    active && "bg-black/25 text-white",
                  )}
                >
                  {item.label}
                  {hasChildren ? <Chevron /> : null}
                </Link>

                {hasChildren ? (
                  <ul
                    id={`${menuId}-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className={cn(
                      "absolute left-0 top-full z-50 w-64 border-t-2 border-gold-500 bg-white py-1.5 shadow-raise",
                      openMenu === itemKey ? "block" : "hidden",
                    )}
                  >
                    {item.children?.map((child) => (
                      <li key={`${child.label}-${child.href}`}>
                        <Link
                          href={child.href}
                          className="block px-4 py-2.5 text-[0.84rem] text-ink-700 transition-colors hover:bg-ink-50 hover:text-brand-700"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls={menuId}
          className="flex h-12 items-center gap-2 px-1 text-[0.8rem] font-semibold uppercase tracking-wider text-white lg:hidden"
        >
          <BurgerIcon open={mobileOpen} />
          Menu
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id={menuId}
        className={cn(
          "border-t border-white/15 lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <ul className="container-site py-2">
          {items.map((item) => (
            <li key={`${item.label}-${item.href}`} className="border-b border-white/10 last:border-0">
              <Link
                href={item.href}
                className="block py-2.5 text-sm font-semibold text-white"
              >
                {item.label}
              </Link>

              {item.children?.length ? (
                <ul className="pb-2 pl-3">
                  {item.children.map((child) => (
                    <li key={`${child.label}-${child.href}`}>
                      <Link
                        href={child.href}
                        className="block py-1.5 text-[0.82rem] text-white/75"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}

          {ctaHref ? (
            <li className="pt-3">
              <Link
                href={ctaHref}
                className="block rounded-sm bg-gold-500 py-2.5 text-center text-sm font-bold uppercase tracking-wider text-ink-900"
              >
                {ctaLabel}
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    </nav>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 opacity-70" aria-hidden>
      <path
        fillRule="evenodd"
        d="M5.2 7.3a1 1 0 011.4 0L10 10.7l3.4-3.4a1 1 0 111.4 1.4l-4.1 4.1a1 1 0 01-1.4 0L5.2 8.7a1 1 0 010-1.4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
      {open ? (
        <path d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 01-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 01-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z" />
      ) : (
        <path d="M3 5.5h14v1.6H3V5.5zm0 3.7h14v1.6H3V9.2zm0 3.7h14v1.6H3v-1.6z" />
      )}
    </svg>
  );
}
