'use client';

import { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { PALETTE, LIGHTING, NEEDLE, INK, PARTICLES } from '@/lib/three/constants';
import { useScenePerformance } from '@/hooks/useScenePerformance';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { inkVertexShader, inkFragmentShader } from '@/lib/three/shaders/InkShader';
import { glowVertexShader, glowFragmentShader } from '@/lib/three/shaders/GlowShader';
import { SceneLoader } from './SceneLoader';
import { SceneFallback } from './SceneFallback';

function Needle({ scrollProgress = 0, mouseX = 0, mouseY = 0, reducedMotion = false }: { scrollProgress?: number; mouseX?: number; mouseY?: number; reducedMotion?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const rotX = useRef(0);
  const rotY = useRef(0);
  const rotZ = useRef(0);

  // eslint-disable-next-line react-hooks/immutability,react-hooks/purity
  useFrame(() => {
    if (!groupRef.current) return;
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
          metalness={NEEDLE.body.metalness}
          roughness={NEEDLE.body.roughness}
          envMapIntensity={NEEDLE.body.envMapIntensity}
        />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[-1.75, 0, 0]}>
        <coneGeometry args={[0.075, 1.5, 32]} />
        <meshStandardMaterial
          color={NEEDLE.tip.color}
          metalness={NEEDLE.tip.metalness}
          roughness={NEEDLE.tip.roughness}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[4, 0, 0]}>
        <cylinderGeometry args={[0.125, 0.125, 2, 32]} />
        <meshStandardMaterial
          color={NEEDLE.grip.color}
          metalness={NEEDLE.grip.metalness}
          roughness={NEEDLE.grip.roughness}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[2.1, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 32]} />
        <meshStandardMaterial
          color={NEEDLE.detail.color}
          metalness={NEEDLE.detail.metalness}
          roughness={NEEDLE.detail.roughness}
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

  const { positions, sizes, alphas } = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    const a = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line react-hooks/purity
      const angle = Math.random() * Math.PI * 2;
      // eslint-disable-next-line react-hooks/purity
      const radius = 2 + Math.random() * 6;
      // eslint-disable-next-line react-hooks/purity
      const height = (Math.random() - 0.5) * 8;
      p[i * 3] = Math.cos(angle) * radius;
      p[i * 3 + 1] = height;
      p[i * 3 + 2] = Math.sin(angle) * radius - 2;
      // eslint-disable-next-line react-hooks/purity
      s[i] = 0.05 + Math.random() * 0.1;
      // eslint-disable-next-line react-hooks/purity
      a[i] = 0.3 + Math.random() * 0.4;
    }
    return { positions: p, sizes: s, alphas: a };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(PARTICLES.color) },
    uSize: { value: 1.0 },
    uPixelRatio: { value: pixelRatio },
  }), [pixelRatio]);

  // eslint-disable-next-line react-hooks/immutability,react-hooks/purity
  useFrame((state, delta) => {
    if (reducedMotion || !pointsRef.current) return;
    timeRef.current += delta;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = timeRef.current;
    }
    const geom = pointsRef.current.geometry;
    if (geom.attributes.position) {
      const pos = geom.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const iy = i * 3 + 1;
        pos[iy] += Math.sin(timeRef.current + i) * 0.001 * delta * 60;
      }
      geom.attributes.position.needsUpdate = true;
    }
    pointsRef.current.position.z = scrollProgress * -2;
    pointsRef.current.scale.setScalar(1 + scrollProgress * 0.5);
  });

  if (count === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aAlpha" args={[alphas, 1]} />
      </bufferGeometry>
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

  // Inizializzazione camera gia configurata nel padre (Canvas)

  useFrame(() => {
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
      <ambientLight color={LIGHTING.ambient.color} intensity={LIGHTING.ambient.intensity} />
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
        intensity={LIGHTING.fill.intensity}
        position={LIGHTING.fill.position as [number, number, number]}
      />
      <spotLight
        color={LIGHTING.rim.color}
        intensity={LIGHTING.rim.intensity}
        position={LIGHTING.rim.position as [number, number, number]}
      />
      <fogExp2 attach="fog" args={[PALETTE.fog, 0.02]} />
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
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      try {
        const c = document.createElement('canvas');
        const ok = !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
        setWebglOk(ok);
      } catch {
        setWebglOk(false);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, [] as any[]);

  useEffect(() => {
    if (reducedMotion || perf.level === 'low') return;

    const onMouseMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth) * 2 - 1);
      setMouseY(-((e.clientY / window.innerHeight) * 2 - 1));
    };

    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reducedMotion, perf.level]);

  const filamentCount = reducedMotion ? 0 : perf.maxFilaments;
  const particleCount = reducedMotion ? 0 : perf.maxParticles;

  if (!webglOk || hasError) return <SceneFallback />;

  return (
    <div className={`absolute inset-0 w-full h-full ${className}`} onError={() => setHasError(true)}>
      <Suspense fallback={<SceneLoader />}>
        <Canvas
          dpr={[1, perf.pixelRatio]}
          gl={{
            antialias: perf.level === 'high',
            alpha: true,
            powerPreference: perf.level === 'low' ? 'low-power' : 'high-performance',
            stencil: false,
            depth: true,
          }}
          camera={{ fov: 45, position: [0, 0, 12] }}
          frameloop={reducedMotion ? 'demand' : 'always'}
          style={{ background: 'transparent' }}
        >
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
            position={[0, -4, 0]}
            opacity={0.25}
            scale={20}
            blur={2.4}
            far={6}
            resolution={256}
            color="#000000"
          />
          {perf.level === 'high' && (
            <Environment preset="night" />
          )}
        </Canvas>
      </Suspense>
    </div>
  );
}
