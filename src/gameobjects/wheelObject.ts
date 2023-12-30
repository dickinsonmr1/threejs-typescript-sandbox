import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../utility";

export class WheelObject {
    mesh: THREE.Mesh;
    wheelBody: CANNON.Body;

    meshMaterial: THREE.Material;
    physicsMaterial: CANNON.Material;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        radius: number,
        //height: number,
        //position: THREE.Vector3,
        //color: number = 0xffffff,
        //meshMaterial?: THREE.Material,
        world: CANNON.World,
        wheelMaterial: CANNON.Material) {

        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            wireframe: true
        })
        this.physicsMaterial = wheelMaterial;

        const cylinderShape = new CANNON.Cylinder(radius, radius, radius / 2, 20)
        this.wheelBody = new CANNON.Body({
          mass: 0,
          material: wheelMaterial,
        });
        this.wheelBody.type = CANNON.Body.KINEMATIC;
        this.wheelBody.collisionFilterGroup = 0; // turn off collisions
        const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0);
        this.wheelBody.addShape(cylinderShape, new CANNON.Vec3(), quaternion);

        world.addBody(this.wheelBody);
                
        this.mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, radius / 2, 20),                
            this.meshMaterial
        );
        //this.mesh.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
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
        this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(this.wheelBody.position));
        this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.wheelBody.quaternion));
    }
}