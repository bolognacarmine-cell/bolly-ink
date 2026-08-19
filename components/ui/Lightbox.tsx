"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { PortfolioImage } from "@/data/site";

type Props = {
  items: PortfolioImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function Lightbox({ items, index, onClose, onPrev, onNext }: Props) {
  const item = items[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onNext, onPrev]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galleria immagini"
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_40%_30%,rgba(139,92,246,.15),transparent_60%)]" />

      <div
        className="relative mx-auto flex h-full max-w-6xl items-center justify-center px-4 py-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-accent-primary/40 bg-accent-primary/15 px-4 py-2 text-base text-accent-primary font-bold hover:bg-accent-primary/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          aria-label="Chiudi lightbox"
        >
          Chiudi
        </button>

        <button
          onClick={onPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-accent-primary/40 bg-accent-primary/20 px-5 py-3 text-xl text-accent-primary font-bold hover:bg-accent-primary/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          aria-label="Immagine precedente"
        >
          ←
        </button>
        <button
          onClick={onNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-accent-primary/40 bg-accent-primary/20 px-5 py-3 text-xl text-accent-primary font-bold hover:bg-accent-primary/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          aria-label="Immagine successiva"
        >
          →
        </button>

        <div className="w-full">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-3xl overflow-hidden rounded-3xl border-2 border-accent-primary/60 bg-zinc-900/60 shadow-lg focus-within:shadow-xl">
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 92vw, 800px"
              className="object-cover"
              priority
            />
          </div>

          <div className="mx-auto mt-5 flex max-w-3xl items-center justify-between gap-4 text-accent-primary/90">
            <div className="text-base font-semibold">
              <span>{item.style}</span>
              <span className="mx-3 text-accent-primary/40">•</span>
              <span>{item.date}</span>
            </div>
            <div className="text-base font-bold">
              {index + 1}/{items.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

