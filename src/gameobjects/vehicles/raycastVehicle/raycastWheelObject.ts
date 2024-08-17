import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../../utility";

export class RaycastWheelObject {
    mesh: THREE.Mesh;
    wheelBody: CANNON.Body;

    meshMaterial: THREE.Material;
    physicsMaterial: CANNON.Material;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        isDebug: boolean,
        radius: number,
        wheelHeight: number,
        //position: THREE.Vector3,
        color: number = 0xffffff,
        //meshMaterial?: THREE.Material,
        world: CANNON.World,
        wheelMaterial: CANNON.Material) {

        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            wireframe: true
        })
        this.physicsMaterial = wheelMaterial;

        //let wheelHeight = radius * 1.5;
        const cylinderShape = new CANNON.Cylinder(radius, radius, wheelHeight, 20);
        this.wheelBody = new CANNON.Body({
          mass: 0,
          material: wheelMaterial,
        });
        this.wheelBody.type = CANNON.Body.KINEMATIC;
        this.wheelBody.collisionFilterGroup = 0; // turn off collisions
        
        //const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0);
        const quaternion = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);

        this.wheelBody.addShape(cylinderShape, new CANNON.Vec3(), quaternion);
        world.addBody(this.wheelBody);
                
        // visual body
        this.mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, wheelHeight, 20),                
            //Utility.cylinderBodyToMesh(this.wheelBody, this.meshMaterial, radius, 20),
            this.meshMaterial
        );

        // https://stackoverflow.com/questions/61017721/cannon-js-three-js-minimal-car-physics
        this.mesh.geometry.rotateX(Math.PI/2);

        //const offset = this.wheelBody.shapeOffsets[0];
        //const orientation = this.wheelBody.shapeOrientations[0];

        //this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(offset));
        //this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(orientation));

        //this.mesh.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
        //this.mesh.position.set(position.x, position.y, position.z);
            
        //this.mesh.castShadow = true;
        //this.mesh.receiveShadow = true;  

        if(!isDebug)
            this.mesh.visible = false;
        
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
        
        if(this.wheelBody.shapes[0].body != null && this.mesh != null) {
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