import { Header } from "@/components/Header";
import { StickyCTA } from "@/components/StickyCTA";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { PortfolioImages } from "@/components/sections/PortfolioImages";
import { VideoGallery } from "@/components/sections/VideoGallery";
import { Testimonials } from "@/components/sections/Testimonials";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Contact } from "@/components/sections/Contact";
import { getMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function Home() {
  const media = await getMedia();

  return (
    <div className="min-h-screen bg-black text-white">
      <a
        href="#contatti"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        Vai alla prenotazione
      </a>

      <div className="pointer-events-none fixed inset-0 opacity-30 mix-blend-overlay bg-noise" />

      <Header />
      <StickyCTA />
      <main>
        <Hero />
        <About />
        <Services />
        <PortfolioImages images={media.portfolioImages} />
        <VideoGallery videos={media.videos} />
        <Testimonials />
        <FinalCTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
