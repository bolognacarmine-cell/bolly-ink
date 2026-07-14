import * as THREE from 'three';
import { performanceManager } from './PerformanceManager';

/**
 * Core 3D Scene Manager
 * Modular architecture for WebXR readiness
 * Separates scene, camera, renderer, and object management
 */
export class Scene3D {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private animationFrameId: number | null = null;
  private objects: Map<string, THREE.Object3D> = new Map();
  private isInitialized = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    
    // Camera setup - positioned for future WebXR extension
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Renderer with performance-optimized configuration
    const rendererConfig = performanceManager.getRendererConfig();
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: rendererConfig.antialias,
      alpha: rendererConfig.alpha,
      powerPreference: rendererConfig.powerPreference,
      stencil: rendererConfig.stencil
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(performanceManager.getPixelRatio());
    this.renderer.setClearColor(0x000000, 0);
  }

  /**
   * Initialize the scene with lighting and environment
   */
  init() {
    if (this.isInitialized) return;

    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // Directional light for shadows and depth
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Point light for accent lighting
    const pointLight = new THREE.PointLight(0x8b5cf6, 0.5, 100);
    pointLight.position.set(-5, 3, 2);
    this.scene.add(pointLight);

    this.isInitialized = true;
  }

  /**
   * Add an object to the scene with a unique ID
   * For WebXR: objects can be positioned relative to camera
   */
  addObject(id: string, object: THREE.Object3D) {
    this.objects.set(id, object);
    this.scene.add(object);
  }

  /**
   * Remove an object from the scene
   */
  removeObject(id: string) {
    const object = this.objects.get(id);
    if (object) {
      this.scene.remove(object);
      this.objects.delete(id);
    }
  }

  /**
   * Get an object by ID
   */
  getObject(id: string): THREE.Object3D | undefined {
    return this.objects.get(id);
  }

  /**
   * Update camera position
   * For WebXR: this would sync with HMD pose
   */
  setCameraPosition(x: number, y: number, z: number) {
    this.camera.position.set(x, y, z);
  }

  /**
   * Get camera reference for external animation control
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Get scene reference for external manipulation
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Handle window resize
   */
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Main render loop
   * Can be extended with custom update logic
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Start animation loop
   */
  start(onUpdate?: (delta: number) => void) {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      onUpdate?.(0.016); // Approximate delta time
      this.render();
    };
    animate();
  }

  /**
   * Stop animation loop
   */
  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.stop();
    this.renderer.dispose();
    this.objects.forEach((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material?.dispose();
        }
      }
    });
    this.objects.clear();
  }
}
