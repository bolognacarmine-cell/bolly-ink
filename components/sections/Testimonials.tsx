'use client';

import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { testimonials } from "@/data/site";

export function Testimonials() {
  return (
    <Section id="recensioni" className="bg-black">
      <Reveal>
        <div>
          <p className="text-xs tracking-[0.22em] uppercase text-white/60">
            Recensioni
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Poche, curate. Come i pezzi.
          </h2>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, index) => (
          <Reveal key={t.id} className="h-full" style={{ transitionDelay: `${index * 0.1}s` }}>
            <figure className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_-55px_rgba(255,255,255,.35)] transition hover:shadow-[0_25px_80px_-60px_rgba(255,255,255,.45)] hover:border-white/15">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-white/60"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <blockquote className="text-sm text-white/70 leading-relaxed">
                "{t.text}"
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  {t.city ? (
                    <p className="text-xs text-white/55">{t.city}</p>
                  ) : null}
                </div>
                <div className="h-10 w-10 rounded-full border border-white/10 bg-black/30 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white/60">
                    {t.name.charAt(0)}
                  </span>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

