"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type Slide = {
  id: string;
  imageUrl: string;
  headline?: string | null;
  subtext?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

const INTERVAL_MS = 6500;

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef<HTMLElement | null>(null);

  const count = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count < 2) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      INTERVAL_MS,
    );

    return () => window.clearInterval(timer);
  }, [paused, count]);

  if (!count) return null;

  return (
    <section
      ref={regionRef}
      aria-roledescription="carousel"
      aria-label="Campus highlights"
      className="relative isolate overflow-hidden bg-ink-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(index + 1);
        if (event.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="relative h-[380px] sm:h-[480px] lg:h-[560px] xl:h-[620px]">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} of ${count}`}
            aria-hidden={slideIndex !== index}
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out",
              slideIndex === index ? "opacity-100" : "opacity-0",
            )}
            style={{ backgroundImage: `url('${slide.imageUrl}')` }}
          >
            {/* Scrim to keep typography crisp and readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-900/55 to-ink-900/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />
          </div>
        ))}

        <div className="container-wide relative flex h-full flex-col justify-center">
          <div className="max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            {slides[index].headline ? (
              <h1 className="font-serif text-[1.85rem] font-semibold leading-tight text-white drop-shadow-sm sm:text-[2.6rem] lg:text-[3.2rem] xl:text-[3.6rem]">
                {slides[index].headline}
              </h1>
            ) : null}

            {slides[index].subtext ? (
              <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-white/90 sm:mt-4 sm:text-lg">
                {slides[index].subtext}
              </p>
            ) : null}

            {slides[index].ctaUrl && slides[index].ctaLabel ? (
              <Link
                href={slides[index].ctaUrl}
                className="mt-5 inline-flex h-11 items-center rounded-sm bg-gold-500 px-7 text-[0.85rem] font-bold uppercase tracking-wider text-ink-900 transition-colors hover:bg-gold-400 sm:mt-7"
              >
                {slides[index].ctaLabel}
              </Link>
            ) : null}
          </div>
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm bg-black/35 text-white transition-colors hover:bg-black/60 sm:flex"
            >
              <Arrow direction="left" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm bg-black/35 text-white transition-colors hover:bg-black/60 sm:flex"
            >
              <Arrow direction="right" />
            </button>

            <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(slideIndex)}
                  aria-label={`Go to slide ${slideIndex + 1}`}
                  aria-current={slideIndex === index}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    slideIndex === index
                      ? "w-7 bg-gold-400"
                      : "w-2 bg-white/55 hover:bg-white/80",
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
      {direction === "left" ? (
        <path d="M12.7 4.3a1 1 0 010 1.4L8.4 10l4.3 4.3a1 1 0 01-1.4 1.4l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 0z" />
      ) : (
        <path d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4L11.6 10 7.3 5.7a1 1 0 010-1.4z" />
      )}
    </svg>
  );
}
