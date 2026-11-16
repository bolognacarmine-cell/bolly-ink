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
  const [stage, setStage] = useState(0);
  const [bgRevealed, setBgRevealed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = (matches: boolean) => {
      setPrefersReducedMotion(matches);
      setStage(matches ? 5 : 0);
      setBgRevealed(matches);
    };
    apply(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => apply(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const [storyPhase, setStoryPhase] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setStoryPhase(3);
      return;
    }
    // Storia cinematografica: risveglio → il gesto → il segno prende vita → lo studio si rivela
    const timers = [
      window.setTimeout(() => setStoryPhase(1), 900),    // close-up / risveglio
      window.setTimeout(() => setStoryPhase(2), 7200),   // firma completata, esplosione di luce
      window.setTimeout(() => setBgRevealed(true), 7600),
      window.setTimeout(() => setStoryPhase(3), 8400),   // inquadratura finale / rivelazione
      window.setTimeout(() => setStage(1), 8800),
      window.setTimeout(() => setStage(2), 9300),
      window.setTimeout(() => setStage(3), 9800),
      window.setTimeout(() => setStage(4), 10300),
      window.setTimeout(() => setStage(5), 10800),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [prefersReducedMotion]);

  const reveal = (visible: boolean, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0px) scale(1)' : 'translateY(34px) scale(0.975)',
    filter: visible ? 'blur(0px)' : 'blur(12px)',
    letterSpacing: visible ? undefined : '0.04em',
    transition: prefersReducedMotion
      ? 'none'
      : `opacity 1000ms cubic-bezier(.16,1,.3,1) ${delay}ms, transform 1200ms cubic-bezier(.16,1,.3,1) ${delay}ms, filter 1200ms cubic-bezier(.16,1,.3,1) ${delay}ms, letter-spacing 1200ms cubic-bezier(.16,1,.3,1) ${delay}ms`,
  });

  return (
    <section id="top" className="relative isolate overflow-hidden min-h-[100svh] flex items-center justify-center">
      {/* Background layers (UNDER the 3D scene) - rivelazione narrativa */}
      <div
        className="absolute inset-0 z-0"
        style={{
          opacity: bgRevealed ? 1 : storyPhase >= 1 ? 0.12 : 0.04,
          filter: bgRevealed ? 'brightness(1) saturate(1)' : storyPhase >= 1 ? 'brightness(0.28) saturate(0.4)' : 'brightness(0.12) saturate(0.2)',
          transition: prefersReducedMotion ? 'none' : 'opacity 1800ms ease-out, filter 2000ms ease-out',
        }}
      >
        <Image
          src="/hero/hero.jpg"
          alt="Studio tattoo: hero background"
          fill
          priority
          className="object-cover object-center brightness-[0.55] contrast-115 saturate-[0.85] opacity-70"
          style={{
            transform: prefersReducedMotion ? 'none' : `scale(${bgRevealed ? 1.03 : 1.08})`,
            transition: prefersReducedMotion ? 'none' : 'transform 2200ms ease-out'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-[#070707]" />
        <div
          className="absolute inset-0"
          style={{
            opacity: bgRevealed ? 1 : 0.2,
            transition: prefersReducedMotion ? 'none' : 'opacity 1600ms ease-out',
            background: 'radial-gradient(ellipse_at_30%_20%,rgba(139,92,246,0.22),transparent_45%),radial-gradient(ellipse_at_70%_60%,rgba(231,195,118,0.12),transparent_40%)',
          }}
        />
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-noise" />
      </div>

      {/* 3D WebGL Scene - immersive layer */}
      <HeroImmersive className="z-10" />

      {/* Atmospheric overlays above 3D for depth */}
      <div className="pointer-events-none absolute inset-0 z-[15]" aria-hidden="true">
        <div
          className="absolute inset-0 transition-opacity duration-[1800ms] ease-out"
          style={{
            opacity: storyPhase >= 2 ? 1 : 0.45,
            background: 'radial-gradient(circle_at_center,transparent_20%,rgba(7,7,7,0.35)_70%,rgba(7,7,7,0.88)_100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070707] via-[#070707]/70 to-transparent" />
      </div>

      {/* Capitoli della storia */}
      <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center px-6 sm:top-28" aria-hidden="true">
        <p
          className="text-center text-xs uppercase tracking-[0.35em] text-white/70 sm:text-sm"
          style={{
            opacity: storyPhase === 1 ? 1 : 0,
            transform: storyPhase === 1 ? 'translateY(0px)' : 'translateY(8px)',
            filter: storyPhase === 1 ? 'blur(0px)' : 'blur(6px)',
            transition: prefersReducedMotion ? 'none' : 'opacity 900ms ease, transform 900ms ease, filter 900ms ease',
            textShadow: '0 0 24px rgba(139,92,246,0.35)',
          }}
        >
          La macchina si risveglia
        </p>
        <p
          className="absolute text-center text-xs uppercase tracking-[0.35em] text-violet-200/80 sm:text-sm"
          style={{
            opacity: storyPhase === 2 ? 1 : 0,
            transform: storyPhase === 2 ? 'translateY(0px)' : 'translateY(8px)',
            filter: storyPhase === 2 ? 'blur(0px)' : 'blur(6px)',
            transition: prefersReducedMotion ? 'none' : 'opacity 900ms ease, transform 900ms ease, filter 900ms ease',
            textShadow: '0 0 30px rgba(167,139,250,0.45)',
          }}
        >
          Il segno prende vita
        </p>
      </div>

      <div
        ref={ref}
        className="relative z-20 w-full"
        style={{ perspective: '1200px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="mx-auto max-w-3xl px-6 py-24 md:py-36 flex flex-col items-center"
          style={{
            transformStyle: 'preserve-3d',
            transform: prefersReducedMotion
              ? 'none'
              : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: prefersReducedMotion
              ? 'none'
              : 'transform 0.22s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <h1
            className="text-4xl sm:text-6xl md:text-7xl text-center font-bold tracking-tight text-white mb-5 drop-shadow-xl max-w-[11ch]"
            style={{
              textShadow: '0 4px 50px rgba(139,92,246,0.35), 0 2px 10px rgba(0,0,0,0.8)',
              ...reveal(stage >= 1),
            }}
          >
            Arte sulla <span className="text-accent-primary font-bold">pelle</span>.
          </h1>

          <span
            className="block text-white/85 text-xl sm:text-2xl text-center mb-7"
            style={reveal(stage >= 2)}
          >
            Nero, luce, rito contemporaneo.
          </span>

          <p
            className="max-w-xl text-lg sm:text-xl text-white/70 leading-relaxed text-center mb-10"
            style={reveal(stage >= 3)}
          >
            {site.tagline}
          </p>

          <div className="flex flex-col items-center gap-5 w-full" style={reveal(stage >= 4)}>
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
                style={reveal(stage >= 5, index * 90)}
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
