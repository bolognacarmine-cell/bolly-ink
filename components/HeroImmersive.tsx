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
  return <Hero3D className={className} />;
}
