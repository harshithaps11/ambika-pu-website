import { cn } from "@/lib/utils";

/**
 * Institutional crest: a shield carrying a lit deepa (oil lamp) above an open
 * book — the two emblems almost every Karnataka college uses.
 *
 * Drawn as inline SVG so it stays sharp at any size and needs no asset
 * pipeline. Swap this file for the college's official emblem when they
 * supply the artwork; nothing else references the shapes.
 */
export function Crest({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 74"
      role="img"
      aria-label="College crest"
      className={cn("h-14 w-auto shrink-0", className)}
    >
      <path
        d="M32 1.5 61 10.2v27.1c0 16.4-12 27.3-29 35.2C15 64.6 3 53.7 3 37.3V10.2Z"
        fill="currentColor"
      />
      <path
        d="M32 5.9 56.7 13.3v24c0 14-10.2 23.6-24.7 30.6C17.5 60.9 7.3 51.3 7.3 37.3v-24Z"
        fill="none"
        stroke="#c9a227"
        strokeWidth="1.3"
      />

      {/* Flame */}
      <path
        d="M32 15.4c2.9 3.3 4.4 6 4.4 8.3 0 2.6-2 4.4-4.4 4.4s-4.4-1.8-4.4-4.4c0-2.3 1.5-5 4.4-8.3Z"
        fill="#e6cb6f"
      />
      <path
        d="M32 20.1c1.4 1.8 2.1 3.2 2.1 4.3 0 1.3-1 2.2-2.1 2.2s-2.1-.9-2.1-2.2c0-1.1.7-2.5 2.1-4.3Z"
        fill="#fdf4f5"
      />

      {/* Lamp bowl */}
      <path
        d="M21.6 31.4h20.8c0 4.6-4.6 7.6-10.4 7.6s-10.4-3-10.4-7.6Z"
        fill="#c9a227"
      />
      <rect x="29.8" y="39" width="4.4" height="3.4" fill="#c9a227" />
      <rect x="26.2" y="42.4" width="11.6" height="2.1" rx="1" fill="#c9a227" />

      {/* Open book */}
      <path
        d="M11.8 51.2c6.6-2.4 13.4-2.4 20.2 0v12.1c-6.8-2.4-13.6-2.4-20.2 0Z"
        fill="#ffffff"
        opacity="0.95"
      />
      <path
        d="M52.2 51.2c-6.6-2.4-13.4-2.4-20.2 0v12.1c6.8-2.4 13.6-2.4 20.2 0Z"
        fill="#ffffff"
        opacity="0.8"
      />
      <path
        d="M32 51.2v12.1"
        stroke="#c9a227"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
