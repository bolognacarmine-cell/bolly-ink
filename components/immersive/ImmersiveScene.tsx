'use client';

import { useRef, useMemo, useEffect, useState, Suspense, Component, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { PALETTE, LIGHTING, NEEDLE, INK, PARTICLES, FOG } from '@/lib/three/constants';
import { useScenePerformance } from '@/hooks/useScenePerformance';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { inkVertexShader, inkFragmentShader } from '@/lib/three/shaders/InkShader';
import { glowVertexShader, glowFragmentShader } from '@/lib/three/shaders/GlowShader';
import { SceneLoader } from './SceneLoader';
import { SceneFallback } from './SceneFallback';

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    if (typeof window !== 'undefined') {
      console.error('[ImmersiveScene] 3D rendering error caught:', error);
    }
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function Needle({ scrollProgress = 0, mouseX = 0, mouseY = 0, reducedMotion = false }: { scrollProgress?: number; mouseX?: number; mouseY?: number; reducedMotion?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const rotX = useRef(0);
  const rotY = useRef(0);
  const rotZ = useRef(0);
  const loggedOnce = useRef(false);

  useFrame(() => {
    if (!groupRef.current) return;
    if (!loggedOnce.current && typeof window !== 'undefined') {
      console.debug('[Needle] Needle mesh mounted in 3D scene. Initial position visible.');
      loggedOnce.current = true;
    }
    if (reducedMotion) {
      groupRef.current.rotation.set(0, 0, 0);
      groupRef.current.position.set(0, 0, 0);
      groupRef.current.scale.setScalar(NEEDLE.scale);
      return;
    }

    const targetRotX = -mouseY * 0.26;
    const targetRotY = mouseX * 0.26;
    const targetRotZ = scrollProgress * Math.PI;

    rotX.current += (targetRotX - rotX.current) * 0.05;
    rotY.current += (targetRotY - rotY.current) * 0.05;
    rotZ.current += (targetRotZ - rotZ.current) * 0.03;

    groupRef.current.rotation.x = rotX.current;
    groupRef.current.rotation.y = rotY.current;
    groupRef.current.rotation.z = rotZ.current;

    const zOffset = scrollProgress * -5;
    const yOffset = scrollProgress * 2;
    const scale = 1.5 - scrollProgress * 0.5;

    groupRef.current.position.z = zOffset;
    groupRef.current.position.y = yOffset;
    groupRef.current.scale.setScalar(NEEDLE.scale * scale);
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[1, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 6, 32]} />
        <meshStandardMaterial
          color={NEEDLE.body.color}
          emissive={NEEDLE.body.emissive}
          emissiveIntensity={NEEDLE.body.emissiveIntensity}
          metalness={NEEDLE.body.metalness}
          roughness={NEEDLE.body.roughness}
          envMapIntensity={NEEDLE.body.envMapIntensity}
        />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[-1.75, 0, 0]}>
        <coneGeometry args={[0.075, 1.5, 32]} />
        <meshStandardMaterial
          color={NEEDLE.tip.color}
          emissive={NEEDLE.tip.emissive}
          emissiveIntensity={NEEDLE.tip.emissiveIntensity + 0.3}
          metalness={NEEDLE.tip.metalness}
          roughness={NEEDLE.tip.roughness}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[4, 0, 0]}>
        <cylinderGeometry args={[0.125, 0.125, 2, 32]} />
        <meshStandardMaterial
          color={NEEDLE.grip.color}
          emissive={NEEDLE.grip.emissive}
          emissiveIntensity={NEEDLE.grip.emissiveIntensity}
          metalness={NEEDLE.grip.metalness}
          roughness={NEEDLE.grip.roughness}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[2.1, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 32]} />
        <meshStandardMaterial
          color={NEEDLE.detail.color}
          emissive={NEEDLE.detail.emissive}
          emissiveIntensity={NEEDLE.detail.emissiveIntensity + 0.25}
          metalness={NEEDLE.detail.metalness}
          roughness={NEEDLE.detail.roughness}
        />
      </mesh>
      {/* Big bright pivot sphere as visual anchor — guarantees something visible */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color={0xa78bfa}
          emissive={0x8b5cf6}
          emissiveIntensity={1.6}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

function InkFilaments({ count = 4, scrollProgress = 0, reducedMotion = false }: { count?: number; scrollProgress?: number; reducedMotion?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(INK.filament.color) },
    uEmissive: { value: new THREE.Color(INK.filament.emissive) },
    uEmissiveIntensity: { value: INK.filament.emissiveIntensity },
    uDistortion: { value: INK.filament.distortion },
    uOpacity: { value: INK.filament.opacity },
    uScrollProgress: { value: 0 },
  }), []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    timeRef.current += delta;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = timeRef.current;
      materialRef.current.uniforms.uScrollProgress.value = scrollProgress;
    }
    if (groupRef.current) {
      groupRef.current.position.z = scrollProgress * -3;
      groupRef.current.scale.setScalar(1 - scrollProgress * 0.3);
    }
  });

  if (count === 0) return null;

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const yBase = (i - count / 2) * 2 + (Math.sin(i * 0.9) + Math.cos(i * 0.7)) * 1.1;
        const zRot = (Math.sin(i * 0.4) + Math.cos(i * 0.6)) * 0.06;
        return (
          <mesh
            key={i}
            position={[0, yBase, (i / count - 0.5) * 2]}
            rotation={[0, 0, Math.PI / 2 + zRot]}
          >
            <cylinderGeometry args={[0.022, 0.022, 20, 8, 1, false]} />
            <shaderMaterial
              ref={i === 0 ? materialRef : undefined}
              vertexShader={inkVertexShader}
              fragmentShader={inkFragmentShader}
              uniforms={uniforms}
              transparent
              side={THREE.DoubleSide}
              blending={THREE.NormalBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function GlowParticles({ count = 200, scrollProgress = 0, reducedMotion = false, pixelRatio = 1 }: { count?: number; scrollProgress?: number; reducedMotion?: boolean; pixelRatio?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 6;
      const height = (Math.random() - 0.5) * 8;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 2;
      sizes[i] = 0.1 + Math.random() * 0.18;
      alphas[i] = 0.55 + Math.random() * 0.45;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    return geom;
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(PARTICLES.color) },
    uSize: { value: 1.2 },
    uPixelRatio: { value: pixelRatio },
  }), [pixelRatio]);

  useFrame((state, delta) => {
    if (reducedMotion || !pointsRef.current) return;
    timeRef.current += delta;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = timeRef.current;
    }
    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    if (posAttr) {
      const pos = posAttr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const iy = i * 3 + 1;
        pos[iy] += Math.sin(timeRef.current + i) * 0.001 * delta * 60;
      }
      posAttr.needsUpdate = true;
    }
    pointsRef.current.position.z = scrollProgress * -2;
    pointsRef.current.scale.setScalar(1 + scrollProgress * 0.5);
  });

  if (count === 0) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={glowVertexShader}
        fragmentShader={glowFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function SceneCamera({ mouseX = 0, mouseY = 0, scrollProgress = 0, reducedMotion = false }: { mouseX?: number; mouseY?: number; scrollProgress?: number; reducedMotion?: boolean }) {
  const { camera } = useThree();
  const posX = useRef(0);
  const posY = useRef(0);
  const loggedOnce = useRef(false);

  useFrame(() => {
    if (!loggedOnce.current && typeof window !== 'undefined') {
      console.debug('[SceneCamera] Camera active. Initial pos:', camera.position.toArray());
      loggedOnce.current = true;
    }
    if (reducedMotion) {
      camera.position.set(0, 0, 12);
      camera.lookAt(0, 0, 0);
      return;
    }

    const targetX = mouseX * 0.5;
    const targetY = mouseY * 0.5;
    posX.current += (targetX - posX.current) * 0.05;
    posY.current += (targetY - posY.current) * 0.05;

    let zTarget = 12;
    let yTarget = 0;
    if (scrollProgress < 0.25) {
      zTarget = 12 - scrollProgress * 2;
    } else if (scrollProgress < 0.5) {
      const lp = (scrollProgress - 0.25) / 0.25;
      zTarget = 10 - lp * 3;
      yTarget = lp * 1;
    } else if (scrollProgress < 0.8) {
      const lp = (scrollProgress - 0.5) / 0.3;
      zTarget = 7 - lp * 2;
      yTarget = 1 + lp * 0.5;
    } else {
      const lp = (scrollProgress - 0.8) / 0.2;
      zTarget = 5 - lp;
      yTarget = 1.5 + lp * 0.5;
    }

    camera.position.set(posX.current, posY.current + yTarget, zTarget);
    camera.lookAt(0, yTarget * 0.3, 0);
  });

  return null;
}

function SceneLightingRig({ enableShadows = true }: { enableShadows?: boolean }) {
  return (
    <>
      <ambientLight color={LIGHTING.ambient.color} intensity={LIGHTING.ambient.intensity + 0.25} />
      <directionalLight
        color={0xffffff}
        intensity={2.4}
        position={[4, 6, 6]}
        castShadow={enableShadows}
      />
      <spotLight
        color={LIGHTING.key.color}
        intensity={LIGHTING.key.intensity}
        position={LIGHTING.key.position as [number, number, number]}
        angle={LIGHTING.key.angle}
        penumbra={LIGHTING.key.penumbra}
        castShadow={enableShadows}
      />
      <pointLight
        color={LIGHTING.fill.color}
        intensity={LIGHTING.fill.intensity + 0.5}
        position={LIGHTING.fill.position as [number, number, number]}
      />
      <spotLight
        color={LIGHTING.rim.color}
        intensity={LIGHTING.rim.intensity}
        position={LIGHTING.rim.position as [number, number, number]}
      />
      <pointLight
        color={LIGHTING.accentPoint.color}
        intensity={LIGHTING.accentPoint.intensity + 0.8}
        position={LIGHTING.accentPoint.position as [number, number, number]}
      />
      <pointLight
        color={0xe7c376}
        intensity={1.2}
        position={[-3, -1, 3]}
      />
      <fogExp2 attach="fog" args={[FOG.color, FOG.density]} />
    </>
  );
}

function SceneContents({
  perf,
  reducedMotion,
  mouseX,
  mouseY,
  scrollProgress,
}: {
  perf: ReturnType<typeof useScenePerformance>;
  reducedMotion: boolean;
  mouseX: number;
  mouseY: number;
  scrollProgress: number;
}) {
  // SEMPRE rendiamo tutto; reducedMotion spegne solo le animazioni (non gli oggetti)
  const filamentCount = Math.max(1, reducedMotion ? Math.max(1, Math.round(perf.maxFilaments / 2)) : perf.maxFilaments);
  const particleCount = reducedMotion ? Math.max(25, Math.round(perf.maxParticles * 0.4)) : perf.maxParticles;
  const showEnv = perf.level !== 'low';

  return (
    <>
      <SceneLightingRig enableShadows={perf.enableShadows} />
      <SceneCamera
        mouseX={mouseX}
        mouseY={mouseY}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />
      <Float speed={reducedMotion ? 0 : 1.2} rotationIntensity={reducedMotion ? 0 : 0.3} floatIntensity={reducedMotion ? 0 : 0.6}>
        <Needle
          scrollProgress={scrollProgress}
          mouseX={mouseX}
          mouseY={mouseY}
          reducedMotion={reducedMotion}
        />
      </Float>
      <InkFilaments
        count={filamentCount}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />
      <GlowParticles
        count={particleCount}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        pixelRatio={perf.pixelRatio}
      />
      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.4}
        scale={26}
        blur={3.6}
        far={9}
        resolution={perf.level === 'high' ? 512 : 256}
        color="#0a0616"
      />
      {showEnv && (
        <Environment preset="night" />
      )}
    </>
  );
}

export function ImmersiveScene({ className = '' }: { className?: string }) {
  const perf = useScenePerformance();
  const reducedMotion = usePrefersReducedMotion();
  const [webglOk, setWebglOk] = useState(true);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canvasMounted, setCanvasMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      try {
        const c = document.createElement('canvas');
        const ok = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')));
        if (typeof window !== 'undefined') {
          console.info('[ImmersiveScene] WebGL support:', ok);
        }
        setWebglOk(ok);
      } catch (e) {
        if (typeof window !== 'undefined') {
          console.error('[ImmersiveScene] WebGL check exception:', e);
        }
        setWebglOk(false);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  // Listener SEMPRE attivi — anche su low-end e reduced-motion, le animazioni saranno più lente ma la scena risponde
  useEffect(() => {
    let mmCount = 0;
    let lastMmLog = 0;
    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      setMouseX(nx);
      setMouseY(ny);
      mmCount++;
      const now = performance.now();
      if (now - lastMmLog > 1500 && typeof window !== 'undefined') {
        console.debug('[ImmersiveScene] mousemove fired. normalized:', { mouseX: nx.toFixed(3), mouseY: ny.toFixed(3), eventsInWindow: mmCount });
        lastMmLog = now;
        mmCount = 0;
      }
    };

    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;
      setScrollProgress(p);
    };

    let lastScrollLog = 0;
    const onScrollLogThrottled = () => {
      onScroll();
      const now = performance.now();
      if (now - lastScrollLog > 2000 && typeof window !== 'undefined') {
        console.debug('[ImmersiveScene] scroll progress:', scrollProgress.toFixed(3));
        lastScrollLog = now;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScrollLogThrottled, { passive: true });
    onScroll();

    // Log periodico dello stato interno
    const intervalId = window.setInterval(() => {
      if (typeof window !== 'undefined') {
        console.debug('[ImmersiveScene] snapshot (every 3s):', {
          mouseX: mouseX.toFixed(3),
          mouseY: mouseY.toFixed(3),
          scrollProgress: scrollProgress.toFixed(3),
          reducedMotion,
          perfLevel: perf.level,
          canvasMounted,
        });
      }
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScrollLogThrottled);
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!webglOk) {
    if (typeof window !== 'undefined') {
      console.warn('[ImmersiveScene] WebGL non disponibile — visualizzo fallback statico.');
    }
    return <SceneFallback />;
  }

  return (
    <div
      className={`absolute inset-0 w-full h-full block ${className}`}
      style={{
        opacity: 1,
        transition: 'opacity 0.6s ease-out',
        outline: '2px solid rgba(139,92,246,0.28)',
        outlineOffset: '-2px',
        boxShadow: 'inset 0 0 60px rgba(139,92,246,0.10)',
      }}
      data-immersive-scene
    >
      <SceneErrorBoundary fallback={<SceneFallback />}>
        <Suspense fallback={<SceneLoader />}>
          <Canvas
            key="immersive-canvas"
            dpr={[1, perf.pixelRatio]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true,
              failIfMajorPerformanceCaveat: false,
              preserveDrawingBuffer: false,
            }}
            camera={{ fov: 50, position: [0, 0, 12], near: 0.1, far: 500 }}
            frameloop="always"
            onCreated={({ gl, scene, camera, size }) => {
              setCanvasMounted(true);
              // Clear color trasparente — gli elementi HTML dietro si vedono
              gl.setClearColor(0x000000, 0);
              scene.background = null;
              if (typeof window !== 'undefined') {
                console.info('[ImmersiveScene] Canvas CREATO con successo. Size:', size.width, 'x', size.height, 'Camera:', camera.position.toArray());
              }
            }}
            style={{
              background: 'transparent',
              width: '100%',
              height: '100%',
              display: 'block',
              touchAction: 'none',
            }}
            onError={(event) => {
              if (typeof window !== 'undefined') {
                console.error('[ImmersiveScene] Canvas onError:', event);
              }
            }}
            data-canvas-debug
          >
            <SceneContents
              perf={perf}
              reducedMotion={reducedMotion}
              mouseX={mouseX}
              mouseY={mouseY}
              scrollProgress={scrollProgress}
            />
          </Canvas>
        </Suspense>
      </SceneErrorBoundary>
    </div>
  );
}
