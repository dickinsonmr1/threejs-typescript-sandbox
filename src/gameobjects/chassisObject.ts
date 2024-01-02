import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../utility";

export class ChassisObject {
    mesh: THREE.Mesh;
    body: CANNON.Body = new CANNON.Body();

    meshMaterial: THREE.Material;
    physicsMaterial: CANNON.Material;
    centerOfMassAdjust: CANNON.Vec3;

    constructor(scene: THREE.Scene,
        chassisDimensions: CANNON.Vec3,
        position: THREE.Vector3,
        world: CANNON.World,
        physicsMaterial: CANNON.Material,
        mass: number,
        centerOfMassAdjust: CANNON.Vec3 = new CANNON.Vec3(0,0,0)) {

        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            wireframe: true
        })

        this.physicsMaterial = physicsMaterial;
        this.centerOfMassAdjust = centerOfMassAdjust;

        const chassisShape = new CANNON.Box(chassisDimensions);
        const chassisBody = new CANNON.Body({ mass: mass });
        chassisBody.addShape(chassisShape, centerOfMassAdjust);

        chassisBody.position.set(position.x, position.y, position.z);
        chassisBody.angularVelocity.set(0, 0.5, 0);

        this.body = chassisBody;
        world.addBody(this.body);

        this.mesh = new THREE.Mesh(
            
            new THREE.BoxGeometry( chassisDimensions.x, chassisDimensions.y, chassisDimensions.z),            
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
            //this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(Utility.Add(this.body.position, this.centerOfMassAdjust)));
            this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));
        }
    }
}