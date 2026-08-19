'use client';

import { cn } from '@/lib/utils';
import { use3DTilt } from '@/hooks/use3DTilt';
import { useEffect, useState } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  depth?: 'shallow' | 'medium' | 'deep';
  disabled?: boolean;
}

export function Card3D({ children, className, depth = 'medium', disabled }: Card3DProps) {
  const { ref, rotateX, rotateY, isHovered, handleMouseMove, handleMouseEnter, handleMouseLeave } = use3DTilt({
    maxRotation: depth === 'shallow' ? 4 : depth === 'medium' ? 8 : 12,
    disabled
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Use requestAnimationFrame to avoid setState during effect
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

  const depthLayers = {
    shallow: { bg: '-10px', content: '-5px', accent: '5px' },
    medium: { bg: '-20px', content: '-10px', accent: '10px' },
    deep: { bg: '-30px', content: '-15px', accent: '15px' }
  };

  const layers = depthLayers[depth];

  return (
    <div
      ref={ref}
      className={cn('relative rounded-2xl border border-accent-primary/20 bg-zinc-900/50 shadow-lg transition hover:shadow-xl focus-within:shadow-xl focus-within:border-accent-primary/60', className)}
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        outline: isHovered ? '2.5px solid var(--accent-primary)' : undefined,
        outlineOffset: isHovered ? '2px' : undefined
      }}
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Card interattiva di approfondimento"
      role="group"
    >
      <div
        className="relative transition-transform duration-150 ease-out"
        style={{
          transform: prefersReducedMotion || disabled 
            ? 'none' 
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {children}
      </div>
    </div>
  );
}
