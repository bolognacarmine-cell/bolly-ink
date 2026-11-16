'use client';

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const ImmersiveScene = dynamic(
  () => import("@/components/immersive/ImmersiveScene").then((m) => m.ImmersiveScene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <LoadingSpinner size="lg" />
      </div>
    ),
  }
);

export function HeroImmersive({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`absolute inset-0 ${className}`} aria-hidden="true" />;
  }

  return <ImmersiveScene className={className} />;
}
