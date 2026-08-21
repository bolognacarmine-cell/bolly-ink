import { Section } from "@/components/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/data/site";

export function FinalCTA() {
  return (
    <Section id="prenota" className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_40%,rgba(139,92,246,0.22),transparent_60%)]" />
        <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-noise" />
        <div className="absolute inset-0 border-t border-white/10" />
      </div>

      <div className="relative">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs tracking-[0.22em] uppercase text-white/60">
              Prendi un appuntamento
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-accent-primary drop-shadow-lg">
              Il tuo prossimo pezzo inizia qui.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
              Consulenza trasparente, progetto su misura, protocollo d&rsquo;igiene certificato.
              Scrivimi su WhatsApp con idea, zona del corpo e riferimenti: rispondo entro 24h.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-5">
              <Button
                href={site.contacts.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full sm:w-auto"
                style={{ fontSize: "1.15rem", padding: "0.92em 2.35em", letterSpacing: "0.03em" }}
                ariaLabel="Prenota consulenza via WhatsApp"
              >
                Prenota consulenza
              </Button>
              <Button
                href={site.contacts.instagramUrl}
                target="_blank"
                rel="noreferrer"
                variant="secondary"
                className="btn-secondary w-full sm:w-auto"
                ariaLabel="Vedi altri lavori su Instagram"
              >
                Vedi altri lavori
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-1 min-[430px]:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {[
                { k: "Risposta", v: "< 24h" },
                { k: "Materiali", v: "Certificati" },
                { k: "Privacy", v: "Totale" },
              ].map((i) => (
                <div
                  key={i.k}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col items-center backdrop-blur-sm"
                >
                  <p className="text-[10px] uppercase tracking-[0.20em] text-white/55 font-semibold">
                    {i.k}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">{i.v}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
