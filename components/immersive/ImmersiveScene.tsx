'use client';

import { useRef, useMemo, useEffect, useState, Suspense, Component, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, ContactShadows, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { LIGHTING, NEEDLE, INK, PARTICLES, FOG } from '@/lib/three/constants';
import { useScenePerformance } from '@/hooks/useScenePerformance';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { inkVertexShader, inkFragmentShader } from '@/lib/three/shaders/InkShader';
import { glowVertexShader, glowFragmentShader } from '@/lib/three/shaders/GlowShader';
import { getCameraComputer, type CameraVectors } from '@/lib/wasm/cameraWasm';
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

function TattooMachineModel({ needleOffset = 0, buzzing = 0 }: { needleOffset?: number; buzzing?: number }) {
  const metalDark = { color: '#1a1722', metalness: 0.85, roughness: 0.28 };
  const metalMid = { color: '#3a3448', metalness: 0.9, roughness: 0.22 };
  const metalLight = { color: '#b8b2c8', metalness: 0.95, roughness: 0.15 };
  const accent = { color: '#8b5cf6', emissive: '#4c1d95', emissiveIntensity: 0.7, metalness: 0.6, roughness: 0.3 };
  const gold = { color: '#e7c376', emissive: '#7a5a1f', emissiveIntensity: 0.35, metalness: 0.9, roughness: 0.2 };

  return (
    <group>
      {/* Corpo motore (rotary pen) */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.42, 2.1, 48]} />
        <meshStandardMaterial {...metalDark} envMapIntensity={1.2} />
      </mesh>

      {/* Cappuccio motore */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.45, 48]} />
        <meshStandardMaterial {...metalMid} envMapIntensity={1.3} />
      </mesh>
      <mesh position={[0, 1.82, 0]}>
        <cylinderGeometry args={[0.12, 0.28, 0.18, 32]} />
        <meshStandardMaterial {...metalLight} envMapIntensity={1.4} />
      </mesh>

      <mesh position={[0, 1.3, 0]}>
        <torusGeometry args={[0.39, 0.035, 16, 64]} />
        <meshStandardMaterial {...gold} />
      </mesh>

      {/* Grip */}
      <mesh position={[0, -0.55, 0]} castShadow>
        <cylinderGeometry args={[0.44, 0.44, 1.25, 48]} />
        <meshStandardMaterial color="#14111b" metalness={0.55} roughness={0.55} />
      </mesh>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`grip-${i}`} position={[0, -0.05 - i * 0.1, 0]}>
          <torusGeometry args={[0.445, 0.012, 10, 48]} />
          <meshStandardMaterial color="#2a2536" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}

      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.43, 0.03, 16, 64]} />
        <meshStandardMaterial {...accent} />
      </mesh>

      {/* Connettore laterale */}
      <mesh position={[0.36, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.22, 24]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      <mesh position={[0.48, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.08, 16]} />
        <meshStandardMaterial {...metalLight} />
      </mesh>

      {/* Porta cartuccia + cartuccia */}
      <mesh position={[0, -1.28, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.35, 40]} />
        <meshStandardMaterial {...metalMid} envMapIntensity={1.2} />
      </mesh>
      <mesh position={[0, -1.62, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.55, 32]} />
        <meshStandardMaterial color="#d6d2df" emissive="#6d5b8f" emissiveIntensity={0.2} metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Ago in movimento (buzz) */}
      <group position={[0, -1.98 + needleOffset, buzzing]}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 0.55, 12]} />
          <meshStandardMaterial {...metalLight} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <coneGeometry args={[0.03, 0.18, 12]} />
          <meshStandardMaterial color="#eceaf3" emissive="#8b5cf6" emissiveIntensity={0.6} metalness={0.95} roughness={0.12} />
        </mesh>
      </group>

      <mesh position={[0, 0.45, 0.39]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 20]} />
        <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={1.2} metalness={0.2} roughness={0.1} />
      </mesh>
    </group>
  );
}

function CinematicTattooStory({
  scrollProgress = 0,
  mouseX = 0,
  mouseY = 0,
  reducedMotion = false,
  onIntroComplete,
  onPhase,
}: {
  scrollProgress?: number;
  mouseX?: number;
  mouseY?: number;
  reducedMotion?: boolean;
  onIntroComplete?: () => void;
  onPhase?: (p: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const machineRef = useRef<THREE.Group>(null);
  const textGroupRef = useRef<THREE.Group>(null);
  const textRef = useRef<any>(null);
  const glowTextRef = useRef<any>(null);
  const keyLightRef = useRef<THREE.SpotLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);
  const sparkRefs = useRef<(THREE.Mesh | null)[]>([]);
  const burstRefs = useRef<(THREE.Mesh | null)[]>([]);
  const introDoneRef = useRef(false);
  const burstTimeRef = useRef<number | null>(null);
  const lastPhaseRef = useRef(-1);

  const text = 'Bolly-ink';
  const textWidth = 4.8;
  const startX = -textWidth / 2;
  const endX = textWidth / 2;

  const burstSeeds = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => {
        const a = (i / 28) * Math.PI * 2;
        const r = 0.4 + (i % 6) * 0.12;
        return {
          x: Math.cos(a) * r,
          y: Math.sin(a) * r * 0.6 + 0.2,
          z: (Math.random() - 0.5) * 0.6,
          c: i % 3 === 0 ? '#e7c376' : i % 3 === 1 ? '#a78bfa' : '#c4b5fd',
        };
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    // Fasi cinematografiche: 0 risveglio, 1 scrittura, 2 esplosione/rivelazione, 3 idle
    let phase = 0;
    if (t >= 2.2) phase = 1;
    if (t >= 7.0) phase = 2;
    if (t >= 8.8) phase = 3;
    if (reducedMotion) phase = 3;
    if (phase !== lastPhaseRef.current) {
      lastPhaseRef.current = phase;
      onPhase?.(phase);
    }

    // Scrittura "Bolly-ink" come atto centrale
    let write = 0;
    if (reducedMotion) {
      write = 1;
    } else if (t < 2.6) {
      write = 0;
    } else if (t < 6.8) {
      write = Math.min((t - 2.6) / 4.2, 1);
    } else {
      write = 1;
    }

    if (write >= 1 && !introDoneRef.current) {
      introDoneRef.current = true;
      burstTimeRef.current = t;
      onIntroComplete?.();
    }

    const currentX = startX + (endX - startX) * write;
    const clip: [number, number, number, number] = [startX - 0.4, -1.5, currentX, 1.5];
    if (textRef.current) {
      textRef.current.clipRect = clip;
      textRef.current.fillOpacity = reducedMotion ? 1 : Math.min(Math.max((t - 1.2) / 1.2, 0), 1);
    }
    if (glowTextRef.current) {
      glowTextRef.current.clipRect = clip;
      glowTextRef.current.fillOpacity = reducedMotion ? 0.6 : Math.min(Math.max((t - 1.2) / 1.2, 0), 0.6);
    }

    // Entrata cinematografica della firma (obliqua, come incisione luminosa)
    if (textGroupRef.current) {
      if (reducedMotion) {
        textGroupRef.current.rotation.set(-0.2, -0.28, -0.06);
        textGroupRef.current.position.set(0, -0.2, 0.1);
        textGroupRef.current.scale.setScalar(1);
      } else {
        const intro = Math.min(Math.max((t - 1.0) / 1.6, 0), 1);
        const e = 1 - Math.pow(1 - intro, 4);
        textGroupRef.current.rotation.set(
          THREE.MathUtils.lerp(-0.55, -0.2, e),
          THREE.MathUtils.lerp(-0.7, -0.28, e),
          THREE.MathUtils.lerp(-0.18, -0.06, e)
        );
        textGroupRef.current.position.set(
          THREE.MathUtils.lerp(-0.4, 0, e),
          THREE.MathUtils.lerp(-0.55, -0.2, e),
          THREE.MathUtils.lerp(-0.2, 0.1, e)
        );
        textGroupRef.current.scale.setScalar(0.8 + e * 0.22);
      }
    }

    // Macchina protagonista: close-up -> gesto di scrittura -> posa finale
    if (machineRef.current) {
      if (reducedMotion) {
        machineRef.current.position.set(0.2, 1.2, 0.55);
        machineRef.current.rotation.set(0.2, 0.2, -0.45);
        machineRef.current.scale.setScalar(0.95);
      } else {
        const buzz = Math.sin(t * 55) * 0.012;
        const needlePump = Math.sin(t * 28) * 0.02;
        if (phase === 0) {
          // Close-up iniziale sulla punta (risveglio)
          const p = Math.min(t / 2.2, 1);
          const e = 1 - Math.pow(1 - p, 3);
          machineRef.current.position.set(THREE.MathUtils.lerp(0.15, -0.4, e), THREE.MathUtils.lerp(0.55, 0.95, e), THREE.MathUtils.lerp(1.5, 1.0, e));
          machineRef.current.rotation.set(0.55, 0.35 + Math.sin(t * 0.8) * 0.05, -0.7);
          machineRef.current.scale.setScalar(1.35 - e * 0.2);
        } else if (phase === 1) {
          // Scrive "Bolly-ink"
          const tx = startX + (endX - startX) * write;
          machineRef.current.position.set(tx * 0.9 + 0.05 + buzz, 1.25 + needlePump + Math.abs(tx) * 0.02, 0.65);
          machineRef.current.rotation.set(0.24 + Math.sin(t * 30) * 0.01, 0.12 + Math.sin(t * 0.5) * 0.04, -0.55);
          machineRef.current.scale.setScalar(1.08);
        } else {
          // Posa finale cinematografica
          const settle = Math.min(Math.max((t - 7.0) / 1.8, 0), 1);
          const e = 1 - Math.pow(1 - settle, 3);
          machineRef.current.position.set(THREE.MathUtils.lerp(endX * 0.9, 1.1, e), THREE.MathUtils.lerp(1.3, 1.45, e), THREE.MathUtils.lerp(0.65, 0.5, e));
          machineRef.current.rotation.set(0.22, THREE.MathUtils.lerp(0.12, -0.25, e), -0.5);
          machineRef.current.scale.setScalar(1.05);
        }
        machineRef.current.position.y += buzz * 0.2;
      }
    }

    // Luci "da scena" che cambiano nel tempo
    if (keyLightRef.current) {
      const base = phase === 0 ? 1.2 : phase === 1 ? 2.2 : 2.8;
      keyLightRef.current.intensity = base + (phase >= 2 ? 0.6 : 0) + Math.sin(t * 1.5) * 0.08;
    }
    if (rimLightRef.current) {
      rimLightRef.current.intensity = (phase >= 2 ? 1.4 : 0.4) + Math.sin(t * 2.2) * 0.1;
    }

    // Scintille durante la scrittura
    sparkRefs.current.forEach((m, i) => {
      if (!m) return;
      const active = !reducedMotion && write > 0.03 && write < 0.995;
      m.visible = active;
      if (!active) return;
      const j = i % 6;
      const sx = startX + (endX - startX) * write;
      m.position.set(sx + Math.sin(t * 14 + i) * 0.12, -0.15 + Math.cos(t * 12 + j) * 0.08, 0.25 + Math.sin(t * 10 + i) * 0.08);
      const s = 0.025 + (Math.sin(t * 22 + i) * 0.5 + 0.5) * 0.035;
      m.scale.setScalar(s);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 + (Math.sin(t * 18 + i) * 0.5 + 0.5) * 0.5;
    });

    // Burst cinematografico a firma completata
    burstRefs.current.forEach((m, i) => {
      if (!m) return;
      const bt = burstTimeRef.current;
      if (bt == null || reducedMotion) {
        m.visible = false;
        return;
      }
      const age = t - bt;
      if (age < 0 || age > 1.8) {
        m.visible = false;
        return;
      }
      m.visible = true;
      const s = burstSeeds[i];
      const p = age / 1.8;
      const e = 1 - Math.pow(1 - p, 3);
      m.position.set(s.x * (0.5 + e * 3.2), -0.1 + s.y * (0.4 + e * 2.4), 0.2 + s.z + e * 0.8);
      m.scale.setScalar((1 - p) * 0.14 + 0.015);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - p) * 0.95;
    });

    // Movimento di insieme + risposta interattiva
    if (reducedMotion) {
      groupRef.current.rotation.set(0, 0.1, 0);
      groupRef.current.position.set(0, 0, 0);
      groupRef.current.scale.setScalar(1.1);
      return;
    }

    const idle = t > 8.8 ? 1 : 0;
    groupRef.current.rotation.y = 0.05 + mouseX * 0.12 + Math.sin(t * 0.12) * 0.04 * idle;
    groupRef.current.rotation.x = -mouseY * 0.08 + Math.cos(t * 0.1) * 0.02 * idle;
    groupRef.current.position.y = Math.sin(t * 0.25) * 0.04 + scrollProgress * 0.5;
    groupRef.current.position.z = scrollProgress * -2.0;
    groupRef.current.scale.setScalar(1.15 - scrollProgress * 0.15);
  });

  return (
    <group ref={groupRef}>
      {/* Piano scenico / superficie immersiva */}
      <mesh position={[0, -1.25, -0.2]} rotation={[-Math.PI / 2.2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 8, 1, 1]} />
        <meshStandardMaterial color="#120f18" roughness={0.95} metalness={0.05} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0.4, -2.2]}>
        <planeGeometry args={[16, 8]} />
        <meshBasicMaterial color="#090611" transparent opacity={0.55} />
      </mesh>

      {/* Firma "Bolly-ink" scritta come scena chiave */}
      <group ref={textGroupRef} position={[0, -0.2, 0.1]} rotation={[-0.2, -0.28, -0.06]}>
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[5.8, 1.8]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <Text
          ref={glowTextRef}
          position={[0, 0, 0]}
          fontSize={0.95}
          letterSpacing={0.03}
          color="#c4b5fd"
          anchorX="center"
          anchorY="middle"
          fillOpacity={0}
          clipRect={[startX - 0.4, -1.5, startX - 0.4, 1.5]}
        >
          {text}
        </Text>
        <Text
          ref={textRef}
          position={[0, 0, 0.03]}
          fontSize={0.95}
          letterSpacing={0.03}
          color="#f8f7ff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.022}
          outlineColor="#7c3aed"
          outlineOpacity={1}
          fillOpacity={0}
          strokeWidth={0.01}
          strokeColor="#ffffff"
          strokeOpacity={0.35}
          clipRect={[startX - 0.4, -1.5, startX - 0.4, 1.5]}
        >
          {text}
        </Text>
      </group>

      {/* Macchina protagonista */}
      <group ref={machineRef} scale={1.05}>
        <TattooMachineModel needleOffset={0} buzzing={0} />
        <pointLight color={0xa78bfa} intensity={1.4} distance={5} decay={2} position={[0, -1.8, 0.4]} />
      </group>

      {/* Scintille di incisione */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={`spark-${i}`} ref={(el) => { sparkRefs.current[i] = el; }} visible={false}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial color={i % 2 ? '#e7c376' : '#c4b5fd'} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}

      {/* Burst finale */}
      {burstSeeds.map((s, i) => (
        <mesh key={`burst-${i}`} ref={(el) => { burstRefs.current[i] = el; }} visible={false}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={s.c} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}

      {/* Luci cinematografiche */}
      <spotLight
        ref={keyLightRef}
        color="#ffffff"
        intensity={1.8}
        position={[2.5, 4.5, 4.5]}
        angle={0.4}
        penumbra={0.8}
        castShadow={false}
      />
      <pointLight ref={rimLightRef} color="#8b5cf6" intensity={0.6} distance={12} decay={2} position={[-3, 1.5, 1]} />
      <pointLight color="#e7c376" intensity={0.45} distance={10} decay={2} position={[2.5, -0.5, 2]} />
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
  cinematicPhase = 3,
}: {
  mouseX?: number;
  mouseY?: number;
  scrollProgress?: number;
  reducedMotion?: boolean;
  cinematicPhase?: number;
}) {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(0, 0.4, 8.5));
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const computeRef = useRef<((t: number, phase: number, mx: number, my: number, scroll: number, reduced: boolean) => CameraVectors) | null>(null);

  useEffect(() => {
    let mounted = true;
    getCameraComputer().then((fn) => {
      if (mounted) computeRef.current = fn;
    });
    return () => {
      mounted = false;
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // Calcolo target camera: modulo C++/Wasm se disponibile, altrimenti fallback JS
    const compute =
      computeRef.current ??
      ((tt: number, phase: number, mx: number, my: number, scroll: number, reduced: boolean): CameraVectors => {
        if (reduced) return { pos: [0, 0.3, 9.2], look: [0, -0.1, 0] };
        if (phase === 0) return { pos: [0.8 + Math.sin(tt * 0.7) * 0.08, 0.45, 3.8], look: [0.15, 0.35, 0.8] };
        if (phase === 1) {
          const p = Math.max(0, Math.min(1, (tt - 2.2) / 4.8));
          const orbit = p * 0.35;
          return {
            pos: [0.8 + (-0.6 - 0.8) * p + Math.sin(orbit) * 0.6 + mx * 0.25, 0.45 + (0.4 - 0.45) * p + my * 0.15, 3.8 + (7.2 - 3.8) * p],
            look: [0.15 + (0 - 0.15) * p, 0.2 + (-0.05 - 0.2) * p, 0],
          };
        }
        if (phase === 2) return { pos: [-0.2 + mx * 0.35, 0.5 + my * 0.2, 8.0], look: [0, 0, 0] };
        return { pos: [mx * 0.55, 0.35 + my * 0.3, 8.8 - scroll * 3.8], look: [0, -0.05 + scroll * 0.4, 0] };
      });

    const { pos: tp, look: tl } = compute(t, cinematicPhase, mouseX, mouseY, scrollProgress, reducedMotion);

    pos.current.lerp(new THREE.Vector3(tp[0], tp[1], tp[2]), reducedMotion ? 1 : 0.035);
    look.current.lerp(new THREE.Vector3(tl[0], tl[1], tl[2]), reducedMotion ? 1 : 0.045);

    camera.position.copy(pos.current);
    camera.lookAt(look.current);
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

function RevealGroup({
  show,
  delay = 0,
  from = [0, -0.2, 0] as [number, number, number],
  children,
}: {
  show: boolean;
  delay?: number;
  from?: [number, number, number];
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const startedAt = useRef<number | null>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (!show) {
      ref.current.visible = false;
      ref.current.scale.setScalar(0.001);
      startedAt.current = null;
      return;
    }
    ref.current.visible = true;
    if (startedAt.current === null) startedAt.current = clock.elapsedTime;
    const t = Math.max(0, clock.elapsedTime - startedAt.current - delay);
    const p = Math.min(t / 0.9, 1);
    const e = 1 - Math.pow(1 - p, 3);
    const s = 0.001 + e * 0.999;
    ref.current.scale.setScalar(s);
    ref.current.position.set(from[0] * (1 - e), from[1] * (1 - e), from[2] * (1 - e));
  });

  return <group ref={ref}>{children}</group>;
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
  const [introComplete, setIntroComplete] = useState(reducedMotion);
  const [cinematicPhase, setCinematicPhase] = useState(reducedMotion ? 3 : 0);
  const particleCount = reducedMotion ? Math.min(90, Math.round(perf.maxParticles * 0.6)) : Math.max(perf.maxParticles, 180);
  const showEnv = perf.level !== 'low';

  useEffect(() => {
    if (reducedMotion) {
      setIntroComplete(true);
      setCinematicPhase(3);
    }
  }, [reducedMotion]);

  return (
    <>
      <color attach="background" args={['#05040a']} />
      <PerspectiveCamera makeDefault position={[0.8, 0.45, 3.8]} fov={42} near={0.1} far={220} />
      <ambientLight intensity={0.22} color="#ffffff" />
      <fogExp2 attach="fog" args={['#070611', 0.055]} />

      <SceneCamera
        mouseX={mouseX}
        mouseY={mouseY}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        cinematicPhase={cinematicPhase}
      />

      <Float speed={reducedMotion ? 0 : 0.2} rotationIntensity={reducedMotion ? 0 : 0.03} floatIntensity={reducedMotion ? 0 : 0.05}>
        <CinematicTattooStory
          scrollProgress={scrollProgress}
          mouseX={mouseX}
          mouseY={mouseY}
          reducedMotion={reducedMotion}
          onPhase={setCinematicPhase}
          onIntroComplete={() => setIntroComplete(true)}
        />
      </Float>

      <RevealGroup show={introComplete || cinematicPhase >= 2} delay={0.15} from={[0, 0.2, 0]}>
        <GlowParticles
          count={particleCount}
          scrollProgress={scrollProgress}
          reducedMotion={reducedMotion}
          pixelRatio={perf.pixelRatio}
        />
      </RevealGroup>

      {(perf.enableShadows || cinematicPhase >= 2) && (
        <RevealGroup show={introComplete || cinematicPhase >= 2} delay={0.35} from={[0, -0.3, 0]}>
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.28}
            scale={30}
            blur={3.4}
            far={10}
            resolution={256}
            color="#0a0616"
          />
        </RevealGroup>
      )}

      {showEnv && (introComplete || cinematicPhase >= 2) && <Environment preset="night" />}
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

  const [sceneVisible, setSceneVisible] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setSceneVisible(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className={`absolute inset-0 w-full h-full ${className}`}
      data-immersive-scene
      aria-hidden="true"
      style={{
        opacity: sceneVisible ? 1 : 0,
        transform: sceneVisible ? 'scale(1)' : 'scale(1.04)',
        transition: reducedMotion ? 'none' : 'opacity 1200ms ease-out, transform 1600ms cubic-bezier(.22,1,.36,1)',
      }}
    >
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
