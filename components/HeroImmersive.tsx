'use client';

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useScenePerformance } from "@/hooks/useScenePerformance";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const ImmersiveScene = dynamic(() => import("@/components/immersive/ImmersiveScene").then(m => m.ImmersiveScene), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  ),
});

export function HeroImmersive({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const perf = useScenePerformance();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.debug('[HeroImmersive] Stato:', {
        mounted,
        perfLevel: perf.level,
        reduced,
        maxParticles: perf.maxParticles,
        maxFilaments: perf.maxFilaments,
        pixelRatio: perf.pixelRatio,
        enableShadows: perf.enableShadows,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      });
    }
  }, [mounted, perf, reduced]);

  if (!mounted) {
    return (
      <div className={`absolute inset-0 ${className}`} aria-hidden="true" style={{ outline: '2px solid rgba(255,0,0,0.35)' }} />
    );
  }

  // Mostriamo SEMPRE la scena 3D; reduced-motion riduce solo le animazioni interne (non nasconde la scena)
  if (reduced) {
    return (
      <div className={`absolute inset-0 ${className}`} aria-hidden="true" style={{ outline: '2px solid rgba(139,92,246,0.4)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.25),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(231,195,118,0.12),transparent_55%)]" />
      </div>
    );
  }

  return <ImmersiveScene className={className} />;
}
