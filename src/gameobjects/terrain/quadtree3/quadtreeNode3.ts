import * as THREE from "three";
import * as CANNON from 'cannon-es'

export class QuadtreeNode3 {
    children: QuadtreeNode3[] | null = null;
    mesh: THREE.Mesh | null = null;
    level: number;
    x: number;
    y: number;
    size: number;

    body?: CANNON.Body;

    constructor(level: number, x: number, y: number, size: number) {
        this.level = level;
        this.x = x;
        this.y = y;
        this.size = size;
    }

    // Check if node is subdivided
    isSubdivided() {
        return this.children !== null;
    }

    // Subdivide the node into 4 children
    subdivide(scene: THREE.Scene) {
        const halfSize = this.size / 2;
        this.children = [
            new QuadtreeNode3(this.level + 1, this.x, this.y, halfSize),
            new QuadtreeNode3(this.level + 1, this.x + halfSize, this.y, halfSize),
            new QuadtreeNode3(this.level + 1, this.x, this.y + halfSize, halfSize),
            new QuadtreeNode3(this.level + 1, this.x + halfSize, this.y + halfSize, halfSize),
        ];

        // Remove current mesh if it's being subdivided
        if (this.mesh) {
            scene.remove(this.mesh);
            this.mesh = null;
        }
    }

    // Create mesh for this tile (if not subdivided)
    createMesh(scene: THREE.Scene, material: THREE.Material) { //}, dataArray2D: number[][]) {
        if (!this.mesh) {
            const geometry = new THREE.PlaneGeometry(this.size, this.size, 32, 32);
            const mesh = new THREE.Mesh(geometry, material);

            mesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
            mesh.position.set(this.x + this.size / 2, 20, this.y + this.size / 2); // Center it
            this.mesh = mesh;
            scene.add(mesh);
        }
    }

    //generateMeshFromHeightData
}