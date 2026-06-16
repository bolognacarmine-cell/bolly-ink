export type TattooService = {
  id: string;
  title: string;
  description: string;
  tags?: string[];
};

export type PortfolioImage = {
  id: string;
  src: string;
  alt: string;
  style: string; // es: "blackwork", "realistic", "lettering"
  date: string; // ISO yyyy-mm-dd
};

export type VideoItem = {
  id: string;
  src: string;
  poster: string;
  title: string;
  duration: string; // es: "00:24"
  orientation: "vertical" | "horizontal";
  date: string; // ISO yyyy-mm-dd
};

export type Testimonial = {
  id: string;
  name: string;
  text: string;
  city?: string;
};

export const site = {
  brand: "Bolly ink",
  artistName: "Christian",
  tagline: "Blackwork, realism e custom design. Precisione, igiene, visione.",
  ctaPrimary: "Prenota ora",
  ctaSecondary: "Guarda i lavori",
  ctaTertiary: "Contattami",
  seo: {
    title: "Bolly ink | Tattoo Studio premium",
    description:
      "Tatuatore professionista: custom tattoo, blackwork, realism, cover-up. Portfolio immagini e video di lavorazione. Prenotazioni via WhatsApp/Instagram.",
  },
  contacts: {
    phone: "+39 380 379 2891",
    email: "studio@nomedominio.it",
    whatsappUrl: "https://wa.me/393803792891",
    instagramUrl: "https://www.instagram.com/bolly_ink_/",
    tiktokUrl: "https://www.tiktok.com/@_bolly_ink",
  },
} as const;

export const services: TattooService[] = [
  {
    id: "custom",
    title: "Custom tattoo",
    description:
      "Progetto su misura: ascolto, bozza, composizione e adattamento perfetto al corpo.",
    tags: ["Design", "Composizione", "Consulenza"],
  },
  {
    id: "blackwork",
    title: "Blackwork & ornamental",
    description:
      "Contrasto forte, geometrie e simbologia. Nero saturo, linee pulite e ritmo visivo.",
    tags: ["Linee", "Pattern", "Simboli"],
  },
  {
    id: "realistic",
    title: "Realistic",
    description:
      "Volumi, texture e profondità. Un realismo moderno, controllato e altamente leggibile.",
    tags: ["Ombre", "Dettagli", "Texture"],
  },
  {
    id: "coverup",
    title: "Cover-up",
    description:
      "Strategia e progettazione per coperture efficaci: si studia il vecchio tatuaggio e si costruisce il nuovo.",
    tags: ["Analisi", "Soluzioni", "Ritocco"],
  },
  {
    id: "lettering",
    title: "Lettering",
    description:
      "Tipografia elegante e leggibile. Dalla calligrafia alle composizioni minimal.",
    tags: ["Font", "Spaziatura", "Leggibilità"],
  },
];

export const portfolioImages: PortfolioImage[] = [
  {
    id: "p01",
    src: "/portfolio/p01.jpg",
    alt: "Tatuaggio blackwork con simbolo sacrale",
    style: "blackwork",
    date: "2026-05-12",
  },
  {
    id: "p02",
    src: "/portfolio/p02.jpg",
    alt: "Tatuaggio realistico: dettaglio ombre e texture",
    style: "realistic",
    date: "2026-05-02",
  },
  {
    id: "p03",
    src: "/portfolio/p03.jpg",
    alt: "Ornamental su avambraccio, linee e pattern",
    style: "ornamental",
    date: "2026-04-19",
  },
  {
    id: "p04",
    src: "/portfolio/p04.jpg",
    alt: "Lettering minimal premium",
    style: "lettering",
    date: "2026-04-01",
  },
  {
    id: "p05",
    src: "/portfolio/p05.jpg",
    alt: "Cover-up con contrasto elevato",
    style: "coverup",
    date: "2026-03-22",
  },
  {
    id: "p06",
    src: "/portfolio/p06.jpg",
    alt: "Dettaglio blackwork con texture opaca",
    style: "blackwork",
    date: "2026-03-10",
  },
  {
    id: "p07",
    src: "/portfolio/p07.jpg",
    alt: "Tatuaggio realistico in close-up",
    style: "realistic",
    date: "2026-02-27",
  },
  {
    id: "p08",
    src: "/portfolio/p08.jpg",
    alt: "Ornamental: geometria e simmetria",
    style: "ornamental",
    date: "2026-02-05",
  },
];

export const videos: VideoItem[] = [
  {
    id: "v01",
    src: "/videos/v01.mp4",
    poster: "/video-posters/v01.jpg",
    title: "Linework preciso (close-up)",
    duration: "00:24",
    orientation: "horizontal",
    date: "2026-05-18",
  },
  {
    id: "v02",
    src: "/videos/v02.mp4",
    poster: "/video-posters/v02.jpg",
    title: "Shading: profondità e texture",
    duration: "00:31",
    orientation: "horizontal",
    date: "2026-05-05",
  },
  {
    id: "v03",
    src: "/videos/v03.mp4",
    poster: "/video-posters/v03.jpg",
    title: "Reel verticale: dettaglio blackwork",
    duration: "00:18",
    orientation: "vertical",
    date: "2026-04-16",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t01",
    name: "Luca",
    city: "Milano",
    text: "Pulizia impeccabile, mano precisissima e risultato oltre le aspettative. Studio premium.",
  },
  {
    id: "t02",
    name: "Chiara",
    city: "Roma",
    text: "Ha trasformato un’idea confusa in un pezzo potente e super equilibrato. Consigliatissimo.",
  },
  {
    id: "t03",
    name: "Matteo",
    city: "Bologna",
    text: "Cover-up perfetto: non si vede più nulla del vecchio tattoo. Grande attenzione ai dettagli.",
  },
];

export const portfolioStyles = [
  "all",
  ...Array.from(new Set(portfolioImages.map((i) => i.style))),
] as const;
