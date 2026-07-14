'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseScrollAnimationOptions {
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  onUpdate?: (progress: number) => void;
}

/**
 * Hook for GSAP scroll-based animations
 * Integrates with 3D scene for cinematic scroll effects
 * WebXR ready: can be extended for controller-based navigation
 */
export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    trigger = 'body',
    start = 'top top',
    end = 'bottom bottom',
    scrub = true,
    pin = false,
    onUpdate
  } = options;

  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Skip on mobile for performance
    if (window.innerWidth < 768) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger,
        start,
        end,
        scrub,
        pin,
        onUpdate: (self) => {
          onUpdate?.(self.progress);
        }
      }
    });

    timelineRef.current = timeline;

    return () => {
      timeline.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [trigger, start, end, scrub, pin, onUpdate]);

  return timelineRef;
}

/**
 * Hook for parallax scroll effects
 * Creates depth perception through scroll-based movement
 */
export function useParallax(intensity: number = 0.5) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || window.innerWidth < 768) return;

    gsap.to(element, {
      y: (i, target) => -ScrollTrigger.maxScroll(window) * intensity,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [intensity]);

  return elementRef;
}

/**
 * Hook for scroll-triggered reveal animations
 * Elements fade in and move as they enter viewport
 */
export function useScrollReveal(threshold: number = 0.1) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.fromTo(element,
      {
        opacity: 0,
        y: 50
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: `top ${100 - threshold * 100}%`,
          toggleActions: 'play none none reverse'
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [threshold]);

  return elementRef;
}
