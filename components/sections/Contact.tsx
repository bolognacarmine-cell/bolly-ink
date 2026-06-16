"use client";

import { useMemo, useState } from "react";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/data/site";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailto = useMemo(() => {
    const subject = encodeURIComponent(`Richiesta tattoo - ${name || "Cliente"}`);
    const body = encodeURIComponent(
      `Nome: ${name}\nEmail: ${email}\n\nMessaggio:\n${message}\n`,
    );
    return `mailto:${site.contacts.email}?subject=${subject}&body=${body}`;
  }, [email, message, name]);

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

          <div className="flex gap-2">
            <Button href={site.contacts.whatsappUrl} target="_blank" rel="noreferrer">
              WhatsApp
            </Button>
            <Button
              href={site.contacts.instagramUrl}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
            >
              Instagram
            </Button>
            <Button
              href={site.contacts.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
            >
              TikTok
            </Button>
          </div>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = mailto;
            }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_30px_110px_-70px_rgba(255,255,255,.45)]"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs text-white/60">Nome</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="Il tuo nome"
                  autoComplete="name"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs text-white/60">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="nome@email.com"
                  autoComplete="email"
                />
              </label>
            </div>

            <label className="mt-4 grid gap-2">
              <span className="text-xs text-white/60">Messaggio</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-32 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Zona del corpo, stile, dimensioni, idea e riferimento..."
              />
            </label>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <p className="text-xs text-white/50">
                In produzione collega il form a un provider (Formspree, Resend,
                endpoint API) o sostituisci la logica mailto.
              </p>
              <Button ariaLabel="Invia richiesta via email" href={mailto}>
                Invia richiesta
              </Button>
            </div>
          </form>
        </Reveal>

        <Reveal>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-white">Contatti diretti</h3>
            <p className="mt-2 text-sm text-white/65 leading-relaxed">
              Per privacy e gestione appuntamenti, posizione e dettagli completi
              dello studio vengono condivisi dopo chiamata o messaggi.
            </p>
            <div className="mt-6 grid gap-3">
              <a
                href={`tel:${site.contacts.phone.replaceAll(" ", "")}`}
                className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-sm text-white/75 hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Tel: <span className="text-white">{site.contacts.phone}</span>
              </a>
              <a
                href={`mailto:${site.contacts.email}`}
                className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-sm text-white/75 hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Email: <span className="text-white">{site.contacts.email}</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
