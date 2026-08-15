'use client';

import { useEffect, useRef } from 'react';
import { Scene3D } from '@/lib/three/Scene3D';
import { getPerformanceManager } from '@/lib/three/PerformanceManager';
import * as THREE from 'three';
import { inkVertexShader, inkFragmentShader } from '@/lib/three/shaders/InkShader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface InkTrailProps {
  scene: Scene3D;
}

export function InkTrail({ scene }: InkTrailProps) {
  const trailRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const scene3D = scene.getScene();
    const performanceManager = getPerformanceManager();
    const isLowEnd = performanceManager.isLowEnd();
    const isMobile = window.innerWidth < 768;

    // Skip on low-end devices
    if (isLowEnd) return;

    // Create ink trail group
    const trailGroup = new THREE.Group();
    trailRef.current = trailGroup;

    // Number of trail segments based on device
    const trailCount = isMobile ? 3 : 6;

    // Create ink shader material
    const inkMaterial = new THREE.ShaderMaterial({
      vertexShader: inkVertexShader,
      fragmentShader: inkFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x1a1a2e) },
        uDistortion: { value: 0.3 },
        uOpacity: { value: 0.7 },
        uScrollProgress: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending
    });
    materialRef.current = inkMaterial;

    // Create trail segments using TubeGeometry
    for (let i = 0; i < trailCount; i++) {
      // Create curved path for trail segment
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10 + i * 3, (i - trailCount / 2) * 1.5, -2),
        new THREE.Vector3(-6 + i * 3, (i - trailCount / 2) * 1.5 + Math.sin(i) * 0.5, -1),
        new THREE.Vector3(-2 + i * 3, (i - trailCount / 2) * 1.5 + Math.cos(i) * 0.5, 0),
        new THREE.Vector3(2 + i * 3, (i - trailCount / 2) * 1.5, 1),
        new THREE.Vector3(6 + i * 3, (i - trailCount / 2) * 1.5, 2)
      ]);

      const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.03, 8, false);
      const trailSegment = new THREE.Mesh(tubeGeometry, inkMaterial);
      trailGroup.add(trailSegment);
    }

    scene3D.add(trailGroup);

    // Create GSAP timeline for scroll-linked trail animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // Update shader uniform
          if (materialRef.current) {
            materialRef.current.uniforms.uScrollProgress.value = progress;
          }
          
          if (trailRef.current) {
            // Hero (0-25%): Trails gently wave
            if (progress < 0.25) {
              trailRef.current.position.z = progress * -1;
              trailRef.current.scale.setScalar(1);
            }
            // About (25-50%): Trails transform into ink stroke
            else if (progress < 0.5) {
              const localProgress = (progress - 0.25) / 0.25;
              trailRef.current.position.z = -1 + localProgress * -2;
              trailRef.current.position.y = localProgress * 1;
              trailRef.current.scale.setScalar(1 + localProgress * 0.3);
            }
            // Portfolio (50-80%): Trails guide towards portfolio
            else if (progress < 0.8) {
              const localProgress = (progress - 0.5) / 0.3;
              trailRef.current.position.z = -3 + localProgress * -2;
              trailRef.current.position.y = 1 + localProgress * 2;
              trailRef.current.position.x = localProgress * 2;
              trailRef.current.scale.setScalar(1.3 - localProgress * 0.3);
            }
            // Contact (80-100%): Trails converge to CTA
            else {
              const localProgress = (progress - 0.8) / 0.2;
              trailRef.current.position.z = -5 + localProgress * -1;
              trailRef.current.position.y = 3 + localProgress * 1;
              trailRef.current.position.x = 2 - localProgress * 2;
              trailRef.current.scale.setScalar(1 - localProgress * 0.5);
            }
          }
        }
      }
    });

    timelineRef.current = timeline;

    // Animation loop for shader time uniform
    let animationFrameId: number | null = null;
    let time = 0;
    
    const animate = () => {
      time += 0.016;
      
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = time;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      
      ScrollTrigger.getAll().forEach(t => t.kill());
      
      if (trailRef.current) {
        scene3D.remove(trailRef.current);
        trailRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            child.material?.dispose();
          }
        });
      }
      
      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, [scene]);

  return null;
}
