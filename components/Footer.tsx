import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-10 text-sm text-white/55">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.brand}. Tutti i diritti riservati.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4 items-center">
            <a
              className="text-accent-primary hover:text-white/95 font-semibold transition underline underline-offset-4 rounded focus-visible:ring-2 focus-visible:ring-accent-primary px-2 py-1"
              href={site.contacts.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram Bolly Ink"
            >
              Instagram
            </a>
            <a
              className="text-accent-primary hover:text-white/95 font-semibold transition underline underline-offset-4 rounded focus-visible:ring-2 focus-visible:ring-accent-primary px-2 py-1"
              href={site.contacts.tiktokUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok Bolly Ink"
            >
              TikTok
            </a>
            <a
              className="text-accent-primary hover:text-white/95 font-semibold transition underline underline-offset-4 rounded focus-visible:ring-2 focus-visible:ring-accent-primary px-2 py-1"
              href={site.contacts.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp Bolly Ink"
            >
              WhatsApp
            </a>
            <a 
              className="text-accent-primary hover:text-white/95 font-semibold transition underline underline-offset-4 rounded focus-visible:ring-2 focus-visible:ring-accent-primary px-2 py-1" 
              href={`mailto:${site.contacts.email}`}
              aria-label="Invia una mail"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
