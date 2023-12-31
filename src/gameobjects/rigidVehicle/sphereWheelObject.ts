import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";

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
        //color: number = 0xffffff,
        //meshMaterial?: THREE.Material,
        world: CANNON.World,
        wheelMaterial: CANNON.Material,
        mass: number) {

        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            wireframe: true
        })
        this.physicsMaterial = wheelMaterial;

        const wheelShape = new CANNON.Sphere(radius);
        this.wheelBody = new CANNON.Body({
            mass,
            material: wheelMaterial,
            angularDamping: 0.4
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

        //this.wheelBody.sha
        //const offset = this.wheelBody.shapeOffsets[0];
        //const orientation = this.wheelBody.shapeOrientations[0];

        //this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(offset));
        //this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(orientation));
        
        if(this.wheelBody.shapes[0].body != null) {
            this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(this.wheelBody.shapes[0].body.position));
            //this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(this.wheelBody.shapeOffsets[0]));

            //this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.wheelBody.shapes[0].body.quaternion));
            this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.wheelBody.shapeOrientations[0]));
        }

        //var temp = new CANNON.Vec3();
        //this.wheelBody.quaternion.toEuler(temp);
        //this.mesh.quaternion.setFromEuler(new THREE.Euler(temp.x, temp.y, temp.z));
        
    }
}