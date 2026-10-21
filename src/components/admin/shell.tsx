"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type AdminNavItem = {
  label: string;
  href: string;
  badge?: number;
};

export type AdminNavSection = {
  heading: string;
  items: AdminNavItem[];
};

export function AdminSidebar({
  sections,
  userName,
  userRole,
}: {
  sections: AdminNavSection[];
  userName: string;
  userRole: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex h-12 w-full items-center gap-2 border-b border-ink-800 bg-ink-900 px-4 text-sm font-semibold text-white lg:hidden"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
          <path d="M3 5.5h14v1.6H3V5.5zm0 3.7h14v1.6H3V9.2zm0 3.7h14v1.6H3v-1.6z" />
        </svg>
        Menu
      </button>

      <aside
        className={cn(
          "w-full shrink-0 bg-ink-900 lg:block lg:w-60",
          open ? "block" : "hidden",
        )}
      >
        <div className="hidden border-b border-white/10 px-5 py-4 lg:block">
          <p className="font-serif text-[1.05rem] font-semibold leading-tight text-white">
            Ambika PU
          </p>
          <p className="mt-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gold-400">
            Administration
          </p>
        </div>

        <nav aria-label="Admin sections" className="px-3 py-4">
          {sections.map((section) => (
            <div key={section.heading} className="mb-5 last:mb-0">
              <p className="px-2 pb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/35">
                {section.heading}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-sm px-2.5 py-1.5 text-[0.82rem] transition-colors",
                        isActive(item.href)
                          ? "bg-brand-700 font-semibold text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <span>{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-gold-500 px-1.5 text-[0.65rem] font-bold text-ink-900">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-[0.82rem] font-semibold text-white">{userName}</p>
          <p className="text-[0.68rem] uppercase tracking-wider text-white/45">
            {userRole}
          </p>
        </div>
      </aside>
    </>
  );
}
