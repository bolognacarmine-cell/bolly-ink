"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Lightbox } from "@/components/ui/Lightbox";
import { Card3D } from "@/components/ui/Card3D";
import { cn } from "@/lib/utils";
import type { PortfolioImage } from "@/data/site";

type SortMode = "newest" | "oldest";

type Props = {
  images: PortfolioImage[];
};

export function PortfolioImages({ images }: Props) {
  const styles = useMemo<string[]>(() => {
    const set = new Set(images.map((i) => i.style));
    return ["all", ...Array.from(set)];
  }, [images]);

  const [style, setStyle] = useState<string>("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const items = useMemo(() => {
    const filtered =
      style === "all"
        ? images
        : images.filter((i) => i.style === style);

    const sorted = [...filtered].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sort === "newest" ? db - da : da - db;
    });

    return sorted;
  }, [images, style, sort]);

  return (
    <Section id="portfolio" className="bg-black">
      <Reveal>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase text-white/60">
              Portfolio immagini
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Lavori recenti. Solo immagini.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/60 leading-relaxed">
              Struttura pronta per categorie, stile e data. Per aggiungere o
              sostituire immagini modifica `data/site.ts` e metti i file in
              `public/portfolio/`.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="-mx-1 flex w-[calc(100%+0.5rem)] gap-2 overflow-x-auto px-1 pb-1 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2.5 text-xs uppercase tracking-[0.20em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                    style === s
                      ? "border-white/30 bg-white/10 text-white"
                      : "border-white/10 bg-black/20 text-white/60 hover:text-white hover:bg-white/5",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
              <button
                onClick={() => setSort("newest")}
                className={cn(
                  "rounded-full border px-4 py-2.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                  sort === "newest"
                    ? "border-white/25 bg-white/10 text-white"
                    : "border-white/10 bg-black/20 text-white/60 hover:text-white hover:bg-white/5",
                )}
              >
                Più recenti
              </button>
              <button
                onClick={() => setSort("oldest")}
                className={cn(
                  "rounded-full border px-4 py-2.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                  sort === "oldest"
                    ? "border-white/25 bg-white/10 text-white"
                    : "border-white/10 bg-black/20 text-white/60 hover:text-white hover:bg-white/5",
                )}
              >
                Più vecchi
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-12">
        <div className="columns-1 min-[430px]:columns-2 sm:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
          {items.map((img, idx) => (
            <div key={img.id} className="mb-4 break-inside-avoid">
              <Reveal>
                <Card3D depth="shallow" disabled={isMobile} className="w-full">
                  <button
                    onClick={() => setOpenIndex(idx)}
                    className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_22px_70px_-50px_rgba(255,255,255,.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    aria-label={`Apri immagine: ${img.style}`}
                  >
                    <div className="relative aspect-[4/5] w-full">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 22vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03] group-hover:brightness-[1.08]"
                        loading="lazy"
                        style={{ transform: 'translateZ(5px)' }}
                      />
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/65 via-black/0 to-black/0"
                        style={{ transform: 'translateZ(8px)' }}
                      />
                      <div 
                        className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition"
                        style={{ transform: 'translateZ(10px)' }}
                      >
                        <p className="text-xs uppercase tracking-[0.20em] text-white/80">
                          {img.style}
                        </p>
                        <p className="mt-1 text-xs text-white/65">{img.date}</p>
                      </div>
                    </div>
                  </button>
                </Card3D>
              </Reveal>
            </div>
          ))}
        </div>
      </div>

      {openIndex !== null ? (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onPrev={() =>
            setOpenIndex((v) =>
              v === null ? 0 : (v - 1 + items.length) % items.length,
            )
          }
          onNext={() =>
            setOpenIndex((v) => (v === null ? 0 : (v + 1) % items.length))
          }
        />
      ) : null}
    </Section>
  );
}
