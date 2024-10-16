import * as THREE from "three";
import * as CANNON from 'cannon-es';
import { TerrainQuadTreeNode4 } from './TerrainQuadTreeNode4'

export class QuadtreeTerrainSystem4 {

    materials: THREE.Material[] = [];

    heightScale: number;
    constructor(scene: THREE.Scene, dataArray2D: number[][], size: number, maxLOD: number, flatnessThreshold: number, heightScale: number) {

        this.heightScale = heightScale;

        let isWireframe = true;

        let displacementScale = 50;
        // lowest level of detail
        let material1 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0xff0000,       
        });

        let material2 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0x00ff00,
        });

        let material3 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0x0000ff,
        });

        let material4 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0xffff00,
        });

        let material5 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0xff00ff,
        });

        // highest level of detail
        let material6 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0xffffff,
        });

        this.materials.push(material1);
        this.materials.push(material2);
        this.materials.push(material3);
        this.materials.push(material4);
        this.materials.push(material5);
        this.materials.push(material6);

        // Build the quadtree
        const quadtreeRoot = this.buildTerrainQuadtree(dataArray2D, 0, 0, size, maxLOD, flatnessThreshold, 0);

        this.addQuadtreeToScene(quadtreeRoot, scene);
    }

    buildTerrainQuadtree(heightmap: number[][], x: number, y: number,
        size: number,
        maxLOD: number, // The maximum Level of Detail (how small each chunk should get)
        threshold: number, // A threshold to determine if a region is "flat" enough to be a leaf
        level: number
    ): TerrainQuadTreeNode4 {

        if (size <= maxLOD || this.isFlat(heightmap, x, y, size, threshold)) {
            // Create a leaf node with a mesh
            const bounds = { x, y, size };
            const node = new TerrainQuadTreeNode4(true, bounds);
            node.mesh = this.generateTerrainMesh(heightmap, x, y, size, level); // Generate mesh for this chunk
            node.mesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
            node.mesh.position.y = 20;
            return node;
        }
    
        // Otherwise, subdivide into 4 quadrants
        const halfSize = size / 2;
    
        const topLeft = this.buildTerrainQuadtree(heightmap, x, y, halfSize, maxLOD, threshold, level+1);
        const topRight = this.buildTerrainQuadtree(heightmap, x + halfSize, y, halfSize, maxLOD, threshold, level+1);
        const bottomLeft = this.buildTerrainQuadtree(heightmap, x, y + halfSize, halfSize, maxLOD, threshold, level+1);
        const bottomRight = this.buildTerrainQuadtree(heightmap, x + halfSize, y + halfSize, halfSize, maxLOD, threshold, level+1);
    
        const node = new TerrainQuadTreeNode4(false, { x, y, size });
        node.topLeft = topLeft;
        node.topRight = topRight;
        node.bottomLeft = bottomLeft;
        node.bottomRight = bottomRight;
    
        return node;
    }

    generateTerrainMesh(heightmap: number[][], x: number, y: number, size: number, level: number): THREE.Mesh {
        const geometry = new THREE.PlaneGeometry(size, size, size - 1, size - 1);
      
        // Set the z (height) of each vertex in the geometry based on the heightmap
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const vertexIndex = i * size + j;
            const heightValue = heightmap[y + i][x + j] * this.heightScale;
            geometry.attributes.position.setZ(vertexIndex, heightValue);
          }
        }
      
        geometry.computeVertexNormals(); // Recompute normals for smooth shading
        const material = new THREE.MeshStandardMaterial({ color: 0x88cc88, wireframe: true });
        return new THREE.Mesh(geometry, this.materials[level]);
      }

    isFlat(heightmap: number[][], x: number, y: number, size: number, threshold: number): boolean {
        const firstHeight = heightmap[y][x];
        for (let i = y; i < y + size; i++) {
            for (let j = x; j < x + size; j++) {
                if (Math.abs(heightmap[i][j] - firstHeight) > threshold) {
                    return false;
                }
            }
        }
        return true;
    }

    addQuadtreeToScene(node: TerrainQuadTreeNode4, scene: THREE.Scene) {
        if (node.isLeaf && node.mesh) {
            scene.add(node.mesh);
        } else {
            if (node.topLeft) this.addQuadtreeToScene(node.topLeft, scene);
            if (node.topRight) this.addQuadtreeToScene(node.topRight, scene);
            if (node.bottomLeft) this.addQuadtreeToScene(node.bottomLeft, scene);
            if (node.bottomRight) this.addQuadtreeToScene(node.bottomRight, scene);
        }
    }
}