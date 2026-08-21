export const inkVertexShader = `
uniform float uTime;
uniform float uDistortion;
uniform float uScrollProgress;

varying vec2 vUv;
varying float vDistortion;

void main() {
  vUv = uv;
  
  // Gentle wave deformation based on time and scroll
  float wave = sin(position.y * 0.5 + uTime * 0.3) * uDistortion * 0.1;
  float scrollWave = sin(position.x * 0.3 + uScrollProgress * 3.14159) * uDistortion * 0.05;
  
  vDistortion = wave + scrollWave;
  
  vec3 newPosition = position;
  newPosition.x += wave;
  newPosition.y += scrollWave;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

export const inkFragmentShader = `
uniform vec3 uColor;
uniform vec3 uEmissive;
uniform float uEmissiveIntensity;
uniform float uOpacity;
uniform float uTime;
uniform float uScrollProgress;

varying vec2 vUv;
varying float vDistortion;

// Simple noise function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x);
}

void main() {
  // Gradient opacity along the filament
  float gradient = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
  
  // Subtle noise for ink texture
  float noiseValue = noise(vUv * 10.0 + uTime * 0.1) * 0.1;
  
  // Edge softening
  float edge = 1.0 - abs(vDistortion) * 2.0;
  
  // Final opacity with all factors
  float finalOpacity = uOpacity * gradient * (0.8 + noiseValue) * max(edge, 0.0);
  
  // Scroll-based opacity change
  finalOpacity *= (1.0 - uScrollProgress * 0.4);
  
  // Combine base color with emissive glow for visibility
  vec3 finalColor = mix(uColor, uEmissive, uEmissiveIntensity * 0.55);
  finalColor += uEmissive * uEmissiveIntensity * 0.35;
  
  gl_FragColor = vec4(finalColor, clamp(finalOpacity, 0.0, 1.0));
}
`;
