export default interface QuadtreeNode {
    bounds: THREE.Box2;  // The bounds of the terrain section
    children: QuadtreeNode[];  // The four child nodes
    mesh?: THREE.Mesh;  // The mesh for this section of terrain
    level: number;  // The level in the quadtree (for LOD purposes)
}