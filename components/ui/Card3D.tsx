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
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
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
      className={cn('relative', className)}
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative transition-transform duration-100 ease-out"
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
