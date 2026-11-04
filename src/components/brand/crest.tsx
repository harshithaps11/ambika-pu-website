import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Institutional logo / emblem of Ambika PU College.
 * Uses the official artwork from /images/logo.png.
 */
export function Crest({
  className,
  priority = false,
  alt = "Ambika PU College Emblem",
}: {
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <Image
      src="/images/logo.png"
      alt={alt}
      width={160}
      height={160}
      priority={priority}
      className={cn("h-14 w-auto object-contain shrink-0", className)}
    />
  );
}
