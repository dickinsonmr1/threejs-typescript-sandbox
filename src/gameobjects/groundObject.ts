import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../utility";


export class GroundObject {
    mesh: THREE.Mesh;
    body?: CANNON.Body;

    meshMaterial?: THREE.Material;
    physicsMaterial?: CANNON.Material;

    grid?: THREE.GridHelper;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        height: number, width: number,
        color: number = 0xffffff,
        meshMaterial?: THREE.Material,
        world?: CANNON.World,
        physicsMaterial?: CANNON.Material) {

        this.meshMaterial = meshMaterial ?? new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            wireframe: false
        })

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry( height, width ),
            this.meshMaterial
        );
        this.mesh.position.setY(0);
        this.mesh.rotation.x = - Math.PI / 2;

        this.mesh.castShadow = false;
        this.mesh.receiveShadow = true;  
        
        scene.add(this.mesh);
                
        let grid = new THREE.GridHelper( height, 50, 0xffffff, 0x0ffffff );
        grid.material.opacity = 1;
        grid.material.transparent = true;
        scene.add( grid );
        
        if(world != null) {

            this.physicsMaterial = physicsMaterial ?? new CANNON.Material();
                        
            this.body = new CANNON.Body({
                shape: new CANNON.Plane(),
                type: CANNON.Body.STATIC,
                material: this.physicsMaterial,
                mass: 0
            });
            this.body.position.set(0, 0, 0);
            this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
            world.addBody(this.body)
        }
    }
    
    getPhysicsMaterial(): CANNON.Material {
        
        if(this.physicsMaterial != null)
            return this.physicsMaterial;
        else
            throw new Error("No physics material set!")
    }

    update() {
        if(this.body != null) {
            this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(this.body.position));
            this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));
        }
    }
}