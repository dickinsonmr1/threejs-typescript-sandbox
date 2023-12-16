import * as THREE from "three";
import * as CANNON from 'cannon-es'


export class GroundObject {
    mesh: THREE.Mesh;
    body?: CANNON.Body;

    physicsMaterial?: CANNON.Material;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        height: number, width: number,
        color: number = 0xffffff,
        world?: CANNON.World,
        material?: CANNON.Material) {

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry( height, width ),
            //new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } 
            new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide,
                wireframe: false
            })
        );
        this.mesh.rotation.x = - Math.PI / 2;
        this.mesh.receiveShadow = true;  
        
        scene.add(this.mesh);
        
        if(world != null) {

            this.physicsMaterial = material ?? new CANNON.Material();
                        
            this.body = new CANNON.Body({
                shape: new CANNON.Plane(),
                type: CANNON.Body.STATIC,
                material: this.physicsMaterial,
                mass: 0
            });
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
}