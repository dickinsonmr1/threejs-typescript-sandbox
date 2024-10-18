import * as THREE from 'three';

export class QuadtreeNode5 {
  isLeaf: boolean;
  bounds: { x: number; y: number; size: number }; // Coordinates and size of the heightmap chunk
  mesh: THREE.Mesh | null = null; // The mesh for this heightmap chunk
  heightmapChunk: number[][]; // The heightmap data for this chunk

  topLeft: QuadtreeNode5 | null = null;
  topRight: QuadtreeNode5 | null = null;
  bottomLeft: QuadtreeNode5 | null = null;
  bottomRight: QuadtreeNode5 | null = null;

  heightScale: number = 25;
  colors: THREE.ColorRepresentation[] = [];
  lodLevel: number;

  constructor(
    heightmapChunk: number[][],
    x: number,
    y: number,
    size: number,
    isLeaf: boolean,
    lodLevel: number
  ) {
    this.heightmapChunk = heightmapChunk;
    this.bounds = { x, y, size };
    this.isLeaf = isLeaf;
    this.lodLevel = lodLevel;

    this.generateLodColors();
    this.mesh = this.generateMesh();
  }

  // Generate the terrain mesh based on the heightmap chunk
  generateMesh(): THREE.Mesh {
    const { size, x, y } = this.bounds;

    // Create a plane geometry for the chunk
    const geometry = new THREE.PlaneGeometry(size, size, size - 1, size - 1);
    
    // Set the z-values (height) for each vertex based on the heightmap chunk
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = i * size + j;
        const heightValue = this.heightmapChunk[i][j] * this.heightScale;

        geometry.attributes.position.setZ(index, heightValue);
      }
    }

    geometry.computeVertexNormals(); // Recompute normals for smooth shading

    const material = new THREE.MeshStandardMaterial({ color: this.colors[this.lodLevel], wireframe: true });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2; // Rotate to lie flat

    mesh.position.set(x + size / 2, 20, y + size / 2); // Center it
    //mesh.position.y = 20;

    return mesh;
  }

  // Subdivide the node into 4 smaller nodes (quadrants)
  subdivide(): void {
    const { x, y, size } = this.bounds;
    const halfSize = size / 2;

    const topLeftChunk = this.getSubChunk(0, 0, halfSize);
    const topRightChunk = this.getSubChunk(halfSize, 0, halfSize);
    const bottomLeftChunk = this.getSubChunk(0, halfSize, halfSize);
    const bottomRightChunk = this.getSubChunk(halfSize, halfSize, halfSize);

    this.topLeft = new QuadtreeNode5(topLeftChunk, x, y, halfSize, true, this.lodLevel+1);
    this.topRight = new QuadtreeNode5(topRightChunk, x + halfSize, y, halfSize, true, this.lodLevel+1);
    this.bottomLeft = new QuadtreeNode5(bottomLeftChunk, x, y + halfSize, halfSize, true, this.lodLevel+1);
    this.bottomRight = new QuadtreeNode5(bottomRightChunk, x + halfSize, y + halfSize, halfSize, true, this.lodLevel+1);

    this.isLeaf = false;
  }

  // Merge the node back into a single chunk, removing its children
  merge(): void {
    this.topLeft = null;
    this.topRight = null;
    this.bottomLeft = null;
    this.bottomRight = null;

    this.isLeaf = true;
  }

  // Extract a sub-chunk of the heightmap from the current node
  getSubChunk(offsetX: number, offsetY: number, subSize: number): number[][] {
    const subChunk: number[][] = [];

    for (let i = 0; i < subSize; i++) {
      const row: number[] = [];
      for (let j = 0; j < subSize; j++) {
        row.push(this.heightmapChunk[offsetY + i][offsetX + j]);
      }
      subChunk.push(row);
    }

    return subChunk;
  }

  // Determine if this node should be subdivided or merged based on the camera distance
  updateLOD(camera: THREE.Camera): void {
    const distance = this.getDistanceFromCamera(camera);

    // For demonstration: Subdivide if close, merge if far
    if (distance < 100 && this.isLeaf) {
      this.subdivide();
    } else if (distance > 200 && !this.isLeaf) {
      this.merge();
    }

    // Update children LOD if this node is subdivided
    if (!this.isLeaf) {
      this.topLeft?.updateLOD(camera);
      this.topRight?.updateLOD(camera);
      this.bottomLeft?.updateLOD(camera);
      this.bottomRight?.updateLOD(camera);
    }
  }

  // Calculate the distance from this node's center to the camera
  getDistanceFromCamera(camera: THREE.Camera): number {
    const { x, y, size } = this.bounds;
    const center = new THREE.Vector3(x + size / 2, 0, y + size / 2);
    return center.distanceTo(camera.position);
  }

  generateLodColors(): void  {
    
    this.colors.push(0xff0000);
    this.colors.push(0x00ff00);
    this.colors.push(0x0000ff);
    this.colors.push(0xffff00);
    this.colors.push(0xff00ff);
    this.colors.push(0xffffff);    
  }
}