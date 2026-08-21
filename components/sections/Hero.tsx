'use client';

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { site } from "@/data/site";
import { use3DTilt } from "@/hooks/use3DTilt";
import { HeroImmersive } from "@/components/HeroImmersive";
import { useEffect, useState } from "react";

export function Hero() {
  const { ref, rotateX, rotateY, handleMouseMove, handleMouseEnter, handleMouseLeave } = use3DTilt({
    maxRotation: 6
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    requestAnimationFrame(() => {
      setPrefersReducedMotion(mediaQuery.matches);
    });
    const handleChange = (e: MediaQueryListEvent) => {
      requestAnimationFrame(() => {
        setPrefersReducedMotion(e.matches);
      });
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
    setTimeout(() => setHeroLoaded(true), 300);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden min-h-screen flex items-center justify-center">
      {/* Background layers: image + subtle gradients (UNDER the 3D scene) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero/hero.jpg"
          alt="Studio tattoo: hero background"
          fill
          priority
          className="object-cover object-center brightness-[0.55] contrast-110 saturate-70 opacity-40"
          style={{
            transform: prefersReducedMotion ? 'none' : 'scale(1.02)',
            transition: 'transform 0.8s ease-out'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75" />
        <div className="absolute inset-0 opacity-25 mix-blend-overlay bg-noise" />
      </div>

      {/* 3D WebGL Scene - between background and content */}
      <HeroImmersive className="z-10" />

      <div
        ref={ref}
        className="relative z-20 w-full"
        style={{ perspective: '1200px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="mx-auto max-w-3xl px-6 py-24 md:py-36 bg-black/60 shadow-xl rounded-2xl backdrop-blur-md border border-white/10 flex flex-col items-center"
          style={{
            transformStyle: 'preserve-3d',
            transform: prefersReducedMotion
              ? `translateY(${isVisible ? 0 : 30}px)`
              : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${isVisible ? 0 : 30}px)`,
            transition: prefersReducedMotion
              ? 'transform 0.8s cubic-bezier(.22,1,.36,1), opacity 0.7s'
              : 'transform 0.22s cubic-bezier(.22,1,.36,1), opacity 0.7s',
            opacity: isVisible ? 1 : 0
          }}
        >
          <h1
            className="text-4xl sm:text-6xl md:text-7xl text-center font-bold tracking-tight text-white mb-5 drop-shadow-xl max-w-[11ch]"
            style={{
              textShadow: '0 2px 36px #8b5cf633, 0 2px 6px #000c',
            }}
          >
            Arte sulla <span className="text-accent-primary font-bold">pelle</span>.
          </h1>
          <span className="block text-white/85 text-xl sm:text-2xl text-center mb-7 ">
            Nero, luce, rito contemporaneo.
          </span>
          <p
            className="max-w-xl text-lg sm:text-xl text-white/70 leading-relaxed text-center mb-10"
            style={{
              opacity: heroLoaded ? 1 : 0,
              transition: 'opacity 0.8s 0.12s'
            }}
          >
            {site.tagline}
          </p>

          {/* ONLY CTA PRIMARY prominently, secondary as subtle link below */}
          <div className="flex flex-col items-center gap-5 w-full">
            <Button
              href={site.contacts.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto btn-primary"
              aria-label="Prenota subito su WhatsApp"
              style={{ fontSize: "1.25rem", padding: '0.92em 2.35em', letterSpacing: "0.035em" }}
            >
              {site.ctaPrimary}
            </Button>
            <a
              href="#contatti"
              className="mt-1 inline-block text-accent-primary text-base tracking-wide font-medium underline underline-offset-4 hover:text-white hover:bg-accent-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded px-2 transition"
            >
              {site.ctaTertiary}
            </a>
          </div>

          {/* Quick Values as badge grid, more spacing and clarity */}
          <div className="mt-12 grid grid-cols-1 min-[430px]:grid-cols-2 sm:grid-cols-4 gap-5 max-w-2xl w-full">
            {[
              { k: "Igiene", v: "Protocollo studio" },
              { k: "Design", v: "Progetto su misura" },
              { k: "Precisione", v: "Linee e ombre" },
              { k: "Premium", v: "Esperienza dedicata" },
            ].map((item, index) => (
              <div
                key={item.k}
                className="rounded-xl border border-accent-primary/20 bg-zinc-900/60 px-5 py-4 flex flex-col gap-1 items-center shadow-md"
              >
                <p className="text-base font-semibold tracking-tight text-white">
                  {item.k}
                </p>
                <p className="text-xs text-accent-primary/90 font-medium">
                  {item.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
