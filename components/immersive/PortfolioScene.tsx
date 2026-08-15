'use client';

import { useEffect, useRef } from 'react';
import { Scene3D } from '@/lib/three/Scene3D';
import { getPerformanceManager } from '@/lib/three/PerformanceManager';
import * as THREE from 'three';
import { glowVertexShader, glowFragmentShader } from '@/lib/three/shaders/GlowShader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface PortfolioSceneProps {
  scene: Scene3D;
  imageCount?: number;
}

export function PortfolioScene({ scene, imageCount = 8 }: PortfolioSceneProps) {
  const particlesRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const scene3D = scene.getScene();
    const performanceManager = getPerformanceManager();
    const isLowEnd = performanceManager.isLowEnd();
    const isMobile = window.innerWidth < 768;
    const pixelRatio = performanceManager.getPixelRatio();

    // Skip on low-end devices
    if (isLowEnd) return;

    // Adaptive particle count based on device
    const particleCount = isMobile ? 30 : 80;
    
    if (particleCount <= 0) return;

    // Create particle geometry for portfolio depth effect
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const alphas = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Distribute particles around portfolio area
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 3 + Math.random() * 8;
      const height = (Math.random() - 0.5) * 10;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 5;
      
      sizes[i] = 0.03 + Math.random() * 0.08;
      alphas[i] = 0.2 + Math.random() * 0.3;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

    // Create glow material for particles
    const glowMaterial = new THREE.ShaderMaterial({
      vertexShader: glowVertexShader,
      fragmentShader: glowFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x8b5cf6) },
        uSize: { value: 0.8 },
        uPixelRatio: { value: pixelRatio }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    materialRef.current = glowMaterial;

    const particles = new THREE.Points(particleGeometry, glowMaterial);
    particlesRef.current = particles;
    scene3D.add(particles);

    // Create GSAP timeline for portfolio scroll effects
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#portfolio',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          
          if (particlesRef.current) {
            // Particles expand and move as user scrolls through portfolio
            particlesRef.current.position.z = progress * -3;
            particlesRef.current.scale.setScalar(1 + progress * 0.5);
            particlesRef.current.rotation.y = progress * Math.PI * 0.2;
          }
          
          // Update shader uniforms
          if (materialRef.current) {
            materialRef.current.uniforms.uSize.value = 0.8 + progress * 0.4;
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
      
      // Gentle particle movement
      if (particlesRef.current && particlesRef.current.geometry.attributes.position) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;
          
          // Subtle floating motion
          positions[iy] += Math.sin(time + i) * 0.002;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
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
      
      if (particlesRef.current) {
        scene3D.remove(particlesRef.current);
        particlesRef.current.geometry.dispose();
        const material = particlesRef.current.material;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else {
          material.dispose();
        }
      }
      
      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, [scene, imageCount]);

  return null;
}
