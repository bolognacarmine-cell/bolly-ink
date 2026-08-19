'use client';

import Image from "next/image";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { site } from "@/data/site";
import { useParallax } from "@/hooks/useScrollAnimation";
import { useIsMobile } from "@/hooks/useMediaQuery";

export function About() {
  const isMobile = useIsMobile();
  const imageRef = useParallax(isMobile ? 0 : 0.3);

  return (
    <Section id="artista" className="bg-black">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div>
            <p className="text-xs tracking-[0.22em] uppercase text-white/60">
              Artista
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-accent-primary drop-shadow-lg">
              {site.artistName}
            </h2>
            <p className="mt-5 text-base text-white/80 leading-relaxed">
              Christian è un tatuatore emergente con una visione <b>autentica e riconoscibile</b>. Ogni progetto nasce da una
              consulenza trasparente: concept, proporzioni, flusso sul corpo e resa nel tempo.
            </p>
            <p className="mt-4 text-base text-white/70 leading-relaxed">
              Studio orientato a igiene, precisione e comfort. Materiali certificati, protocolli rigorosi e attenzione ai dettagli:
              dal linework al finish finale.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { k: "Esperienza", v: "10+", suffix: "+ anni" },
                { k: "Approccio", v: "Custom", isText: true },
                { k: "Stile", v: "Dark luxury", isText: true },
                { k: "Standard", v: "Igiene pro", isText: true },
              ].map((i) => (
                <div
                  key={i.k}
                  className="rounded-xl border border-accent-primary/20 bg-zinc-900/60 p-4 flex flex-col items-center shadow-md"
                >
                  <p className="text-xs text-accent-primary font-semibold uppercase tracking-wide">{i.k}</p>
                  <p className="mt-1 text-base font-bold text-white">
                    {i.isText ? i.v : <Counter end={parseInt(i.v)} suffix={i.suffix} />}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div 
            ref={imageRef}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_110px_-70px_rgba(255,255,255,.45)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_30%_20%,rgba(255,255,255,.12),transparent_55%)]" />
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-noise" />
            <div className="relative aspect-[4/5]">
              <Image
                src="/about/chritatto.webp"
                alt="Ritratto artista tattoo"
                fill
                sizes="(max-width: 1024px) 92vw, 520px"
                className="object-cover object-center brightness-[0.8] contrast-110"
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
