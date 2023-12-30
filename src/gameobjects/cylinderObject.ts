import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../utility";

export class CylinderObject {
    mesh: THREE.Mesh;
    body?: CANNON.Body;

    meshMaterial: THREE.Material;
    physicsMaterial?: CANNON.Material;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        radius: number,
        height: number,
        position: THREE.Vector3,
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
            new THREE.CylinderGeometry(radius, radius, height),    
            this.meshMaterial
        );
        this.mesh.position.set(position.x, position.y, position.z);
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;  
        
        scene.add(this.mesh);
        
        if(world != null) {

            this.physicsMaterial = physicsMaterial ?? new CANNON.Material();
            
            this.body = new CANNON.Body({
                shape: new CANNON.Cylinder(radius, radius, height, 20),
                position: new CANNON.Vec3(position.x, position.y, position.z),
                //type: CANNON.Body.STATIC,    
                //linearDamping: 0.31,            
                material: this.physicsMaterial,
                mass: 1
            });
            world.addBody(this.body);
        }
    }

    getPhysicsMaterial(): CANNON.Material {
        
        if(this.physicsMaterial != null)
            return this.physicsMaterial;
        else
            throw new Error("No physics material set!")
    }

    getPosition() {
        return this.mesh?.position;
    }

    update() {
        if(this.body != null) {
            this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(this.body.position));
            this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));
        }
    }
}