import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { site } from "@/data/site";

const nav = [
  { href: "#servizi", label: "Servizi" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#video", label: "Video" },
  { href: "#artista", label: "Artista" },
  { href: "#contatti", label: "Contatti" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/55 backdrop-blur-xl shadow-[0_10px_40px_-25px_rgba(0,0,0,.9)]">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <a
              href="#top"
              className="flex items-center gap-4 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
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
              <span className="text-base sm:text-lg font-semibold tracking-[0.18em] uppercase">
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

            <div className="flex items-center gap-2">
              <Button
                href="#contatti"
                variant="secondary"
                className="hidden sm:inline-flex"
              >
                {site.ctaTertiary}
              </Button>
              <Button href={site.contacts.whatsappUrl} target="_blank" rel="noreferrer">
                {site.ctaPrimary}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
