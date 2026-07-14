'use client';

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { site } from "@/data/site";
import { use3DTilt } from "@/hooks/use3DTilt";
import { Hero3D } from "@/components/Hero3D";
import { useEffect, useState } from "react";

export function Hero() {
  const { ref, rotateX, rotateY, handleMouseMove, handleMouseEnter, handleMouseLeave } = use3DTilt({
    maxRotation: 6
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    
    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('resize', checkMobile);
    checkMobile();
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden min-h-screen">
      {/* 3D WebGL Scene - behind everything */}
      <Hero3D className="z-0" />
      
      {/* Original background with reduced opacity for depth layering */}
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(255,255,255,.05),transparent_55%),radial-gradient(900px_circle_at_70%_35%,rgba(255,255,255,.03),transparent_60%),linear-gradient(to_bottom,rgba(0,0,0,.40),rgba(0,0,0,.90),rgba(0,0,0,1))]" />
        <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-noise" />
        <Image
          src="/hero/hero.jpg"
          alt="Studio tattoo: hero background"
          fill
          priority
          className="object-cover object-center brightness-[0.45] contrast-120 saturate-70 opacity-60"
          style={{ 
            transform: prefersReducedMotion ? 'none' : 'scale(1.02)',
            transition: 'transform 0.8s ease-out'
          }}
        />
      </div>

      <div 
        ref={ref}
        className="relative z-20"
        style={{ perspective: '1200px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className="mx-auto max-w-6xl px-5 sm:px-6 pt-32 pb-20 sm:pt-44 sm:pb-32"
          style={{
            transformStyle: 'preserve-3d',
            transform: prefersReducedMotion 
              ? `translateY(${isVisible ? 0 : 30}px)` 
              : `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${isVisible ? 0 : 30}px)`,
            transition: prefersReducedMotion 
              ? 'transform 0.8s ease-out, opacity 0.8s ease-out'
              : 'transform 0.15s ease-out, opacity 0.8s ease-out',
            opacity: isVisible ? 1 : 0
          }}
        >
          <div className="max-w-3xl">
            <h1 
              className="max-w-[10ch] text-[2.35rem] sm:text-6xl font-semibold tracking-tight text-white leading-[0.98] sm:leading-[1.05]"
              style={{ transform: 'translateZ(20px)' }}
            >
              Arte sulla pelle.
              <span className="block text-white/80">
                Nero, luce, rito contemporaneo.
              </span>
            </h1>

            <p 
              className="mt-5 max-w-xl text-[15px] sm:text-lg text-white/70 leading-relaxed"
              style={{ transform: 'translateZ(15px)' }}
            >
              {site.tagline}
            </p>

            <div 
              className="mt-10 flex flex-col sm:flex-row gap-3"
              style={{ transform: 'translateZ(25px)' }}
            >
              <Button
                href={site.contacts.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                {site.ctaPrimary}
              </Button>
              <Button href="#portfolio" variant="secondary" className="w-full sm:w-auto">
                {site.ctaSecondary}
              </Button>
              <Button href="#contatti" variant="ghost" className="w-full sm:w-auto">
                {site.ctaTertiary}
              </Button>
            </div>

            <div 
              className="mt-10 grid grid-cols-1 min-[430px]:grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl"
              style={{ transform: 'translateZ(10px)' }}
            >
              {[
                { k: "Igiene", v: "Protocollo studio" },
                { k: "Design", v: "Progetto su misura" },
                { k: "Precisione", v: "Linee e ombre" },
                { k: "Premium", v: "Esperienza dedicata" },
              ].map((item) => (
                <div
                  key={item.k}
                  className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-4"
                  style={{ transform: 'translateZ(5px)' }}
                >
                  <p className="text-sm font-semibold text-white">{item.k}</p>
                  <p className="mt-1 text-xs text-white/60">{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
