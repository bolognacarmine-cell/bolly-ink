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

  if (!mounted) {
    return (
      <div className={`absolute inset-0 ${className}`} aria-hidden="true" />
    );
  }

  const useFallback = reduced || perf.level === "low";

  if (useFallback) {
    return (
      <div className={`absolute inset-0 ${className}`} aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.18),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(231,195,118,0.08),transparent_55%)]" />
      </div>
    );
  }

  return <ImmersiveScene className={className} />;
}
