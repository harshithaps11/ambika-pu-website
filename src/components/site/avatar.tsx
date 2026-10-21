import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Photo when one exists, otherwise a monogram. Avoids the broken-image look
 * on profiles the college has not photographed yet.
 */
export function Avatar({
  name,
  src,
  className,
  rounded = "full",
}: {
  name: string;
  src?: string | null;
  className?: string;
  rounded?: "full" | "sm";
}) {
  const shape = rounded === "full" ? "rounded-full" : "rounded-sm";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        loading="lazy"
        className={cn("object-cover", shape, className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center bg-brand-50 font-serif font-semibold text-brand-700 ring-1 ring-inset ring-brand-200",
        shape,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
