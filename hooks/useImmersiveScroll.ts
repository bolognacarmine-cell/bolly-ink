'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseImmersiveScrollOptions {
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  onUpdate?: (progress: number) => void;
  onSectionChange?: (section: 'hero' | 'about' | 'portfolio' | 'contact') => void;
}

/**
 * Hook for immersive scroll-based narrative
 * Controls camera, objects, and scene transitions based on scroll progress
 */
export function useImmersiveScroll(options: UseImmersiveScrollOptions = {}) {
  const {
    trigger = 'body',
    start = 'top top',
    end = 'bottom bottom',
    scrub = 1,
    onUpdate,
    onSectionChange
  } = options;

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [currentSection, setCurrentSection] = useState<'hero' | 'about' | 'portfolio' | 'contact'>('hero');

  useEffect(() => {
    // Skip on mobile for performance
    if (window.innerWidth < 768) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger,
        start,
        end,
        scrub,
        onUpdate: (self) => {
          const progress = self.progress;
          onUpdate?.(progress);

          // Determine current section based on progress
          let newSection: 'hero' | 'about' | 'portfolio' | 'contact';
          if (progress < 0.25) {
            newSection = 'hero';
          } else if (progress < 0.5) {
            newSection = 'about';
          } else if (progress < 0.8) {
            newSection = 'portfolio';
          } else {
            newSection = 'contact';
          }

          // Call section change callback only when section changes
          if (newSection !== currentSection) {
            setCurrentSection(newSection);
            onSectionChange?.(newSection);
          }
        }
      }
    });

    timelineRef.current = timeline;

    return () => {
      timeline.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [trigger, start, end, scrub, onUpdate, onSectionChange, currentSection]);

  return { timeline: timelineRef, currentSection };
}

/**
 * Hook for smooth scroll-based camera movement
 * Creates cinematic camera transitions
 */
export function useCameraScroll(
  cameraPosition: { x: number; y: number; z: number },
  targetPosition: { x: number; y: number; z: number }
) {
  const cameraRef = useRef<{ x: number; y: number; z: number } | null>(null);

  useEffect(() => {
    if (window.innerWidth < 768) return;

    gsap.to(cameraPosition, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 1,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [cameraPosition, targetPosition]);

  return cameraRef;
}
