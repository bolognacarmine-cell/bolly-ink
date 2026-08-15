'use client';

import { useEffect, useRef } from 'react';
import { Scene3D } from '@/lib/three/Scene3D';
import { getPerformanceManager } from '@/lib/three/PerformanceManager';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface NeedleObjectProps {
  scene: Scene3D;
}

export function NeedleObject({ scene }: NeedleObjectProps) {
  const needleRef = useRef<THREE.Group | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const scene3D = scene.getScene();
    const performanceManager = getPerformanceManager();
    const isLowEnd = performanceManager.isLowEnd();

    // Create stylized needle group
    const needleGroup = new THREE.Group();
    needleRef.current = needleGroup;

    // Needle body (cylinder)
    const needleBodyGeometry = new THREE.CylinderGeometry(0.075, 0.075, 6, 32);
    const needleBodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.3,
      envMapIntensity: 1.2
    });
    const needleBody = new THREE.Mesh(needleBodyGeometry, needleBodyMaterial);
    needleBody.rotation.z = Math.PI / 2;
    needleBody.position.x = 1;
    needleGroup.add(needleBody);

    // Needle tip (cone)
    const needleTipGeometry = new THREE.ConeGeometry(0.075, 1.5, 32);
    const needleTipMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      metalness: 0.9,
      roughness: 0.2
    });
    const needleTip = new THREE.Mesh(needleTipGeometry, needleTipMaterial);
    needleTip.rotation.z = -Math.PI / 2;
    needleTip.position.x = -1.75;
    needleGroup.add(needleTip);

    // Needle grip (wider back part)
    const gripGeometry = new THREE.CylinderGeometry(0.125, 0.125, 2, 32);
    const gripMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f0f1a,
      metalness: 0.6,
      roughness: 0.5
    });
    const grip = new THREE.Mesh(gripGeometry, gripMaterial);
    grip.rotation.z = Math.PI / 2;
    grip.position.x = 4;
    needleGroup.add(grip);

    // Small metal detail between body and grip
    const detailGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32);
    const detailMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      metalness: 0.9,
      roughness: 0.2
    });
    const detail = new THREE.Mesh(detailGeometry, detailMaterial);
    detail.rotation.z = Math.PI / 2;
    detail.position.x = 2.1;
    needleGroup.add(detail);

    // Scale the needle for visibility (35-50% of visual area)
    needleGroup.scale.set(2.5, 2.5, 2.5);
    scene3D.add(needleGroup);

    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Create GSAP timeline for scroll-linked needle animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          
          if (needleRef.current) {
            // Hero (0-25%): Needle rotates slowly
            if (progress < 0.25) {
              needleRef.current.rotation.z = progress * Math.PI * 0.5;
              needleRef.current.position.z = progress * -2;
            }
            // About (25-50%): Needle rotates 90° and moves laterally
            else if (progress < 0.5) {
              const localProgress = (progress - 0.25) / 0.25;
              needleRef.current.rotation.z = Math.PI * 0.5 + localProgress * Math.PI * 0.5;
              needleRef.current.position.z = -2 + localProgress * -3;
              needleRef.current.position.x = localProgress * 3;
              needleRef.current.position.y = localProgress * 2;
            }
            // Portfolio (50-80%): Needle fades and moves away
            else if (progress < 0.8) {
              const localProgress = (progress - 0.5) / 0.3;
              needleRef.current.rotation.z = Math.PI + localProgress * Math.PI * 0.5;
              needleRef.current.position.z = -5 + localProgress * -5;
              needleRef.current.position.x = 3 + localProgress * 5;
              needleRef.current.position.y = 2 + localProgress * 3;
              needleRef.current.scale.setScalar(2.5 - localProgress * 1.5);
            }
            // Contact (80-100%): Needle completely fades out
            else {
              const localProgress = (progress - 0.8) / 0.2;
              needleRef.current.scale.setScalar(1 - localProgress);
            }
          }
        }
      }
    });

    timelineRef.current = timeline;

    // Animation loop for mouse interaction
    let animationFrameId: number | null = null;
    
    const animate = () => {
      if (needleRef.current) {
        // Mouse interaction with damping (very slow: factor 0.05)
        targetRotationX = mouseY * 0.26; // 15 degrees in radians
        targetRotationY = mouseX * 0.26;
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;

        // Apply mouse rotations to needle
        needleRef.current.rotation.x = currentRotationX;
        needleRef.current.rotation.y = currentRotationY;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      
      ScrollTrigger.getAll().forEach(t => t.kill());
      
      if (needleRef.current) {
        scene3D.remove(needleRef.current);
        needleRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      }
    };
  }, [scene]);

  return null;
}
