import * as THREE from "three";

export class Shield {
        
    private shieldMesh: THREE.Mesh;

    constructor(scene: THREE.Scene, position: THREE.Vector3) {
        var meshMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color('blue'),
            side: THREE.DoubleSide,
            wireframe: false,
            transparent: true,
            opacity: 0.1        
        });
        
        this.shieldMesh = new THREE.Mesh(
            new THREE.SphereGeometry(1.5),            
            meshMaterial
        );

        this.shieldMesh.position.copy(position);    
        scene.add(this.shieldMesh);        
    }

    updatePosition(position: THREE.Vector3) {
        this.shieldMesh.position.copy(position)
    }
}