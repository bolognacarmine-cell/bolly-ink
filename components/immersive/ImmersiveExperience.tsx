'use client';

import { useEffect, useRef, useState } from 'react';
import { Scene3D } from '@/lib/three/Scene3D';
import { getPerformanceManager } from '@/lib/three/PerformanceManager';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CameraRig } from './CameraRig';
import { NeedleObject } from './NeedleObject';
import { InkTrail } from './InkTrail';
import { SceneLighting } from './SceneLighting';
import { SceneFallback } from './SceneFallback';
import { SceneLoader } from './SceneLoader';
import * as THREE from 'three';

interface ImmersiveExperienceProps {
  className?: string;
}

export function ImmersiveExperience({ className }: ImmersiveExperienceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene3D | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    checkMobile();
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleResize = () => checkMobile();
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    
    window.addEventListener('resize', handleResize);
    mediaQuery.addEventListener('change', handleMotionChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip 3D on mobile or if reduced motion is preferred
    if (isMobile || prefersReducedMotion) {
      setIsLoading(false);
      setIsLoaded(true);
      return;
    }

    // Check WebGL support
    const performanceManager = getPerformanceManager();
    if (!performanceManager.isWebGLAvailable()) {
      console.warn('WebGL not supported');
      setHasError(true);
      setIsLoading(false);
      setIsLoaded(true);
      return;
    }

    try {
      setIsLoading(true);
      
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      const scene = new Scene3D(canvas);
      sceneRef.current = scene;
      scene.init();

      clearTimeout(loadingTimeout);
      setIsLoading(false);
      setIsLoaded(true);

      return () => {
        clearTimeout(loadingTimeout);
        scene.dispose();
      };
    } catch (error) {
      console.error('Error initializing immersive experience:', error);
      setHasError(true);
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, [isMobile, prefersReducedMotion]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      sceneRef.current?.onResize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (hasError) {
    return <SceneFallback />;
  }

  return (
    <div className={`absolute inset-0 w-full h-full ${className || ''}`}>
      {isLoading && <SceneLoader />}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          opacity: isLoaded && !isLoading ? 1 : 0,
          transition: 'opacity 0.5s ease-out'
        }}
        aria-label="Esperienza 3D immersiva: ago, inchiostro e portfolio"
        role="img"
      />
      {isLoaded && !isLoading && sceneRef.current && (
        <>
          <CameraRig scene={sceneRef.current} />
          <SceneLighting scene={sceneRef.current} />
          <NeedleObject scene={sceneRef.current} />
          <InkTrail scene={sceneRef.current} />
        </>
      )}
    </div>
  );
}
