import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HERO_SLIDES } from "@/lib/catalog";

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            width={1920}
            height={1080}
            loading={i === 0 ? "eager" : "lazy"}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-background/95 via-background/70 to-background/30" />
        </div>
      ))}

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4">
        <div className="max-w-xl">
          <span className="inline-block rounded-full border border-primary/50 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-platinum">
            {HERO_SLIDES[index].eyebrow}
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight text-platinum sm:text-6xl">
            {HERO_SLIDES[index].title}
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">{HERO_SLIDES[index].subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/catalog"
              search={{ category: HERO_SLIDES[index].categoryId }}
              className="rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
            >
              {HERO_SLIDES[index].cta}
            </Link>
            <Link
              to="/catalog"
              className="rounded-xl border border-border bg-surface/70 px-6 py-3.5 text-sm font-bold text-platinum transition-colors hover:bg-secondary"
            >
              לכל הקטלוג
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 flex gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setIndex(i)}
              aria-label={`מעבר לשקופית ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-10 bg-primary" : "w-4 bg-muted"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
