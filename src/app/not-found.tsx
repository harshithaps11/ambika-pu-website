import Link from "next/link";
import { Crest } from "@/components/brand/crest";
import { site } from "@/config/site";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-16 text-center">
      <Crest className="h-16 text-brand-700" />

      <p className="mt-6 font-serif text-[2.5rem] font-semibold leading-none text-brand-700">
        404
      </p>
      <h1 className="mt-3 font-serif text-xl font-semibold text-ink-900">
        We could not find that page
      </h1>
      <p className="mt-3 max-w-md text-[0.92rem] leading-relaxed text-ink-600">
        The page may have been moved, or the address may have been typed
        incorrectly. The links below should get you where you were going.
      </p>

      <nav className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-sm bg-brand-700 px-5 text-[0.82rem] font-semibold text-white"
        >
          Go to the home page
        </Link>
        <Link
          href="/news"
          className="inline-flex h-11 items-center rounded-sm border border-ink-300 px-5 text-[0.82rem] font-semibold text-ink-800"
        >
          News &amp; notices
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-11 items-center rounded-sm border border-ink-300 px-5 text-[0.82rem] font-semibold text-ink-800"
        >
          Contact us
        </Link>
      </nav>

      <p className="mt-8 text-[0.78rem] text-ink-400">{site.name}</p>
    </div>
  );
}
