import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-10 text-sm text-white/55">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.brand}. Tutti i diritti riservati.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              className="hover:text-white transition"
              href={site.contacts.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a
              className="hover:text-white transition"
              href={site.contacts.tiktokUrl}
              target="_blank"
              rel="noreferrer"
            >
              TikTok
            </a>
            <a
              className="hover:text-white transition"
              href={site.contacts.whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a className="hover:text-white transition" href={`mailto:${site.contacts.email}`}>
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
