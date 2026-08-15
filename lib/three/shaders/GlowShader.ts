export const glowVertexShader = `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;

attribute float aSize;
attribute float aAlpha;

varying float vAlpha;

void main() {
  vAlpha = aAlpha;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  // Size based on distance from camera
  float dist = length(mvPosition.xyz);
  float size = aSize * uSize * (300.0 / dist) * uPixelRatio;
  
  // Gentle temporal movement
  float timeOffset = uTime * 0.2;
  vec3 pos = position;
  pos.x += sin(timeOffset + position.y * 0.5) * 0.02;
  pos.y += cos(timeOffset + position.x * 0.5) * 0.02;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = size;
}
`;

export const glowFragmentShader = `
uniform vec3 uColor;
uniform float uTime;

varying float vAlpha;

void main() {
  // Calculate distance from center of point
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  
  // Radial gradient for glow effect
  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  
  // Subtle pulsing
  float pulse = 0.9 + 0.1 * sin(uTime * 2.0);
  
  // Final opacity with particle alpha and pulse
  float finalAlpha = vAlpha * alpha * pulse;
  
  // Ensure we don't burn the contrast - keep it subtle
  finalAlpha = clamp(finalAlpha, 0.0, 0.7);
  
  gl_FragColor = vec4(uColor, finalAlpha);
}
`;
