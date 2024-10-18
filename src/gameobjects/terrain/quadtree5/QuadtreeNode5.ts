import * as THREE from 'three';

export class QuadtreeNode5 {
  isLeaf: boolean; // Determines if the node is a leaf
  bounds: { x: number; y: number; size: number }; // Region covered by this node in the heightmap
  mesh: THREE.Mesh | null = null; // The mesh for this node (only if it's a leaf)
  children: QuadtreeNode5[] = []; // The child nodes (if not a leaf)
  parent: QuadtreeNode5 | null = null; // Reference to the parent node
  maxLOD: number;
  heightMap: number[][];
  heightScale: number;

  constructor(
    bounds: { x: number; y: number; size: number },
    heightmap: number[][],
    scene: THREE.Scene,
    maxLOD: number,
    heightScale: number
  ) {
    this.bounds = bounds;
    this.isLeaf = true;
    this.maxLOD = maxLOD;
    this.heightMap = heightmap;
    this.heightScale = heightScale;

    this.mesh = this.generateMesh(heightmap, scene);
  }

  // Method to generate terrain mesh for this node
  private generateMesh(heightmap: number[][], scene: THREE.Scene): THREE.Mesh {
    const { x, y, size } = this.bounds;
    const geometry = new THREE.PlaneGeometry(size, size, size - 1, size - 1);

    // Populate geometry vertices with heightmap data
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = i * size + j;
        const heightValue = heightmap[y + i][x + j] * this.heightScale;
        geometry.attributes.position.setZ(index, heightValue);
      }
    }

    geometry.computeVertexNormals(); // Compute normals for smooth shading
    const material = new THREE.MeshStandardMaterial({ color: 0x88cc88 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
    mesh.position.y = 20;

    scene.add(mesh);
    return mesh;
  }


    // Check if the node should be subdivided based on camera distance
    updateLOD(camera: THREE.Camera, heightmap: number[][], scene: THREE.Scene, maxLOD: number, threshold: number): void {
        const distance = this.getDistanceToCamera(camera);

        // Subdivide if the camera is close enough, otherwise merge
        if (distance < threshold && this.isLeaf) {
            this.subdivide(heightmap, scene, maxLOD);
        }
        else if (distance >= threshold && !this.isLeaf) {
            this.merge(scene);
        }

        // Recursively update LOD for child nodes
        for (const child of this.children) {
            child.updateLOD(camera, heightmap, scene, maxLOD, threshold);
        }
    }
    
  // Subdivide the node into 4 children
  private subdivide(heightmap: number[][], scene: THREE.Scene, maxLOD: number): void {
    const { x, y, size } = this.bounds;
    const halfSize = size / 2;

    if (size <= maxLOD) return; // Do not subdivide beyond the max LOD

    this.isLeaf = false;

    // Create 4 child nodes
    this.children.push(new QuadtreeNode5({ x, y, size: halfSize }, heightmap, scene, maxLOD, this.heightScale));
    this.children.push(new QuadtreeNode5({ x: x + halfSize, y, size: halfSize }, heightmap, scene, maxLOD, this.heightScale));
    this.children.push(new QuadtreeNode5({ x, y: y + halfSize, size: halfSize }, heightmap, scene, maxLOD, this.heightScale));
    this.children.push(new QuadtreeNode5({ x: x + halfSize, y: y + halfSize, size: halfSize }, heightmap, scene, maxLOD, this.heightScale));

    // Hide the mesh for this node, since it has been subdivided
    if (this.mesh) {
      scene.remove(this.mesh);
      this.mesh = null;
    }
  }

  // Merge the children back into a single node (merge)
  private merge(scene: THREE.Scene): void {
    if (this.isLeaf || this.children.length === 0) return;

    // Remove child nodes and their meshes
    for (const child of this.children) {
      if (child.mesh) scene.remove(child.mesh);
    }
    this.children = [];

    // Regenerate the mesh for this node
    this.isLeaf = true;
    this.mesh = this.generateMesh(this.heightMap, scene);
  }


  // Helper method to get the distance of this node's center to the camera
  private getDistanceToCamera(camera: THREE.Camera): number {
    const centerX = this.bounds.x + this.bounds.size / 2;
    const centerY = this.bounds.y + this.bounds.size / 2;
    const nodeCenter = new THREE.Vector3(centerX, 0, centerY); // Assuming Z=0 for 2D heightmap

    return camera.position.distanceTo(nodeCenter);
  }
}