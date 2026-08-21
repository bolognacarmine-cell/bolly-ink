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
  // Force 3D rendering for testing - remove all restrictions
  console.log('[HeroImmersive] 3D forced enabled for testing');
  return (
    <>
      <div className="fixed top-4 left-4 z-50 bg-red-500 text-white px-4 py-2 text-sm font-bold">
        HeroImmersive LOADED
      </div>
      <Hero3D className={className} />
    </>
  );
}
