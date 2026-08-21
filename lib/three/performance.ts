// Utility per performance check, adaptive quality e supporto WebGL/scenario
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

type ExtendedNavigator = Navigator & { deviceMemory?: number };

// Riconoscimento dispositivi "low-end" (ram, pixel ratio, heuristica)
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as ExtendedNavigator;
  const maxMem = nav.deviceMemory;
  // Heuristica: mobile, RAM bassa (<3GB), pixelRatio altissimo
  return window.innerWidth < 500 || (typeof maxMem === 'number' && maxMem <= 2) || window.devicePixelRatio > 2.5;
}

// Gestione pixelRatio adattivo su device e performance
export function getPixelRatio(): number {
  if (isLowEndDevice()) return 1;
  return Math.min(window.devicePixelRatio || 1, 2.2);
}
