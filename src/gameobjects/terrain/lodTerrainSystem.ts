import * as THREE from "three";

export default class LODTerrainSystem {

    terrainLevels: number = 8;

    lod: THREE.LOD;

    constructor(scene: THREE.Scene, camera: THREE.Camera) {                        
      
        this.lod = new THREE.LOD();

        const terrainLevels = 4;
        for (let i = 0; i < terrainLevels; i++) {
            const terrain = this.createTerrain(i);
            this.lod.addLevel(terrain, i * 50);  // Higher levels appear further from the camera
        }

        scene.add(this.lod);
    }
    createTerrain(level: number): THREE.Mesh {
        const size = Math.pow(2, this.terrainLevels - level) * 10; // Terrain size scales down with higher LOD
        const segments = Math.pow(2, level + 1); // More segments for higher LODs
    
        // Create a plane geometry for the terrain
        const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    
        // Different color for each level
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]; // Colors for different LODs
        const material = new THREE.MeshLambertMaterial({ color: colors[level], wireframe: false });
    
        // Create and return the terrain mesh
        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2; // Rotate to lay flat
        terrain.position.y += 10;
    
        return terrain;
    }

    update(camera: THREE.Camera) {
        this.lod.update(camera);
    }
}