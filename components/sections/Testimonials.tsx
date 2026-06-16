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
        {testimonials.map((t) => (
          <Reveal key={t.id} className="h-full">
            <figure className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_-55px_rgba(255,255,255,.35)]">
              <blockquote className="text-sm text-white/70 leading-relaxed">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  {t.city ? (
                    <p className="text-xs text-white/55">{t.city}</p>
                  ) : null}
                </div>
                <div className="h-9 w-9 rounded-full border border-white/10 bg-black/30" />
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

