'use client';

import { useEffect, useRef } from 'react';
import { Scene3D } from '@/lib/three/Scene3D';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface CameraRigProps {
  scene: Scene3D;
}

export function CameraRig({ scene }: CameraRigProps) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const camera = scene.getCamera();
    const initialPosition = { x: 0, y: 0, z: 12 };
    const initialRotation = { x: 0, y: 0, z: 0 };

    // Reset camera to initial position
    camera.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
    camera.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);

    // Create scroll-controlled camera animation
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // Camera movement based on scroll progress
          // Hero (0-25%): Camera stays at initial position with slight parallax
          if (progress < 0.25) {
            camera.position.z = 12 - progress * 2; // Slight zoom in
          }
          // About (25-50%): Camera moves closer and rotates
          else if (progress < 0.5) {
            const localProgress = (progress - 0.25) / 0.25;
            camera.position.z = 10 - localProgress * 3; // Zoom in more
            camera.position.y = localProgress * 1; // Slight upward movement
          }
          // Portfolio (50-80%): Camera moves through gallery
          else if (progress < 0.8) {
            const localProgress = (progress - 0.5) / 0.3;
            camera.position.z = 7 - localProgress * 2; // Continue zoom
            camera.position.y = 1 + localProgress * 0.5; // Continue upward
            camera.position.x = localProgress * 0.5; // Slight right movement
          }
          // Contact (80-100%): Camera focuses on CTA
          else {
            const localProgress = (progress - 0.8) / 0.2;
            camera.position.z = 5 - localProgress * 1; // Final zoom
            camera.position.y = 1.5 + localProgress * 0.5; // Final upward
            camera.position.x = 0.5 - localProgress * 0.5; // Return to center
          }

          camera.lookAt(0, 0, 0);
        }
      }
    });

    timelineRef.current = timeline;

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [scene]);

  return null;
}
