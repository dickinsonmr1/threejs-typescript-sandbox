import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../utility";

export class ChassisObject {
    mesh: THREE.Mesh;
    body: CANNON.Body = new CANNON.Body();

    meshMaterial: THREE.Material;
    physicsMaterial: CANNON.Material;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        chassisDimensions: CANNON.Vec3,
        //height: number, width: number, depth: number,
        position: THREE.Vector3,
        //color: number = 0xffffff,
        //meshMaterial?: THREE.Material,
        world: CANNON.World,
        physicsMaterial: CANNON.Material,
        mass: number,
        centerOfMassAdjust?: CANNON.Vec3) {

        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            wireframe: true
        })

        this.physicsMaterial = physicsMaterial;

        const chassisShape = new CANNON.Box(chassisDimensions);
        const chassisBody = new CANNON.Body({ mass: mass });
        chassisBody.addShape(chassisShape, centerOfMassAdjust);
        chassisBody.position.set(position.x, position.y, position.z);
        chassisBody.angularVelocity.set(0, 0.5, 0);

        this.body = chassisBody;
        world.addBody(this.body);

        this.mesh = new THREE.Mesh(
            
            new THREE.BoxGeometry( 1, 0.5, 2),            
            //new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } 
            this.meshMaterial
        );
        //this.mesh.position.set(position.x, position.y, position.z);
        //this.mesh.castShadow = true;
        //this.mesh.receiveShadow = true;
        
        scene.add(this.mesh);      
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