import Image from "next/image";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/data/site";

export function About() {
  return (
    <Section id="artista" className="bg-black">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div>
            <p className="text-xs tracking-[0.22em] uppercase text-white/60">
              Artista
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              {site.artistName}
            </h2>
            <p className="mt-5 text-sm text-white/65 leading-relaxed">
              Christian è un tatuatore emergente con una visione già forte,
              riconoscibile e molto personale. Ogni progetto nasce da una
              consulenza chiara: concept, proporzioni, flusso sul corpo e resa
              nel tempo.
            </p>
            <p className="mt-4 text-sm text-white/65 leading-relaxed">
              Studio orientato a igiene, precisione e comfort. Materiali
              certificati, protocolli rigorosi e attenzione ai dettagli: dal
              linework al finish finale.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { k: "Esperienza", v: "10+ anni" },
                { k: "Approccio", v: "Custom design" },
                { k: "Stile", v: "Dark luxury" },
                { k: "Standard", v: "Igiene pro" },
              ].map((i) => (
                <div
                  key={i.k}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-xs text-white/55">{i.k}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{i.v}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_30px_110px_-70px_rgba(255,255,255,.45)]">
            <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_30%_20%,rgba(255,255,255,.12),transparent_55%)]" />
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-noise" />
            <div className="relative aspect-[4/5]">
              <Image
                src="/about/about.jpg"
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
