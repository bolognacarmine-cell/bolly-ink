'use client';

import { useEffect, useRef, useState } from 'react';
import { Scene3D } from '@/lib/three/Scene3D';
import { performanceManager } from '@/lib/three/PerformanceManager';
import * as THREE from 'three';
import { atmosphereVertexShader, atmosphereFragmentShader } from '@/lib/three/shaders/AtmosphereShader';
import gsap from 'gsap';

interface Hero3DProps {
  className?: string;
}

export function Hero3D({ className }: Hero3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene3D | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for mobile and reduced motion preferences
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
      setIsLoaded(true);
      return;
    }

    // Check WebGL support using performance manager
    if (!performanceManager.isWebGLAvailable()) {
      console.warn('WebGL not supported');
      setIsLoaded(true);
      return;
    }

    try {
      const scene = new Scene3D(canvas);
      sceneRef.current = scene;
      scene.init();

      // Create atmospheric plane with shader
      const atmosphereGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
      const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColor1: { value: new THREE.Color(0x1a1a2e) },
          uColor2: { value: new THREE.Color(0x16213e) },
          uDistortion: { value: 0.3 },
          uOpacity: { value: 0.6 }
        },
        transparent: true,
        side: THREE.DoubleSide
      });

      const atmospherePlane = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      atmospherePlane.position.z = -5;
      scene.addObject('atmosphere', atmospherePlane);

      // Create floating geometric shapes (coherent with tattoo studio aesthetic)
      // Abstract, dark, elegant forms
      const shapes: THREE.Mesh[] = [];
      
      // Main floating torus (represents continuity/flow)
      const torusGeometry = new THREE.TorusGeometry(2, 0.3, 16, 100);
      const torusMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d2d44,
        metalness: 0.3,
        roughness: 0.7
      });
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torus.position.set(3, 1, -2);
      torus.rotation.x = Math.PI / 4;
      scene.addObject('torus', torus);
      shapes.push(torus);

      // Secondary floating icosahedron (represents precision/geometry)
      const icoGeometry = new THREE.IcosahedronGeometry(0.8, 0);
      const icoMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d3d5c,
        metalness: 0.4,
        roughness: 0.6
      });
      const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
      icosahedron.position.set(-2, -1, -1);
      scene.addObject('icosahedron', icosahedron);
      shapes.push(icosahedron);

      // Floating particles (subtle atmosphere)
      const particleCount = 100;
      const particleGeometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const alphas = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
        sizes[i] = Math.random() * 0.1 + 0.05;
        alphas[i] = Math.random() * 0.5 + 0.2;
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      particleGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

      const particleMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          attribute float aSize;
          attribute float aAlpha;
          varying float vAlpha;
          void main() {
            vAlpha = aAlpha;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying float vAlpha;
          uniform vec3 uColor;
          void main() {
            vec2 center = gl_PointCoord - 0.5;
            float dist = length(center);
            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            gl_FragColor = vec4(uColor, alpha * vAlpha);
          }
        `,
        uniforms: {
          uColor: { value: new THREE.Color(0x6b7280) }
        },
        transparent: true,
        blending: THREE.AdditiveBlending
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.addObject('particles', particles);

      // Mouse parallax effect
      let mouseX = 0;
      let mouseY = 0;
      const targetX = 0;
      const targetY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };

      window.addEventListener('mousemove', handleMouseMove);

      // Animation loop
      let time = 0;
      scene.start(() => {
        time += 0.01;

        // Update shader uniforms
        if (atmosphereMaterial.uniforms) {
          atmosphereMaterial.uniforms.uTime.value = time;
        }

        // Animate shapes with subtle rotation
        shapes.forEach((shape, index) => {
          shape.rotation.x += 0.002 * (index + 1);
          shape.rotation.y += 0.003 * (index + 1);
        });

        // Subtle camera drift
        const camera = scene.getCamera();
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
        camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, -2);
      });

      setIsLoaded(true);

      // Cleanup
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        scene.dispose();
      };
    } catch (error) {
      console.error('Error initializing 3D scene:', error);
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

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className || ''}`}
      style={{ 
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease-out'
      }}
    />
  );
}
