// Costanti per la direzione artistica, parametri fisici, materiali, palette, lighting, fog, ecc.
// Mantienile sincronizzate con il brand e l'art direction, modifica qui per riflettere lo stile globale

export const PALETTE = {
  black: 0x09090f,
  dark: 0x191925,
  accent: 0x8b5cf6, // viola chiaro (luxury glow)
  gold: 0xe7c376,   // oro caldo metallico
  white: 0xf6f6f6,
  fog: 0x070707,
};

export const LIGHTING = {
  key: { color: 0xfff5e6, intensity: 2.0, position: [5, 5, 8], angle: Math.PI / 4, penumbra: 0.3 },
  fill: { color: 0xe6e6ff, intensity: 0.8, position: [-3, 2, 5] },
  rim: { color: 0xffffff, intensity: 1.5, position: [0, -2, -5] },
  ambient: { color: 0x1a1a1a, intensity: 0.2 },
};

export const FOG = {
  color: PALETTE.fog,
  density: 0.02,
};

export const NEEDLE = {
  body: { color: 0x1a1a2e, metalness: 0.8, roughness: 0.3, envMapIntensity: 1.2 },
  tip: { color: 0x2a2a3e, metalness: 0.9, roughness: 0.2 },
  grip: { color: 0x0f0f1a, metalness: 0.6, roughness: 0.5 },
  detail: { color: 0x2a2a3e, metalness: 0.9, roughness: 0.2 },
  scale: 2.5,
};

export const INK = {
  filament: { color: 0x1a1a2e, distortion: 0.3, opacity: 0.7 },
  count: { desktop: 4, mobile: 2, lowEnd: 0 },
};

export const PARTICLES = {
  color: 0x8b5cf6,
  count: { desktop: 200, mobile: 50, lowEnd: 0 },
};
