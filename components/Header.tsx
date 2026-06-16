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
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/55 backdrop-blur-xl shadow-[0_10px_40px_-25px_rgba(0,0,0,.9)]">
          <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-5">
            <a
              href="#top"
              className="min-w-0 flex items-center gap-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
              aria-label="Torna in alto"
            >
              <Image
                src="/logo.jpg"
                alt={`${site.brand} logo`}
                width={54}
                height={54}
                priority
                className="rounded-xl object-cover"
              />
              <span className="truncate text-sm sm:text-lg font-semibold tracking-[0.14em] sm:tracking-[0.18em] uppercase">
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
                className="hidden sm:inline-flex"
              >
                {site.ctaTertiary}
              </Button>
              <Button
                href={site.contacts.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 sm:px-5"
              >
                {site.ctaPrimary}
              </Button>
            </div>
          </div>

          {menuOpen ? (
            <div className="border-t border-white/10 px-3 pb-3 pt-2 lg:hidden">
              <nav className="grid gap-2">
                {nav.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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
