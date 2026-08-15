'use client';

import { useEffect, useRef, useState } from 'react';
import { Scene3D } from '@/lib/three/Scene3D';
import { getPerformanceManager } from '@/lib/three/PerformanceManager';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import * as THREE from 'three';
import { inkVertexShader, inkFragmentShader } from '@/lib/three/shaders/InkShader';
import { glowVertexShader, glowFragmentShader } from '@/lib/three/shaders/GlowShader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Hero3DProps {
  className?: string;
}

export function Hero3D({ className }: Hero3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene3D | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Register GSAP ScrollTrigger
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);
  
  // Animation refs
  const needleRef = useRef<THREE.Group | null>(null);
  const filamentsRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const inkMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const glowMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const gsapTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Check for mobile and reduced motion preferences
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    checkMobile();
    
    // Use requestAnimationFrame to avoid setState during effect
    requestAnimationFrame(() => {
      setPrefersReducedMotion(mediaQuery.matches);
    });
    
    const handleResize = () => checkMobile();
    const handleMotionChange = (e: MediaQueryListEvent) => {
      requestAnimationFrame(() => {
        setPrefersReducedMotion(e.matches);
      });
    };
    
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
      requestAnimationFrame(() => {
        setIsLoading(false);
        setIsLoaded(true);
      });
      return;
    }

    // Check WebGL support using performance manager
    const performanceManager = getPerformanceManager();
    if (!performanceManager.isWebGLAvailable()) {
      console.warn('WebGL not supported');
      requestAnimationFrame(() => {
        setHasError(true);
        setIsLoading(false);
        setIsLoaded(true);
      });
      return;
    }

    try {
      requestAnimationFrame(() => {
        setIsLoading(true);
      });
      
      // Simulate loading delay for smoother experience
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      const scene = new Scene3D(canvas);
      sceneRef.current = scene;
      scene.init();

      // Get performance manager for adaptive quality
      const performanceManager = getPerformanceManager();
      const isLowEnd = performanceManager.isLowEnd();
      const pixelRatio = performanceManager.getPixelRatio();

      // Setup camera with FOV 45 and position (0, 0, 12)
      const camera = scene.getCamera();
      camera.fov = 45;
      camera.position.set(0, 0, 12);
      camera.updateProjectionMatrix();

      // Cinematic lighting setup
      const scene3D = scene.getScene();
      
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

      // Create stylized needle
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

      // Create ink filaments (only if not low-end)
      const filamentCount = isLowEnd ? 0 : (isMobile ? 2 : 4);
      const filamentsGroup = new THREE.Group();
      filamentsRef.current = filamentsGroup;

      if (filamentCount > 0) {
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
        inkMaterialRef.current = inkMaterial;

        for (let i = 0; i < filamentCount; i++) {
          // Create curved path for filament
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-8, (i - filamentCount / 2) * 2, -2),
            new THREE.Vector3(-4, (i - filamentCount / 2) * 2 + Math.sin(i) * 1, -1),
            new THREE.Vector3(0, (i - filamentCount / 2) * 2 + Math.cos(i) * 1, 0),
            new THREE.Vector3(4, (i - filamentCount / 2) * 2, 1),
            new THREE.Vector3(8, (i - filamentCount / 2) * 2, 2)
          ]);

          const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.02, 8, false);
          const filament = new THREE.Mesh(tubeGeometry, inkMaterial);
          filamentsGroup.add(filament);
        }

        scene3D.add(filamentsGroup);
      }

      // Create particles (adaptive count based on device)
      const particleCount = isLowEnd ? 0 : (isMobile ? 50 : 200);
      
      if (particleCount > 0) {
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const alphas = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
          // Controlled distribution around the needle
          const angle = Math.random() * Math.PI * 2;
          const radius = 2 + Math.random() * 6;
          const height = (Math.random() - 0.5) * 8;
          
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] = height;
          positions[i * 3 + 2] = Math.sin(angle) * radius - 2;
          
          sizes[i] = 0.05 + Math.random() * 0.1;
          alphas[i] = 0.3 + Math.random() * 0.4;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        particleGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

        const glowMaterial = new THREE.ShaderMaterial({
          vertexShader: glowVertexShader,
          fragmentShader: glowFragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0x8b5cf6) },
            uSize: { value: 1.0 },
            uPixelRatio: { value: pixelRatio }
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        glowMaterialRef.current = glowMaterial;

        const particles = new THREE.Points(particleGeometry, glowMaterial);
        particlesRef.current = particles;
        scene3D.add(particles);
      }

      // Mouse interaction variables
      let mouseX = 0;
      let mouseY = 0;
      let targetRotationX = 0;
      let targetRotationY = 0;
      let currentRotationX = 0;
      let currentRotationY = 0;
      let targetRotationZ = 0;
      let currentRotationZ = 0;
      let scrollProgress = 0;

      const handleMouseMove = (e: MouseEvent) => {
        if (prefersReducedMotion) return;
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };

      const handleScroll = () => {
        if (prefersReducedMotion) return;
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        scrollProgress = Math.min(scrollY / windowHeight, 1);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('scroll', handleScroll);

      // Create GSAP timeline for scroll-linked narrative
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: canvas,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            
            // Update shader uniforms with GSAP progress
            if (inkMaterialRef.current) {
              inkMaterialRef.current.uniforms.uScrollProgress.value = progress;
            }
            
            // Direct transformation based on scroll progress (more efficient than gsap.to)
            if (needleRef.current) {
              needleRef.current.rotation.z = progress * Math.PI;
              needleRef.current.position.z = progress * -5;
              needleRef.current.position.y = progress * 2;
              needleRef.current.scale.setScalar(1.5 - progress * 0.5);
            }
            
            // Filaments transform and fade
            if (filamentsRef.current) {
              filamentsRef.current.position.z = progress * -3;
              filamentsRef.current.scale.setScalar(1 - progress * 0.3);
            }
            
            // Particles transition towards portfolio
            if (particlesRef.current) {
              particlesRef.current.position.z = progress * -2;
              particlesRef.current.scale.setScalar(1 + progress * 0.5);
            }
          }
        }
      });
      
      gsapTimelineRef.current = timeline;

      // Animation loop
      let time = 0;
      let lastTime = performance.now();
      
      scene.start(() => {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        time += deltaTime;

        if (!prefersReducedMotion) {
          // Mouse interaction with damping (very slow: factor 0.05)
          targetRotationX = mouseY * 0.26; // 15 degrees in radians
          targetRotationY = mouseX * 0.26;
          currentRotationX += (targetRotationX - currentRotationX) * 0.05;
          currentRotationY += (targetRotationY - currentRotationY) * 0.05;

          // Scroll rotation with damping (factor 0.03)
          targetRotationZ = scrollProgress * Math.PI; // 0-180 degrees
          currentRotationZ += (targetRotationZ - currentRotationZ) * 0.03;

          // Apply rotations to needle
          if (needleRef.current) {
            needleRef.current.rotation.x = currentRotationX;
            needleRef.current.rotation.y = currentRotationY;
            needleRef.current.rotation.z = currentRotationZ;
          }

          // Camera parallax (limited to ±0.5)
          const camera = scene.getCamera();
          camera.position.x = mouseX * 0.5;
          camera.position.y = mouseY * 0.5;
          camera.lookAt(0, 0, 0);

          // Update shader uniforms
          if (inkMaterialRef.current) {
            inkMaterialRef.current.uniforms.uTime.value = time;
            inkMaterialRef.current.uniforms.uScrollProgress.value = scrollProgress;
          }

          if (glowMaterialRef.current) {
            glowMaterialRef.current.uniforms.uTime.value = time;
          }

          // Gentle particle attraction towards needle
          if (particlesRef.current && particlesRef.current.geometry.attributes.position) {
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < particleCount; i++) {
              const ix = i * 3;
              const iy = i * 3 + 1;
              const iz = i * 3 + 2;
              
              // Slight attraction towards center
              positions[ix] += (0 - positions[ix]) * 0.001 * deltaTime;
              positions[iy] += (0 - positions[iy]) * 0.001 * deltaTime;
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
          }
        }
      });

      clearTimeout(loadingTimeout);
      requestAnimationFrame(() => {
        setIsLoading(false);
        setIsLoaded(true);
      });

      // Cleanup
      return () => {
        clearTimeout(loadingTimeout);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
        
        // Kill GSAP timeline
        if (gsapTimelineRef.current) {
          gsapTimelineRef.current.kill();
        }
        
        scene.dispose();
      };
    } catch (error) {
      console.error('Error initializing 3D scene:', error);
      requestAnimationFrame(() => {
        setHasError(true);
        setIsLoading(false);
        setIsLoaded(true);
      });
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
    <div className={`absolute inset-0 w-full h-full ${className || ''}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <LoadingSpinner size="lg" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          opacity: isLoaded && !isLoading ? 1 : 0,
          transition: 'opacity 0.5s ease-out'
        }}
        aria-label="Scena 3D interattiva con ago stilizzato e filamenti d'inchiostro"
        role="img"
      />
    </div>
  );
}
