import Link from "next/link";

type Tile = { label: string; href: string; icon: keyof typeof icons };

const icons = {
  admission: (
    <path d="M10 2l7 3.5v4.2c0 4.3-2.9 8.2-7 9.3-4.1-1.1-7-5-7-9.3V5.5L10 2zm-.9 11.8l4.6-4.6-1.3-1.3-3.3 3.3-1.5-1.5L6.3 11l2.8 2.8z" />
  ),
  course: (
    <path d="M3 4.6A1.6 1.6 0 014.6 3h4.1c.7 0 1.3.5 1.3 1.2v12c0-.7-.6-1.2-1.3-1.2H4.6A1.6 1.6 0 013 13.4V4.6zm14 0v8.8a1.6 1.6 0 01-1.6 1.6h-4.1c-.7 0-1.3.5-1.3 1.2v-12c0-.7.6-1.2 1.3-1.2h4.1A1.6 1.6 0 0117 4.6z" />
  ),
  result: (
    <path d="M5 2h10a1 1 0 011 1v14a1 1 0 01-1.5.9L10 15.4l-4.5 2.5A1 1 0 014 17V3a1 1 0 011-1zm2.3 6.4l2 2 3.4-3.4-1.2-1.2-2.2 2.2-.8-.8-1.2 1.2z" />
  ),
  gallery: (
    <path d="M3 4.5A1.5 1.5 0 014.5 3h11A1.5 1.5 0 0117 4.5v11a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 15.5v-11zm2.2 9.8h9.6l-3-4-2.3 3-1.6-2-2.7 3zM7 8.2a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6z" />
  ),
  download: (
    <path d="M9.1 2.5h1.8v7.3l2.5-2.5 1.3 1.3-4.7 4.7-4.7-4.7 1.3-1.3 2.5 2.5V2.5zM3.5 15h13v2.5h-13V15z" />
  ),
  contact: (
    <path d="M2 3.5A1.5 1.5 0 013.5 2h1.6a1.5 1.5 0 011.46 1.14l.6 2.4a1.5 1.5 0 01-.4 1.45l-1 1a11.5 11.5 0 004.25 4.25l1-1a1.5 1.5 0 011.45-.4l2.4.6A1.5 1.5 0 0118 12.9v1.6a1.5 1.5 0 01-1.5 1.5A14.5 14.5 0 012 3.5z" />
  ),
};

export function QuickLinks({ tiles }: { tiles: Tile[] }) {
  return (
    <nav aria-label="Quick links" className="border-b border-ink-200 bg-ink-50">
      <ul className="container-wide grid grid-cols-2 gap-px bg-ink-200 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((tile) => (
          <li key={`${tile.label}-${tile.href}`}>
            <Link
              href={tile.href}
              className="flex h-full flex-col items-center gap-2.5 bg-ink-50 px-4 py-6 text-center transition-colors hover:bg-white"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: "var(--branch-color)" }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
                  {icons[tile.icon]}
                </svg>
              </span>
              <span className="text-[0.78rem] font-semibold uppercase tracking-wider text-ink-700">
                {tile.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
