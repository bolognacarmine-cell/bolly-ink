/**
 * GLSL Shader for atmospheric noise effect
 * Creates subtle, organic distortion and depth fog
 * Optimized for performance with low complexity
 */

export const atmosphereVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uDistortion;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    // Subtle vertex displacement based on time
    vec3 pos = position;
    pos.x += sin(position.y * 2.0 + uTime) * uDistortion * 0.1;
    pos.y += cos(position.x * 2.0 + uTime) * uDistortion * 0.1;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const atmosphereFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uOpacity;
  
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
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    // Create flowing noise pattern
    float n = noise(vUv * 3.0 + uTime * 0.2);
    float n2 = noise(vUv * 6.0 - uTime * 0.1);
    
    // Mix colors based on noise
    vec3 color = mix(uColor1, uColor2, n * n2);
    
    // Add subtle glow
    float glow = smoothstep(0.3, 0.7, n);
    color += glow * 0.1;
    
    gl_FragColor = vec4(color, uOpacity * (0.3 + n * 0.4));
  }
`;

/**
 * GLSL Shader for depth fog effect
 * Creates cinematic depth perception
 */

export const depthFogVertexShader = `
  varying vec2 vUv;
  varying float vDepth;
  
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const depthFogFragmentShader = `
  varying vec2 vUv;
  varying float vDepth;
  uniform float uFogDensity;
  uniform vec3 uFogColor;
  
  void main() {
    // Calculate fog based on depth
    float fogFactor = 1.0 - exp(-vDepth * uFogDensity);
    fogFactor = clamp(fogFactor, 0.0, 1.0);
    
    // Mix fog color with transparency
    vec3 color = uFogColor;
    float alpha = fogFactor * 0.5;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * GLSL Shader for particle glow effect
 * Creates subtle luminous particles
 */

export const particleVertexShader = `
  attribute float aSize;
  attribute float aAlpha;
  varying float vAlpha;
  
  void main() {
    vAlpha = aAlpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleFragmentShader = `
  varying float vAlpha;
  uniform vec3 uColor;
  
  void main() {
    // Create circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    gl_FragColor = vec4(uColor, alpha * vAlpha);
  }
`;
