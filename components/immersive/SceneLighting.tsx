'use client';

import { useEffect } from 'react';
import { Scene3D } from '@/lib/three/Scene3D';
import { getPerformanceManager } from '@/lib/three/PerformanceManager';
import * as THREE from 'three';

interface SceneLightingProps {
  scene: Scene3D;
}

export function SceneLighting({ scene }: SceneLightingProps) {
  useEffect(() => {
    const scene3D = scene.getScene();
    const performanceManager = getPerformanceManager();
    const isLowEnd = performanceManager.isLowEnd();

    // Key light (warm white, creates shadows and metallic reflections)
    const keyLight = new THREE.SpotLight(0xfff5e6, 2.0);
    keyLight.position.set(5, 5, 8);
    keyLight.angle = Math.PI / 4;
    keyLight.penumbra = 0.3;
    keyLight.castShadow = !isLowEnd;
    scene3D.add(keyLight);

    // Fill light (cool blue, fills shadows with artistic tone)
    const fillLight = new THREE.PointLight(0xe6e6ff, 0.8);
    fillLight.position.set(-3, 2, 5);
    scene3D.add(fillLight);

    // Rim light (neutral white, creates edge separation)
    const rimLight = new THREE.SpotLight(0xffffff, 1.5);
    rimLight.position.set(0, -2, -5);
    scene3D.add(rimLight);

    // Ambient light (dark gray, base illumination)
    const ambientLight = new THREE.AmbientLight(0x1a1a1a, 0.2);
    scene3D.add(ambientLight);

    // Fog for depth (FogExp2 with density 0.02)
    scene3D.fog = new THREE.FogExp2(0x070707, 0.02);

    return () => {
      scene3D.remove(keyLight);
      scene3D.remove(fillLight);
      scene3D.remove(rimLight);
      scene3D.remove(ambientLight);
      
      keyLight.dispose();
      fillLight.dispose();
      rimLight.dispose();
      ambientLight.dispose();
    };
  }, [scene]);

  return null;
}
