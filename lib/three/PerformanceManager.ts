/**
 * Performance Manager for 3D scenes
 * Handles optimization, fallbacks, and adaptive quality
 */

export class PerformanceManager {
  private isLowEndDevice: boolean = false;
  private pixelRatio: number = 1;
  private maxObjects: number = 100;

  constructor() {
    this.detectDeviceCapabilities();
  }

  /**
   * Detect device capabilities and adjust settings accordingly
   */
  private detectDeviceCapabilities() {
    // Check for low-end device indicators
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (performance as any).memory ? (performance as any).memory.jsHeapSizeLimit : 0;
    
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
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if WebGL2 is available (for shader support)
   */
  isWebGL2Available(): boolean {
    try {
      const canvas = document.createElement('canvas');
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
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function(this: any, ...args: Parameters<T>) {
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
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function(this: any, ...args: Parameters<T>) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// Singleton instance
export const performanceManager = new PerformanceManager();
