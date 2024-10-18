import * as THREE from 'three';
import { QuadtreeNode5 } from './QuadtreeNode5';

export class QuadtreeTerrainSystem5 {
  root: QuadtreeNode5;
  heightmap: number[][];
  scene: THREE.Scene;
  maxLOD: number;
  threshold: number;
  heightScale: number;

  constructor(
    heightmap: number[][],
    scene: THREE.Scene,
    maxLOD: number,
    threshold: number,
    heightScale: number
  ) {
    this.heightmap = heightmap;
    this.scene = scene;
    this.maxLOD = maxLOD;
    this.threshold = threshold;
    this.heightScale = heightScale;

    const size = heightmap.length; // Assuming square heightmap
    this.root = new QuadtreeNode5({ x: 0, y: 0, size }, heightmap, scene, maxLOD, heightScale);
  }

  // Update the quadtree, subdivide/merge nodes based on camera distance
  update(camera: THREE.Camera): void {
    this.root.updateLOD(camera, this.heightmap, this.scene, this.maxLOD, this.threshold);
  }
}