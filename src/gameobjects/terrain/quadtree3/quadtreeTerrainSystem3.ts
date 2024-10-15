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

        const loader = new THREE.TextureLoader();

        //let displacementMap = loader.load('assets/displacement-map.png');
        let displacementMap = loader.load('assets/heightmaps/mountain_circle_512x512.png');

        //let grassTexture = this.loadAndConfigureTexture(loader, "assets/tileable_grass_00.png", 4);
        let textureLOD0 = this.loadAndConfigureTexture(loader, "assets/stone 3.png", 1);
        let textureLOD1 = this.loadAndConfigureTexture(loader, "assets/stone 3.png", 2);
        let textureLOD2 = this.loadAndConfigureTexture(loader, "assets/stone 3.png", 4);
        let textureLOD3 = this.loadAndConfigureTexture(loader, "assets/stone 3.png", 8);
        let textureLOD4 = this.loadAndConfigureTexture(loader, "assets/stone 3.png", 16);
        let textureLOD5 = this.loadAndConfigureTexture(loader, "assets/stone 3.png", 32);

        let isWireframe = false;

        let displacementScale = 50;
        // lowest level of detail
        let material1 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0xff0000,
            displacementMap: displacementMap,
            displacementScale: displacementScale,
            map: textureLOD0
        });

        let material2 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0x00ff00,
            displacementMap: displacementMap,
            displacementScale: displacementScale,
            map: textureLOD1
        });

        let material3 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0x0000ff,
            displacementMap: displacementMap,
            displacementScale: displacementScale,
            map: textureLOD2
        });

        let material4 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0xffff00,
            displacementMap: displacementMap,
            displacementScale: displacementScale,
            map: textureLOD3
        });

        let material5 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0xff00ff,
            displacementMap: displacementMap,
            displacementScale: displacementScale,
            map: textureLOD4
        });

        // highest level of detail
        let material6 = new THREE.MeshStandardMaterial({
            wireframe: isWireframe,
            color: 0xffffff,
            displacementMap: displacementMap,
            displacementScale: displacementScale,
            map: textureLOD5
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

    loadAndConfigureTexture(loader: THREE.TextureLoader, asset: string, repeats: number): THREE.Texture
    {
        const texture = loader.load(asset);                
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.LinearFilter;
        //texture.minFilter = THREE.NearestMipMapLinearFilter;
        //texture.anisotropy = 16;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.repeat.set(repeats, repeats);
        texture.needsUpdate = true;

        return texture;
    }
}