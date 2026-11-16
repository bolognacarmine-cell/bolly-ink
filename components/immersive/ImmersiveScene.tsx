'use client';

import { useRef, useMemo, useEffect, useState, Suspense, Component, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { LIGHTING, NEEDLE, INK, PARTICLES, FOG } from '@/lib/three/constants';
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
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function Needle({
  scrollProgress = 0,
  mouseX = 0,
  mouseY = 0,
  reducedMotion = false,
}: {
  scrollProgress?: number;
  mouseX?: number;
  mouseY?: number;
  reducedMotion?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const rotX = useRef(0);
  const rotY = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    if (reducedMotion) {
      groupRef.current.rotation.set(0.2, 0.4, 0.1);
      groupRef.current.position.set(0, 0.2, 0);
      groupRef.current.scale.setScalar(NEEDLE.scale * 1.1);
      if (spinRef.current) spinRef.current.rotation.x = 0;
      return;
    }

    const t = clock.elapsedTime;
    const idleY = Math.sin(t * 0.5) * 0.15;

    const targetRotX = -mouseY * 0.18 + 0.15;
    const targetRotY = mouseX * 0.18 + 0.35;

    rotX.current += (targetRotX - rotX.current) * 0.05;
    rotY.current += (targetRotY - rotY.current) * 0.05;

    groupRef.current.rotation.x = rotX.current;
    groupRef.current.rotation.y = rotY.current;
    groupRef.current.rotation.z = Math.sin(t * 0.25) * 0.08 + scrollProgress * 0.4;

    const zOffset = scrollProgress * -3.5;
    const yOffset = scrollProgress * 1.2 + idleY;
    const scale = NEEDLE.scale * (1.15 - scrollProgress * 0.25);

    groupRef.current.position.set(0, yOffset, zOffset);
    groupRef.current.scale.setScalar(scale);

    // Rotazione continua della penna da tatuatore attorno al proprio asse
    if (spinRef.current) {
      spinRef.current.rotation.x += delta * 1.8;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={spinRef}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[1, 0, 0]} castShadow>
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
            emissiveIntensity={NEEDLE.tip.emissiveIntensity + 0.4}
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
            emissiveIntensity={NEEDLE.detail.emissiveIntensity + 0.3}
            metalness={NEEDLE.detail.metalness}
            roughness={NEEDLE.detail.roughness}
          />
        </mesh>
      </group>
      <pointLight color={0x8b5cf6} intensity={1.4} distance={6} decay={2} position={[0.2, 0, 0]} />
    </group>
  );
}

function InkFilaments({
  count = 4,
  scrollProgress = 0,
  reducedMotion = false,
}: {
  count?: number;
  scrollProgress?: number;
  reducedMotion?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const timeRef = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(INK.filament.color) },
      uEmissive: { value: new THREE.Color(INK.filament.emissive) },
      uEmissiveIntensity: { value: INK.filament.emissiveIntensity },
      uDistortion: { value: INK.filament.distortion },
      uOpacity: { value: INK.filament.opacity },
      uScrollProgress: { value: 0 },
    }),
    []
  );

  useFrame((_, delta) => {
    if (reducedMotion) return;
    timeRef.current += delta;
    materialRefs.current.forEach((mat, i) => {
      if (!mat) return;
      mat.uniforms.uTime.value = timeRef.current + i * 0.7;
      mat.uniforms.uScrollProgress.value = scrollProgress;
    });
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(timeRef.current * 0.12) * 0.08;
      groupRef.current.position.z = scrollProgress * -3;
      groupRef.current.scale.setScalar(1 - scrollProgress * 0.25);
    }
  });

  if (count === 0) return null;

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const yBase = (i - (count - 1) / 2) * 1.8 + Math.sin(i * 1.3) * 0.5;
        const zPos = (i / Math.max(count, 1) - 0.5) * 2.2 - 0.5;
        const zRot = Math.PI / 2 + Math.sin(i * 0.8) * 0.08;
        return (
          <mesh key={i} position={[0, yBase, zPos]} rotation={[0, 0, zRot]}>
            <cylinderGeometry args={[0.02, 0.02, 18, 10, 24, false]} />
            <shaderMaterial
              ref={(el) => {
                materialRefs.current[i] = el;
              }}
              vertexShader={inkVertexShader}
              fragmentShader={inkFragmentShader}
              uniforms={{
                ...uniforms,
                uTime: { value: i * 0.7 },
              }}
              transparent
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function GlowParticles({
  count = 200,
  scrollProgress = 0,
  reducedMotion = false,
  pixelRatio = 1,
}: {
  count?: number;
  scrollProgress?: number;
  reducedMotion?: boolean;
  pixelRatio?: number;
}) {
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
      const radius = 1.8 + Math.random() * 6.5;
      const height = (Math.random() - 0.5) * 9;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 1.5;
      sizes[i] = 0.08 + Math.random() * 0.2;
      alphas[i] = 0.45 + Math.random() * 0.55;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    return geom;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(PARTICLES.color) },
      uSize: { value: 1.1 },
      uPixelRatio: { value: pixelRatio },
    }),
    [pixelRatio]
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    if (reducedMotion) return;
    timeRef.current += delta;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = timeRef.current;
    }
    pointsRef.current.rotation.y = timeRef.current * 0.03;
    pointsRef.current.position.z = scrollProgress * -2.2;
    pointsRef.current.scale.setScalar(1 + scrollProgress * 0.35);
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

function SceneCamera({
  mouseX = 0,
  mouseY = 0,
  scrollProgress = 0,
  reducedMotion = false,
}: {
  mouseX?: number;
  mouseY?: number;
  scrollProgress?: number;
  reducedMotion?: boolean;
}) {
  const { camera } = useThree();
  const posX = useRef(0);
  const posY = useRef(0);

  useFrame(() => {
    if (reducedMotion) {
      camera.position.set(0, 0, 12);
      camera.lookAt(0, 0, 0);
      return;
    }

    const targetX = mouseX * 0.45;
    const targetY = mouseY * 0.35;
    posX.current += (targetX - posX.current) * 0.04;
    posY.current += (targetY - posY.current) * 0.04;

    let zTarget = 12 - scrollProgress * 3.5;
    let yTarget = 0 + scrollProgress * 1.2;

    camera.position.set(posX.current, posY.current + yTarget, zTarget);
    camera.lookAt(0, yTarget * 0.25, 0);
  });

  return null;
}

function SceneLightingRig({ enableShadows = true }: { enableShadows?: boolean }) {
  return (
    <>
      <ambientLight color={0xffffff} intensity={0.55} />
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
      <pointLight
        color={LIGHTING.accentPoint.color}
        intensity={LIGHTING.accentPoint.intensity}
        position={LIGHTING.accentPoint.position as [number, number, number]}
      />
      <pointLight color={0xe7c376} intensity={0.8} position={[-4, -1, 4]} />
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
  const filamentCount = reducedMotion ? Math.min(2, perf.maxFilaments) : perf.maxFilaments;
  const particleCount = reducedMotion ? Math.min(60, Math.round(perf.maxParticles * 0.4)) : perf.maxParticles;
  const showEnv = perf.level === 'high';

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} near={0.1} far={200} />
      <SceneLightingRig enableShadows={perf.enableShadows} />
      <SceneCamera mouseX={mouseX} mouseY={mouseY} scrollProgress={scrollProgress} reducedMotion={reducedMotion} />

      <Float speed={reducedMotion ? 0 : 1} rotationIntensity={reducedMotion ? 0 : 0.25} floatIntensity={reducedMotion ? 0 : 0.45}>
        <Needle scrollProgress={scrollProgress} mouseX={mouseX} mouseY={mouseY} reducedMotion={reducedMotion} />
      </Float>

      <InkFilaments count={filamentCount} scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
      <GlowParticles
        count={particleCount}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        pixelRatio={perf.pixelRatio}
      />

      {perf.enableShadows && (
        <ContactShadows
          position={[0, -3, 0]}
          opacity={0.35}
          scale={24}
          blur={3}
          far={8}
          resolution={256}
          color="#0a0616"
        />
      )}

      {showEnv && <Environment preset="night" />}
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

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const ok = !!(
        window.WebGLRenderingContext &&
        (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'))
      );
      setWebglOk(ok);
    } catch {
      setWebglOk(false);
    }
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth) * 2 - 1);
      setMouseY(-((e.clientY / window.innerHeight) * 2 - 1));
    };

    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
      setScrollProgress(p);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (!webglOk) {
    return <SceneFallback />;
  }

  return (
    <div className={`absolute inset-0 w-full h-full ${className}`} data-immersive-scene aria-hidden="true">
      <SceneErrorBoundary fallback={<SceneFallback />}>
        <Suspense fallback={<SceneLoader />}>
          <Canvas
            dpr={[1, perf.pixelRatio]}
            gl={{
              antialias: perf.level !== 'low',
              alpha: true,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true,
            }}
            frameloop={reducedMotion ? 'demand' : 'always'}
            onCreated={({ gl, scene }) => {
              gl.setClearColor(0x000000, 0);
              scene.background = null;
            }}
            style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
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
