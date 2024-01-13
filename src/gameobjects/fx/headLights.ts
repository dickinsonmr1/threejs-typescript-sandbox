import * as THREE from 'three';
import { Utility } from '../../utility';

export default class Headlights {

    mesh1: THREE.Mesh;
    mesh2: THREE.Mesh;
    group: THREE.Group = new THREE.Group();
    /**
     *
     */
    constructor(scene: THREE.Scene) {        
        let meshMaterial = new THREE.MeshBasicMaterial({
            color: 'white',
            //side: THREE.DoubleSide,
            wireframe: false,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.05
        });
        
        this.mesh1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.5, 2, 16),    
            meshMaterial
        );
        
        this.mesh1.position.set(-0.25, 0, -1.5);        
        this.mesh1.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        this.mesh1.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

        this.group.add(this.mesh1);

        this.mesh2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.5, 2, 16),    
            meshMaterial
        );
        
        this.mesh2.position.set(0.25, 0, -1.5);        
        this.mesh2.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
        this.mesh2.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

        this.group.add(this.mesh2);

        scene.add(this.group);
    }

    update(position: THREE.Vector3, quaternion: THREE.Quaternion) {
        this.group.position.set(position.x, position.y, position.z);
        this.group.quaternion.copy(quaternion);
    }
}