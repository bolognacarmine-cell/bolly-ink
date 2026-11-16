"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { site } from "@/data/site";
import { useState } from "react";

const nav = [
  { href: "#servizi", label: "Servizi" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#video", label: "Video" },
  { href: "#artista", label: "Artista" },
  { href: "#contatti", label: "Contatti" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="group relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_12px_50px_-20px_rgba(0,0,0,.95),0_0_0_1px_rgba(139,92,246,0.08)_inset]">
          {/* Immersive ambient layers */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(120%_120%_at_0%_0%,rgba(139,92,246,0.18),transparent_45%),radial-gradient(90%_120%_at_100%_0%,rgba(231,195,118,0.12),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_35%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-20 -top-16 h-24 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl motion-safe:animate-[header-sheen_8s_ease-in-out_infinite]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5"
          />

          <div className="relative flex items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-5">
            <a
              href="#top"
              className="min-w-0 flex items-center gap-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
              aria-label="Torna in alto"
            >
              <span className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-violet-500/40 via-fuchsia-500/20 to-amber-300/30 blur-md"
                />
                <Image
                  src="/logo.jpg"
                  alt={`${site.brand} logo`}
                  width={54}
                  height={54}
                  priority
                  className="relative rounded-xl object-cover ring-1 ring-white/20"
                />
              </span>
              <span className="truncate text-sm sm:text-lg font-semibold tracking-[0.14em] sm:tracking-[0.18em] uppercase drop-shadow-[0_0_18px_rgba(139,92,246,0.35)]">
                {site.brand}
              </span>
            </a>

            <nav className="hidden lg:flex items-center gap-1 text-sm text-white/75">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-2 hover:text-white hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:hidden"
              >
                <span className="flex w-5 flex-col gap-1.5">
                  <span
                    className={`block h-0.5 w-full rounded-full bg-white transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
                  />
                  <span
                    className={`block h-0.5 w-full rounded-full bg-white transition ${menuOpen ? "opacity-0" : ""}`}
                  />
                  <span
                    className={`block h-0.5 w-full rounded-full bg-white transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
                  />
                </span>
              </button>
              <Button
                href="#contatti"
                variant="secondary"
                className="hidden sm:inline-flex btn-secondary"
                ariaLabel="Contatta lo studio"
              >
                {site.ctaTertiary}
              </Button>
              <Button
                href={site.contacts.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary px-4 sm:px-5"
                ariaLabel="Prenota subito su WhatsApp"
                style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "0.025em" }}
              >
                {site.ctaPrimary}
              </Button>
            </div>
          </div>

          {menuOpen ? (
            <div className="relative border-t border-white/10 px-3 pb-3 pt-2 lg:hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent"
              />
              <nav className="relative grid gap-2">
                {nav.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white hover:border-violet-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
