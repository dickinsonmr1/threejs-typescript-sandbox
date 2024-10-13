import * as THREE from "three";
import QuadtreeNode from "./quadtreeNode";

export default class QuadtreeTerrainSystem {

    quadtree: QuadtreeNode;
    yPosition: number = 10;

    constructor(scene: THREE.Scene, camera: THREE.Camera) {                        
        // Create the root bounds for the entire terrain
        const rootBounds = new THREE.Box2(new THREE.Vector2(-1000, -1000), new THREE.Vector2(1000, 1000));

        // Create the quadtree
        const maxLevel = 4;  // The depth of the quadtree (higher values = more detail)
        
        this.quadtree = this.createQuadtreeNode(rootBounds, 0, maxLevel);

        // Add the quadtree to the scene
        this.addQuadtreeToScene(this.quadtree, scene);        
    }

    addQuadtreeToScene(node: QuadtreeNode, scene: THREE.Scene) {
        if (node.mesh) {
            scene.add(node.mesh);
        }
        node.children.forEach(child => this.addQuadtreeToScene(child, scene));
    }

    createQuadtreeNode(bounds: THREE.Box2, level: number, maxLevel: number): QuadtreeNode {
        const node: QuadtreeNode = {
            bounds,
            children: [],
            level
        };
    
        // Subdivide if we haven't reached the max level
        if (level < maxLevel) {
            const centerX = (bounds.min.x + bounds.max.x) / 2;
            const centerY = (bounds.min.y + bounds.max.y) / 2;
    
            // Create the four children nodes
            node.children.push(this.createQuadtreeNode(new THREE.Box2(bounds.min, new THREE.Vector2(centerX, centerY)), level + 1, maxLevel));
            node.children.push(this.createQuadtreeNode(new THREE.Box2(new THREE.Vector2(centerX, bounds.min.y), new THREE.Vector2(bounds.max.x, centerY)), level + 1, maxLevel));
            node.children.push(this.createQuadtreeNode(new THREE.Box2(new THREE.Vector2(bounds.min.x, centerY), new THREE.Vector2(centerX, bounds.max.y)), level + 1, maxLevel));
            node.children.push(this.createQuadtreeNode(new THREE.Box2(new THREE.Vector2(centerX, centerY), bounds.max), level + 1, maxLevel));
        } else {
            // Create terrain mesh for this node
            node.mesh = this.createTerrainMesh(bounds);
        }
    
        return node;
    }

    createTerrainMesh(bounds: THREE.Box2): THREE.Mesh {
        const width = bounds.max.x - bounds.min.x;
        const height = bounds.max.y - bounds.min.y;
    
        // Create a PlaneGeometry for the terrain chunk
        const geometry = new THREE.PlaneGeometry(width, height, 10, 10);  // Adjust segments based on detail level
        const material = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
    
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.rotation.z = Math.PI / 2;

        // Position the mesh correctly
        mesh.position.set(
            bounds.min.x + width / 2,
            this.yPosition,  // Assuming flat terrain for now
            bounds.min.y + height / 2,            
        );
    
        return mesh;
    }

    update(camera: THREE.Camera, lodDistanceThreshold: number) {
        this.updateQuadtreeLOD(this.quadtree, camera, lodDistanceThreshold);
    }

    private updateQuadtreeLOD(node: QuadtreeNode, camera: THREE.Camera, lodDistanceThreshold: number) {
        if (node.children.length > 0) {
            // Calculate the distance from the camera to the center of this node
            const center = node.bounds.getCenter(new THREE.Vector2());
            const distance = camera.position.distanceTo(new THREE.Vector3(center.x, 0, center.y));
    
            if (distance < lodDistanceThreshold) {
                // Activate child nodes and hide this node's mesh
                if (node.mesh) {
                    node.mesh.visible = false;
                }
                node.children.forEach(child => this.updateQuadtreeLOD(child, camera, lodDistanceThreshold / 2));
            } else {
                // Show this node's mesh and hide children
                if (node.mesh) {
                    node.mesh.visible = true;
                }
                node.children.forEach(child => this.hideQuadtree(child));
            }
        }
    }
    
    hideQuadtree(node: QuadtreeNode) {
        if (node.mesh) {
            node.mesh.visible = false;
        }
        node.children.forEach(x => this.hideQuadtree(x));
    }
}