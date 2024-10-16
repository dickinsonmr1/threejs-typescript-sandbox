export class TerrainQuadTreeNode4 {
    isLeaf: boolean;
    bounds: { x: number; y: number; size: number }; // Coordinates and size of this chunk
    mesh: THREE.Mesh | null = null; // The terrain mesh for this chunk
    topLeft: TerrainQuadTreeNode4 | null = null;
    topRight: TerrainQuadTreeNode4 | null = null;
    bottomLeft: TerrainQuadTreeNode4 | null = null;
    bottomRight: TerrainQuadTreeNode4 | null = null;
  
    constructor(isLeaf: boolean, bounds: { x: number; y: number; size: number }) {
      this.isLeaf = isLeaf;
      this.bounds = bounds;
    }
  }