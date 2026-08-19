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
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-accent-primary drop-shadow-lg">
            Poche, curate. Come i pezzi.
          </h2>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, index) => (
          <Reveal key={t.id} className="h-full" style={{ transitionDelay: `${index * 0.1}s` }}>
            <figure className="h-full rounded-2xl border border-accent-primary/20 bg-zinc-900/60 p-6 shadow-md transition hover:shadow-lg focus-within:shadow-xl hover:border-accent-primary/60">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-accent-primary/80"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <blockquote className="text-base text-white/80 leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-bold text-accent-primary">{t.name}</p>
                  {t.city ? (
                    <p className="text-xs text-white/55 font-medium">{t.city}</p>
                  ) : null}
                </div>
                <div className="h-10 w-10 rounded-full border border-accent-primary/20 bg-black/30 flex items-center justify-center">
                  <span className="text-base font-semibold text-accent-primary/90">
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

