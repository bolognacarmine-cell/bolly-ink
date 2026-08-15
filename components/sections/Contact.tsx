"use client";

import { useMemo, useState } from "react";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/data/site";
import { useIsMobile } from "@/hooks/useMediaQuery";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(`Richiesta tattoo - ${name || "Cliente"}`);
    const body = encodeURIComponent(
      `Nome: ${name}\nEmail: ${email}\n\nMessaggio:\n${message}\n`,
    );
    return `mailto:${site.contacts.email}?subject=${subject}&body=${body}`;
  }, [email, message, name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      window.location.href = mailto;
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <Section id="contatti" className="bg-black">
      <Reveal>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase text-white/60">
              Contatti / Prenotazione
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Prenota una consulenza.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/60 leading-relaxed">
              Risposte rapide su WhatsApp o Instagram. Per richieste dettagliate
              usa il modulo: brief, zona, stile, dimensioni e riferimento. I
              dettagli dello studio vengono forniti solo dopo il primo contatto.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-3 lg:flex">
            <Button
              href={site.contacts.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full"
            >
              WhatsApp
            </Button>
            <Button
              href={site.contacts.instagramUrl}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              className="w-full"
            >
              Instagram
            </Button>
            <Button
              href={site.contacts.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              className="w-full"
            >
              TikTok
            </Button>
          </div>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_30px_110px_-70px_rgba(255,255,255,.45)] transition hover:shadow-[0_35px_120px_-75px_rgba(255,255,255,.5)]"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs text-white/60">Nome</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition focus:border-white/20"
                  placeholder="Il tuo nome"
                  autoComplete="name"
                  disabled={isSubmitting}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs text-white/60">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition focus:border-white/20"
                  placeholder="nome@email.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </label>
            </div>

            <label className="mt-4 grid gap-2">
              <span className="text-xs text-white/60">Messaggio</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-32 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition focus:border-white/20 resize-none"
                placeholder="Zona del corpo, stile, dimensioni, idea e riferimento..."
                disabled={isSubmitting}
              />
            </label>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <p className="text-xs text-white/50">
                In produzione collega il form a un provider (Formspree, Resend,
                endpoint API) o sostituisci la logica mailto.
              </p>
              <Button 
                ariaLabel="Invia richiesta via email" 
                href={mailto} 
                className="w-full sm:w-auto transition hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Invio in corso...' : 'Invia richiesta'}
              </Button>
            </div>
          </form>
        </Reveal>

        <Reveal style={{ transitionDelay: '0.1s' }}>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 transition hover:shadow-[0_25px_90px_-65px_rgba(255,255,255,.4)]">
            <h3 className="text-lg font-semibold text-white">Contatti diretti</h3>
            <p className="mt-2 text-sm text-white/65 leading-relaxed">
              Per privacy e gestione appuntamenti, posizione e dettagli completi
              dello studio vengono condivisi dopo chiamata o messaggi.
            </p>
            <div className="mt-6 grid gap-3">
              <a
                href={`tel:${site.contacts.phone.replaceAll(" ", "")}`}
                className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-sm text-white/75 hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 hover:border-white/15 flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-white">Tel: {site.contacts.phone}</span>
              </a>
              <a
                href={`mailto:${site.contacts.email}`}
                className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-sm text-white/75 hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 hover:border-white/15 flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-white">Email: {site.contacts.email}</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
