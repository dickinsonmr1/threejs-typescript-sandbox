import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../../utility";

export class SphereWheelObject {
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
        color: number = 0xffffff,
        //meshMaterial?: THREE.Material,
        world: CANNON.World,
        wheelMaterial: CANNON.Material,
        mass: number) {

        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            wireframe: true
        })
        this.physicsMaterial = wheelMaterial;

        const wheelShape = new CANNON.Sphere(radius);
        this.wheelBody = new CANNON.Body({
            mass,
            material: wheelMaterial,
            angularDamping: 0.7
        });
        this.wheelBody.addShape(wheelShape);
        world.addBody(this.wheelBody);
                
        // visual body
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius),
            //Utility.cylinderBodyToMesh(this.wheelBody, this.meshMaterial, radius, 20),
            this.meshMaterial
        );
        
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
        if(this.wheelBody != null) {
            this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(this.wheelBody.position));
            this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.wheelBody.quaternion));
        }
    }
}