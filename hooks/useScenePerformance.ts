'use client';

import { useEffect, useState } from 'react';
import { getPerformanceManager } from '@/lib/three/PerformanceManager';

interface PerformanceLevel {
  level: 'high' | 'medium' | 'low';
  maxParticles: number;
  maxFilaments: number;
  enableShadows: boolean;
  enablePostProcessing: boolean;
  pixelRatio: number;
}

/**
 * Hook for adaptive 3D scene performance
 * Detects device capabilities and adjusts quality settings
 */
export function useScenePerformance() {
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>({
    level: 'high',
    maxParticles: 200,
    maxFilaments: 4,
    enableShadows: true,
    enablePostProcessing: true,
    pixelRatio: 2
  });

  useEffect(() => {
    const performanceManager = getPerformanceManager();
    const isLowEnd = performanceManager.isLowEnd();
    const isMobile = window.innerWidth < 768;
    const pixelRatio = performanceManager.getPixelRatio();

    let level: PerformanceLevel;

    if (isLowEnd) {
      level = {
        level: 'low',
        maxParticles: 0,
        maxFilaments: 0,
        enableShadows: false,
        enablePostProcessing: false,
        pixelRatio: 1
      };
    } else if (isMobile) {
      level = {
        level: 'medium',
        maxParticles: 50,
        maxFilaments: 2,
        enableShadows: false,
        enablePostProcessing: false,
        pixelRatio: Math.min(pixelRatio, 1.5)
      };
    } else {
      // Desktop - check for high-end
      const cores = navigator.hardwareConcurrency || 4;
      const isHighEnd = cores >= 8;
      
      level = {
        level: isHighEnd ? 'high' : 'medium',
        maxParticles: isHighEnd ? 200 : 100,
        maxFilaments: isHighEnd ? 4 : 2,
        enableShadows: true,
        enablePostProcessing: isHighEnd,
        pixelRatio: Math.min(pixelRatio, 2)
      };
    }

    // Use requestAnimationFrame to avoid setState during effect
    requestAnimationFrame(() => {
      setPerformanceLevel(level);
    });
  }, []);

  return performanceLevel;
}

/**
 * Hook for monitoring frame rate and adjusting quality dynamically
 */
export function useFrameRateMonitor() {
  const [fps, setFps] = useState(60);
  const [isStable, setIsStable] = useState(true);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setFps(currentFps);
        setIsStable(currentFps >= 30); // Consider stable if 30+ FPS
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return { fps, isStable };
}

/**
 * Hook for memory management in 3D scenes
 * Helps prevent memory leaks by tracking resource usage
 */
export function useMemoryManager() {
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    const checkMemory = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((performance as any).memory) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize;
        const total = memory.jsHeapSizeLimit;
        const percentage = (used / total) * 100;

        setMemoryUsage({ used, total, percentage });
      }
    };

    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const isMemoryCritical = memoryUsage && memoryUsage.percentage > 80;

  return { memoryUsage, isMemoryCritical };
}
