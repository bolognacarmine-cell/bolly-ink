"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  depth?: 'none' | 'shallow' | 'medium';
};

export function Reveal({ children, className, depth = 'none' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const depthStyles = {
    none: 'translateY-0',
    shallow: 'translate-y-0 translate-z-0',
    medium: 'translate-y-0 translate-z-0'
  };

  const depthTransform = {
    none: 'translateY(0)',
    shallow: 'translateY(0) translateZ(0)',
    medium: 'translateY(0) translateZ(0)'
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition duration-700 ease-out will-change-transform",
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{
        transform: prefersReducedMotion 
          ? (visible ? 'translateY(0)' : 'translateY(20px)')
          : (visible 
              ? depthTransform[depth] 
              : `translateY(30px) ${depth === 'medium' ? 'translateZ(-10px)' : depth === 'shallow' ? 'translateZ(-5px)' : ''}`),
        transformStyle: depth !== 'none' ? 'preserve-3d' : undefined
      }}
    >
      {children}
    </div>
  );
}

