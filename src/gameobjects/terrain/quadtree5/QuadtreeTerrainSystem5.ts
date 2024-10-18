import * as THREE from 'three';
import { QuadtreeNode5 } from './QuadtreeNode5';

export class QuadtreeTerrainSystem5 {
    root: QuadtreeNode5;
  
    constructor(heightmap: number[][], size: number) {
      this.root = new QuadtreeNode5(heightmap, 0, 0, size, true, 0);
    }
  
    // Recursively subdivide the entire quadtree initially
    buildFullQuadtree(node: QuadtreeNode5, maxLOD: number): void {
      const { size } = node.bounds;
      if (size <= maxLOD) return; // Stop subdividing at the maximum level of detail
  
      node.subdivide();
  
      // Recursively subdivide the children
      if (node.topLeft) this.buildFullQuadtree(node.topLeft, maxLOD);
      if (node.topRight) this.buildFullQuadtree(node.topRight, maxLOD);
      if (node.bottomLeft) this.buildFullQuadtree(node.bottomLeft, maxLOD);
      if (node.bottomRight) this.buildFullQuadtree(node.bottomRight, maxLOD);
    }
  
    // Update the quadtree's LOD based on the camera's position
    updateLOD(camera: THREE.Camera): void {
      this.root.updateLOD(camera);
    }
  
    // Add all the node meshes to the scene
    addQuadtreeToScene(scene: THREE.Scene): void {
      this.addNodeToScene(this.root, scene);
    }
  
    // Helper function to add nodes to the scene
    private addNodeToScene(node: QuadtreeNode5, scene: THREE.Scene): void {
      if (node.isLeaf && node.mesh) {
        scene.add(node.mesh);
      } else {
        if (node.topLeft) this.addNodeToScene(node.topLeft, scene);
        if (node.topRight) this.addNodeToScene(node.topRight, scene);
        if (node.bottomLeft) this.addNodeToScene(node.bottomLeft, scene);
        if (node.bottomRight) this.addNodeToScene(node.bottomRight, scene);
      }
    }
  }