import { useEffect, useRef, useState } from 'react';

interface UseCounterOptions {
  end: number;
  duration?: number;
  start?: number;
  decimals?: number;
}

export function useCounter({ 
  end, 
  duration = 2000, 
  start = 0, 
  decimals = 0 
}: UseCounterOptions) {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutExpo
      const easeOutExpo = (x: number) => {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
      };

      const easedProgress = easeOutExpo(progress);
      const currentCount = start + (end - start) * easedProgress;
      
      setCount(Number(currentCount.toFixed(decimals)));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, start, end, duration, decimals]);

  return { count, ref };
}
