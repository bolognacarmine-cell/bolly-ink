import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/**
 * HeroImmersive:
 * Wrapper per la scena Hero3D, visualizzato solo se:
 *  - Non mobile
 *  - L'utente NON preferisce motion ridotta
 *  - (Lazy load)
 *
 * - Fornisce fallback accessibile.
 * - Non disturba Hero esistente.
 */

const Hero3D = dynamic(() => import("@/components/Hero3D").then(m => m.Hero3D), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner size="lg" /></div>,
});

export function HeroImmersive({ className = "" }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Minimum features needed
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!isMobile && !prefersReducedMotion);
  }, []);

  if (!enabled) {
    // Fallback: nulla se non supportato/consentito
    return null;
  }

  return <Hero3D className={className} />;
}
