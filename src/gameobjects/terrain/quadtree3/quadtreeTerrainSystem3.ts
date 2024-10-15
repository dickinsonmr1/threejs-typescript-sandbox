import * as THREE from "three";
import { QuadtreeNode3 } from "./quadtreeNode3";

export class QuadtreeTerrainSystem3 {
    root: QuadtreeNode3;
    scene: THREE.Scene;
    //material: THREE.Material;
    maxLevel: number;

    materials: THREE.Material[] = [];

    constructor(scene: THREE.Scene, size: number, maxLevel: number) {
        this.scene = scene;
        //this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true});

        let displacementMap = new THREE.TextureLoader().load('assets/displacement-map.png');

        // lowest level of detail
        let material1 = new THREE.MeshStandardMaterial({
            wireframe: true,
            color: 0xff0000,
            displacementMap: displacementMap,
            displacementScale: 20
        });

        let material2= new THREE.MeshStandardMaterial({
            wireframe: true,
            color: 0x00ff00,
            displacementMap: displacementMap,
            displacementScale: 20
        });

        let material3 = new THREE.MeshStandardMaterial({
            wireframe: true,
            color: 0x0000ff,
            displacementMap: displacementMap,
            displacementScale: 20
        });

        let material4 = new THREE.MeshStandardMaterial({
            wireframe: true,
            color: 0xffff00,
            displacementMap: displacementMap,
            displacementScale: 20
        });

        let material5 = new THREE.MeshStandardMaterial({
            wireframe: true,
            color: 0xff00ff,
            displacementMap: displacementMap,
            displacementScale: 20
        });

        // highest level of detail
        let material6 = new THREE.MeshStandardMaterial({
            wireframe: true,
            color: 0xffffff,
            displacementMap: displacementMap,
            displacementScale: 20
        });

        this.materials.push(material1);
        this.materials.push(material2);
        this.materials.push(material3);
        this.materials.push(material4);
        this.materials.push(material5);
        this.materials.push(material6);

        this.maxLevel = maxLevel;

        // Create the root node of the quadtree
        this.root = new QuadtreeNode3(0, -size / 2, -size / 2, size);
        this.root.createMesh(this.scene, this.materials[0]);
    }

    // Update quadtree based on camera position
    update(camera: THREE.Camera) {
        this.updateNode(this.root, camera);
    }

    // Recursive function to update nodes
    updateNode(node: QuadtreeNode3, camera: THREE.Camera) {
        const distance = this.getCameraDistanceToNode(camera, node);

        // Subdivide or merge based on distance
        if (distance < node.size * 2 && node.level < this.maxLevel) {
            if (!node.isSubdivided()) {
                node.subdivide(this.scene);
            }

            // Update child nodes recursively
            if (node.children) {
                node.children.forEach(child => this.updateNode(child, camera));
            }
        } else if (node.isSubdivided()) {
            this.merge(node);
        } else {
            // Create mesh if not subdivided
            node.createMesh(this.scene, this.materials[node.level]);
        }
    }

    // Merge node back into a single tile (removing children)
    merge(node: QuadtreeNode3) {
        if (node.children) {
            node.children.forEach(child => {
                if (child.mesh) {
                    this.scene.remove(child.mesh);
                    child.mesh = null;
                }
            });
            node.children = null;
        }
    }

    // Calculate distance from the camera to the center of the node
    getCameraDistanceToNode(camera: THREE.Camera, node: QuadtreeNode3): number {
        const nodeCenter = new THREE.Vector3(node.x + node.size / 2, 0, node.y + node.size / 2);
        return camera.position.distanceTo(nodeCenter);
    }
}