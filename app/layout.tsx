import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";

const heading = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.seo.title,
    template: `%s | ${site.brand}`,
  },
  description: site.seo.description,
  applicationName: site.brand,
  authors: [{ name: site.artistName }],
  keywords: [
    "tattoo",
    "tatuaggi",
    "tatuatore",
    "blackwork",
    "realism",
    "realistico",
    "cover-up",
    "lettering",
    "custom tattoo",
    "studio tattoo",
    "tatuaggi bologna",
    "bolly ink",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: site.seo.title,
    description: site.seo.description,
    siteName: site.brand,
    images: [
      {
        url: "/hero/hero.jpg",
        width: 1200,
        height: 630,
        alt: site.seo.title,
      },
    ],
    locale: "it_IT",
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
    images: ["/hero/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.jpg",
  },
  category: "Tattoo Studio",
};

export const viewport: Viewport = {
  themeColor: "#070707",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${heading.variable} ${body.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-accent-primary/40">
        {children}
      </body>
    </html>
  );
}
