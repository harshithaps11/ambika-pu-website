"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type NewsSlideItem = {
  id: string;
  title: string;
  summary: string;
  category: "EVENT" | "NOTICE" | "RESULT" | "ACHIEVEMENT" | "CIRCULAR" | "NEWS";
  publishedAt: string | Date;
  imageUrl?: string | null;
  href: string;
  branchName?: string | null;
};

const categoryTone = {
  NOTICE: "brand",
  NEWS: "neutral",
  EVENT: "blue",
  CIRCULAR: "gold",
  RESULT: "green",
  ACHIEVEMENT: "gold",
} as const;

export const DEFAULT_NEWS_SLIDES: NewsSlideItem[] = [
  {
    id: "news_slide_1",
    title: "Annual Science & Innovation Exhibition 2026",
    summary:
      "Students from Science and Commerce streams showcased over 60 working models in robotics, environmental biotechnology, and digital commerce.",
    category: "EVENT",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    imageUrl:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1000&q=80",
    href: "/news",
    branchName: "Nellikatte Campus",
  },
  {
    id: "news_slide_2",
    title: "98.2% Pass Rate in Karnataka PUC Board Examinations",
    summary:
      "Historic results achieved by Ambika PU College students with 41 distinction ranks across Dakshina Kannada district.",
    category: "ACHIEVEMENT",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
    href: "/news?category=RESULT",
    branchName: "Both Campuses",
  },
  {
    id: "news_slide_3",
    title: "Inter-Campus Sports Meet & Athletic Championship",
    summary:
      "A two-day sporting extravaganza featuring track events, badminton tournaments, and trophy presentations for winning athletic batches.",
    category: "EVENT",
    publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    imageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
    href: "/news",
    branchName: "Bappalige Campus",
  },
  {
    id: "news_slide_4",
    title: "Admissions Open for First Year PUC Combinations",
    summary:
      "Online applications are now invited for PCMB, PCMC, EBAC, and SEBA combinations with modern laboratories and integrated coaching.",
    category: "NOTICE",
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    imageUrl:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80",
    href: "/#admissions",
    branchName: "Admissions 2026–27",
  },
];

const FALLBACK_NEWS_IMAGES = [
  "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1000&q=80", // Science lab & robotics
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80", // Academic achievers
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=80", // College campus
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80", // Library & books
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80", // Sports championship
];

const INTERVAL_MS = 5000;

export type SlideInput = {
  id: string;
  title: string;
  summary?: string | null;
  category?: any;
  date?: string;
  publishedAt?: string | Date;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  href?: string;
  slug?: string;
  linkUrl?: string | null;
  tag?: string | null;
  branchName?: string | null;
  branch?: { shortName?: string } | null;
};

export function NewsSlider({
  slides: explicitSlides,
  items,
  basePath = "",
  viewAllHref = "/news",
  title = "Latest News & Events",
}: {
  slides?: SlideInput[];
  items?: SlideInput[];
  basePath?: string;
  viewAllHref?: string;
  title?: string;
}) {
  const rawList = explicitSlides || items;
  // Merge items or use high-quality default slides if list is empty
  const slides: NewsSlideItem[] =
    rawList && rawList.length > 0
      ? rawList.map((item, idx) => ({
          id: item.id,
          title: item.title,
          summary:
            item.summary ||
            "Read full announcement, details, and schedules on our campus news portal.",
          category: (item.category as any) || "NEWS",
          publishedAt: item.publishedAt || item.date || new Date(),
          imageUrl:
            item.imageUrl ||
            item.coverImageUrl ||
            DEFAULT_NEWS_SLIDES[idx % DEFAULT_NEWS_SLIDES.length].imageUrl ||
            FALLBACK_NEWS_IMAGES[idx % FALLBACK_NEWS_IMAGES.length],
          href: item.href || item.linkUrl || `${basePath}/news/${item.slug ?? item.id}`,
          branchName: item.branchName || item.tag || item.branch?.shortName || null,
        }))
      : DEFAULT_NEWS_SLIDES;

  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2 || isHovered) return;

    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setIndex((current) => (current + 1) % count);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [count, index, isHovered]);

  if (!count) return null;
  const currentSlide = slides[index];

  const dateObj = new Date(currentSlide.publishedAt);
  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <section
      aria-label="News Highlights"
      className="group/slider relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200/90 bg-white shadow-card transition-all duration-300 hover:shadow-raise"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header bar */}
      <header
        className="flex items-center justify-between border-b-2 border-gold-500/40 px-5 py-3.5"
        style={{ backgroundColor: "var(--branch-color)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold-300" />
          </span>
          <h2 className="font-serif text-[1.02rem] font-semibold tracking-wide text-white">
            {title}
          </h2>
        </div>

        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="group/btn inline-flex items-center gap-1 text-[0.72rem] font-bold uppercase tracking-wider text-gold-300 transition-colors hover:text-white"
          >
            All News
            <span className="transition-transform duration-200 group-hover/btn:translate-x-0.5">
              →
            </span>
          </Link>
        ) : null}
      </header>

      {/* Main Slide Card Area */}
      <div className="relative flex flex-1 flex-col justify-between">
        <Link
          href={currentSlide.href}
          className="group/card block flex-1 overflow-hidden"
        >
          {/* Slide Photo with Smooth Zoom on Hover */}
          <div className="relative h-48 w-full overflow-hidden bg-ink-950 sm:h-52">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover/card:scale-110"
              style={{
                backgroundImage: `url('${
                  currentSlide.imageUrl ||
                  FALLBACK_NEWS_IMAGES[index % FALLBACK_NEWS_IMAGES.length]
                }')`,
              }}
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-900/35 to-transparent transition-opacity duration-300 group-hover/card:from-ink-950/95" />

            {/* Badges on Photo */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
              <Badge tone={categoryTone[currentSlide.category] ?? "neutral"}>
                {currentSlide.category}
              </Badge>

              <span className="rounded-full bg-black/60 px-2.5 py-1 text-[0.68rem] font-sans font-medium tabular-nums text-white/90 backdrop-blur-xs">
                {formattedDate}
              </span>
            </div>

            {/* Campus Tag (if available) */}
            {currentSlide.branchName ? (
              <div className="absolute bottom-3 left-3">
                <span className="rounded-md bg-gold-500/95 px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-ink-950 shadow-xs">
                  {currentSlide.branchName}
                </span>
              </div>
            ) : null}
          </div>

          {/* Slide Content Box */}
          <div className="p-5">
            <h3 className="font-serif text-[1.15rem] font-semibold leading-snug text-ink-900 transition-colors duration-200 group-hover/card:text-brand-700">
              {currentSlide.title}
            </h3>

            <p className="mt-2 text-[0.86rem] leading-relaxed text-ink-600 line-clamp-3">
              {currentSlide.summary}
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 text-[0.78rem] font-bold uppercase tracking-wider text-brand-700 underline underline-offset-4 transition-colors group-hover/card:text-brand-900">
              Read Story
              <span className="transition-transform duration-200 group-hover/card:translate-x-1">
                →
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Arrows & Pagination Dots */}
        {count > 1 ? (
          <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/70 px-4 py-2.5">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(slideIndex)}
                  aria-label={`Go to slide ${slideIndex + 1}`}
                  aria-current={slideIndex === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    slideIndex === index
                      ? "w-6 bg-brand-700"
                      : "w-1.5 bg-ink-300 hover:bg-ink-500",
                  )}
                />
              ))}
            </div>

            {/* Arrow Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous slide"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-700 shadow-xs transition-all hover:border-brand-700 hover:bg-brand-50 hover:text-brand-700 active:translate-y-0.5 cursor-pointer"
              >
                <Arrow direction="left" />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next slide"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-700 shadow-xs transition-all hover:border-brand-700 hover:bg-brand-50 hover:text-brand-700 active:translate-y-0.5 cursor-pointer"
              >
                <Arrow direction="right" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      {direction === "left" ? (
        <path d="M12.7 4.3a1 1 0 010 1.4L8.4 10l4.3 4.3a1 1 0 01-1.4 1.4l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 0z" />
      ) : (
        <path d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4L11.6 10 7.3 5.7a1 1 0 010-1.4z" />
      )}
    </svg>
  );
}
