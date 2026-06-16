import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { site } from "@/data/site";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(255,255,255,.10),transparent_55%),radial-gradient(900px_circle_at_70%_35%,rgba(255,255,255,.08),transparent_60%),linear-gradient(to_bottom,rgba(0,0,0,.30),rgba(0,0,0,.85),rgba(0,0,0,1))]" />
        <div className="absolute inset-0 opacity-45 mix-blend-overlay bg-noise" />
        <Image
          src="/hero/hero.jpg"
          alt="Studio tattoo: hero background"
          fill
          priority
          className="object-cover object-center brightness-[0.55] contrast-125 saturate-75"
        />
      </div>

      <div className="relative">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 pt-32 pb-20 sm:pt-44 sm:pb-32">
          <div className="max-w-3xl">
            <h1 className="max-w-[10ch] text-[2.35rem] sm:text-6xl font-semibold tracking-tight text-white leading-[0.98] sm:leading-[1.05]">
              Arte sulla pelle.
              <span className="block text-white/80">
                Nero, luce, rito contemporaneo.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[15px] sm:text-lg text-white/70 leading-relaxed">
              {site.tagline}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button
                href={site.contacts.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                {site.ctaPrimary}
              </Button>
              <Button href="#portfolio" variant="secondary" className="w-full sm:w-auto">
                {site.ctaSecondary}
              </Button>
              <Button href="#contatti" variant="ghost" className="w-full sm:w-auto">
                {site.ctaTertiary}
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-1 min-[430px]:grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              {[
                { k: "Igiene", v: "Protocollo studio" },
                { k: "Design", v: "Progetto su misura" },
                { k: "Precisione", v: "Linee e ombre" },
                { k: "Premium", v: "Esperienza dedicata" },
              ].map((item) => (
                <div
                  key={item.k}
                  className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-4"
                >
                  <p className="text-sm font-semibold text-white">{item.k}</p>
                  <p className="mt-1 text-xs text-white/60">{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
