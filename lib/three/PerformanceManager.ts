/**
 * Performance Manager for 3D scenes
 * Handles optimization, fallbacks, and adaptive quality
 */

export class PerformanceManager {
  private isLowEndDevice: boolean = false;
  private pixelRatio: number = 1;
  private maxObjects: number = 100;

  constructor() {
    // Only detect device capabilities if window is available (client-side)
    if (typeof window !== 'undefined') {
      this.detectDeviceCapabilities();
    }
  }

  /**
   * Detect device capabilities and adjust settings accordingly
   */
  private detectDeviceCapabilities() {
    // Check for low-end device indicators
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 4;
    
    // Consider device low-end if mobile with limited cores
    this.isLowEndDevice = isMobile && cores < 4;
    
    // Adjust pixel ratio for performance
    this.pixelRatio = this.isLowEndDevice ? 1 : Math.min(window.devicePixelRatio, 2);
    
    // Limit object count on low-end devices
    this.maxObjects = this.isLowEndDevice ? 50 : 100;
  }

  /**
   * Get optimal pixel ratio for renderer
   */
  getPixelRatio(): number {
    return this.pixelRatio;
  }

  /**
   * Check if device is low-end
   */
  isLowEnd(): boolean {
    return this.isLowEndDevice;
  }

  /**
   * Get maximum recommended object count
   */
  getMaxObjects(): number {
    return this.maxObjects;
  }

  /**
   * Check if WebGL is available
   */
  isWebGLAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return !!(window.WebGLRenderingContext && 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if WebGL2 is available (for shader support)
   */
  isWebGL2Available(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch (e) {
      return false;
    }
  }

  /**
   * Get recommended renderer configuration
   */
  getRendererConfig() {
    return {
      antialias: !this.isLowEndDevice,
      alpha: true,
      powerPreference: (this.isLowEndDevice ? 'low-power' : 'high-performance') as WebGLPowerPreference,
      stencil: false,
      depth: true
    };
  }

  /**
   * Throttle function for performance
   */
  throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function(this: unknown, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Debounce function for performance
   */
  debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function(this: unknown, ...args: Parameters<T>) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// Lazy singleton instance - only created when accessed on client-side
let performanceManagerInstance: PerformanceManager | null = null;

export function getPerformanceManager(): PerformanceManager {
  if (!performanceManagerInstance) {
    performanceManagerInstance = new PerformanceManager();
  }
  return performanceManagerInstance;
}
