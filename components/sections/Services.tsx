'use client';

import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Card3D } from "@/components/ui/Card3D";
import { services } from "@/data/site";
import { useEffect, useState } from "react";

export function Services() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Section id="servizi" className="bg-black">
      <Reveal>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase text-white/60">
              Servizi
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Stili, tecnica, visione.
            </h2>
          </div>
          <p className="hidden sm:block max-w-md text-sm text-white/60 leading-relaxed">
            Ogni lavoro nasce da un design su misura, costruito per durare e
            leggibile da vicino e da lontano.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Reveal key={s.id} className="h-full">
            <Card3D depth="medium" disabled={isMobile} className="h-full">
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-[0_18px_60px_-40px_rgba(255,255,255,.35)]">
                <div 
                  className="flex items-start justify-between gap-4"
                  style={{ transform: 'translateZ(8px)' }}
                >
                  <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                  <span className="text-[10px] text-white/50 tracking-[0.20em] uppercase">
                    {s.id}
                  </span>
                </div>
                <p 
                  className="mt-3 text-sm text-white/65 leading-relaxed"
                  style={{ transform: 'translateZ(5px)' }}
                >
                  {s.description}
                </p>
                {s.tags?.length ? (
                  <div 
                    className="mt-5 flex flex-wrap gap-2"
                    style={{ transform: 'translateZ(3px)' }}
                  >
                    {s.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </Card3D>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

