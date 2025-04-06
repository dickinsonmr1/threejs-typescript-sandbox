import * as THREE from 'three';

export class AnimatedShaderSprite {
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private frameCount: number;
  private currentTime: number = 0;
  private duration: number;
  private loop: boolean;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private disposed: boolean = false;

  constructor(
    scene: THREE.Scene,
    texture: THREE.Texture,
    position: THREE.Vector3,
    loop: boolean,
    options: {
      columns: number;
      rows: number;
      fps: number;
      scale?: number;
      camera: THREE.Camera;
    }
  ) {
    const { columns, rows, fps, scale = 1, camera } = options;

    this.frameCount = columns * rows;
    this.duration = this.frameCount / fps;
    this.loop = loop;
    this.camera = camera;
    this.scene = scene;

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        time: { value: 0 },
        columns: { value: columns },
        rows: { value: rows },
        totalFrames: { value: this.frameCount },
        duration: { value: this.duration },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D map;
        uniform float time;
        uniform float columns;
        uniform float rows;
        uniform float totalFrames;
        uniform float duration;
        varying vec2 vUv;

        void main() {
          float currentFrame = floor(mod(time, duration) / duration * totalFrames);
          float column = mod(currentFrame, columns);
          float row = floor(currentFrame / columns);

          vec2 frameUV = vec2(1.0 / columns, 1.0 / rows);
          vec2 uv = vUv * frameUV + vec2(column, rows - 1.0 - row) * frameUV;

          vec4 color = texture2D(map, uv);
          gl_FragColor = color;
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(scale, scale);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.copy(position);
    scene.add(this.mesh);
  }

  update(deltaTime: number) {
    if (this.disposed) return;

    this.currentTime += deltaTime;

    if (!this.loop && this.currentTime >= this.duration) {
      this.dispose();
      return;
    }

    this.material.uniforms.time.value = this.currentTime;
    this.mesh.lookAt(this.camera.position);
  }

  get object3D() {
    return this.mesh;
  }

  reset() {
    this.currentTime = 0;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;

    this.scene.remove(this.mesh);

    this.mesh.geometry.dispose();
    this.material.dispose();

    // Optionally dispose texture if not shared
    // this.material.uniforms.map.value.dispose();

    // Clear references
    (this.mesh as any) = null;
    (this.material as any) = null;
  }
}