// Costanti per la direzione artistica, parametri fisici, materiali, palette, lighting, fog, ecc.
// Mantienile sincronizzate con il brand e l'art direction, modifica qui per riflettere lo stile globale

export const PALETTE = {
  black: 0x09090f,
  dark: 0x191925,
  accent: 0x8b5cf6, // viola chiaro (luxury glow)
  accentBright: 0xa78bfa, // viola più chiaro per emissivo
  gold: 0xe7c376,   // oro caldo metallico
  goldBright: 0xf4d58f, // oro più chiaro per glow
  white: 0xf6f6f6,
  fog: 0x0f0a1f,   // viola scuro invece di nero puro (maggior contrasto)
};

export const LIGHTING = {
  key: { color: 0xffffff, intensity: 3.8, position: [5, 6, 8], angle: Math.PI / 3.5, penumbra: 0.45 },
  fill: { color: 0xccc7ff, intensity: 1.5, position: [-4, 3, 6] },
  rim: { color: 0xffffff, intensity: 2.8, position: [0, 3, -6] },
  ambient: { color: 0x3a3550, intensity: 0.6 },
  accentPoint: { color: 0x8b5cf6, intensity: 2.2, position: [0, 0, 2] },
};

export const FOG = {
  color: PALETTE.fog,
  density: 0.012, // ridotta per maggiore visibilità
};

export const NEEDLE = {
  body: { color: 0x6b5b8a, emissive: 0x2d1f5a, emissiveIntensity: 0.35, metalness: 0.75, roughness: 0.32, envMapIntensity: 1.3 },
  tip: { color: 0xb8a8d8, emissive: 0x6d48c8, emissiveIntensity: 0.55, metalness: 0.95, roughness: 0.18 },
  grip: { color: 0x4a3a6a, emissive: 0x1a0f3a, emissiveIntensity: 0.25, metalness: 0.55, roughness: 0.55 },
  detail: { color: 0xd4c4e8, emissive: 0x8b5cf6, emissiveIntensity: 0.65, metalness: 0.9, roughness: 0.2 },
  scale: 2.5,
};

export const INK = {
  filament: { color: 0x6d48c8, emissive: 0x3a1f7a, emissiveIntensity: 0.7, distortion: 0.3, opacity: 0.85 },
  count: { desktop: 4, mobile: 2, lowEnd: 0 },
};

export const PARTICLES = {
  color: 0xc4b5fd, // viola più chiaro e brillante
  count: { desktop: 200, mobile: 50, lowEnd: 0 },
};
