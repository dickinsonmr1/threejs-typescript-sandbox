import * as THREE from "three";

export class QuadTreeNode4 {    
  isLeaf: boolean;
  x: number;
  y: number;
  size: number; // Coordinates and size of this chunk

  mesh: THREE.Mesh | null = null; // The terrain mesh for this chunk

  level: number;

  topLeft: QuadTreeNode4 | null = null;
  topRight: QuadTreeNode4 | null = null;
  bottomLeft: QuadTreeNode4 | null = null;
  bottomRight: QuadTreeNode4 | null = null;

  constructor(isLeaf: boolean, level: number, x: number, y: number, size: number) {
    this.isLeaf = isLeaf;            
    this.level = level;

    this.x = x;
    this.y = y;
    this.size = size;
  }    

  // Check if node is subdivided
  isSubdivided() {
      return this.topLeft !== null
        || this.topRight !== null
        || this.bottomLeft !== null
        || this.bottomRight !== null;
  }

  // Subdivide the node into 4 children
  subdivide(scene: THREE.Scene) {
    const halfSize = this.size / 2;

    this.topLeft = new QuadTreeNode4(this.isLeaf, this.level + 1, this.x, this.y, halfSize);
    this.topRight = new QuadTreeNode4(this.isLeaf, this.level + 1, this.x + halfSize, this.y, halfSize);
    this.bottomLeft = new QuadTreeNode4(this.isLeaf, this.level + 1, this.x, this.y + halfSize, halfSize);
    this.bottomRight = new QuadTreeNode4(this.isLeaf, this.level + 1, this.x + halfSize, this.y + halfSize, halfSize);

    // Remove current mesh if it's being subdivided
    if (this.mesh) {
        scene.remove(this.mesh);
        this.mesh = null;
    }
  }

  // Create mesh for this tile (if not subdivided)
  createMesh(scene: THREE.Scene, heightmap: number[][]) { //}, material: THREE.Material) {
    this.mesh = this.generateTerrainMesh(heightmap, this.x, this.y, this.size, this.level); // Generate mesh for this chunk
    this.mesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
    this.mesh.position.y = 20;
  }

  private generateTerrainMesh(heightmap: number[][], x: number, y: number, size: number, level: number): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(size, size, size - 1, size - 1);
  
    // Set the z (height) of each vertex in the geometry based on the heightmap
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const vertexIndex = i * size + j;
        const heightValue = heightmap[y + i][x + j] * 20;//this.heightScale;
        geometry.attributes.position.setZ(vertexIndex, heightValue);
      }
    }
  
    geometry.computeVertexNormals(); // Recompute normals for smooth shading
    const material = new THREE.MeshStandardMaterial({ color: 0x88cc88, wireframe: true });
    return new THREE.Mesh(geometry, material);//this.materials[level]);
  }
}