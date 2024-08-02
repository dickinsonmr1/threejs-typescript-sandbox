import * as THREE from "three";
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";


export enum GltfObjectPhysicsObjectShape {
    Box,
    Cylinder
}

export class GltfObject {
    
    model: THREE.Group;
    group: THREE.Group = new THREE.Group();
    //mesh: THREE.Mesh; // bounding box mesh
    body?: CANNON.Body;

    physicsPositionOffset: THREE.Vector3;

    meshMaterial: THREE.Material;
    physicsMaterial?: CANNON.Material;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        //asset: string,        
        modelData: THREE.Group,
        position: THREE.Vector3,
        scale: THREE.Vector3,
        //color: number = 0xffffff,
        physicsObjectSize: THREE.Vector3,
        physicsPositionOffset: THREE.Vector3,
        //meshMaterial?: THREE.Material,
        world?: CANNON.World,
        physicsMaterial?: CANNON.Material,
        shapeType?: GltfObjectPhysicsObjectShape) {


        this.physicsPositionOffset = physicsPositionOffset;

        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            wireframe: true
        })

        this.model = modelData.clone();

        this.model.position.set(position.x, position.y, position.z);
        this.model.scale.set(scale.x, scale.y, scale.z);            
        //this.model.rotateX(Math.PI);
        
        scene.add(this.model);

        //this.group = model;
        //this.group.add(model);
        //this.group.position.set(position.x, position.y, position.z);
        //this.group.scale.set(scale.x, scale.y, scale.z);            
        //this.group.castShadow = true;
   
        //scene.add(this.group);

        /*
        this.mesh = new THREE.Mesh(
            
            new THREE.BoxGeometry( physicsObjectSize?.x, physicsObjectSize?.y, physicsObjectSize?.z),            
            //new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } 
            this.meshMaterial
        );
        this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 4);

        //this.mesh.position.set(position.x, position.y, position.z);
        //this.mesh.castShadow = true;
        //this.mesh.receiveShadow = true;
        
        this.group.add(this.mesh);
        */

        if(world != null && physicsObjectSize != null) {

            this.physicsMaterial = physicsMaterial ?? new CANNON.Material();

            let shape = new CANNON.Box(new CANNON.Vec3(physicsObjectSize.x / 2, physicsObjectSize.y / 2, physicsObjectSize.z / 2));
            let cylinderShape = new CANNON.Cylinder(1, 1, 0.5, 16);
            
            this.body = new CANNON.Body({
                // https://stackoverflow.com/questions/26183492/cannonjs-and-three-js-one-unit-off
                shape: shapeType == GltfObjectPhysicsObjectShape.Cylinder
                       ? cylinderShape
                       : shape,
                position: new CANNON.Vec3(position.x, position.y, position.z),
                type: CANNON.Body.DYNAMIC,
                material: this.physicsMaterial,
                angularVelocity: new CANNON.Vec3(0, 10, 0),
                angularDamping: 0.5,
                linearDamping: 0.7,
                mass: 0.5,
            });
            
            // todo: refactor initial rotation of physics body into parameter
            this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);            
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
        //return this.mesh?.position;
        return null;
    }

    update() {
        if(this.body != null) {

            //this.body.velocity.x = 0.1;

            this.model.position.copy(Utility.CannonVec3ToThreeVec3(this.body.position).add(this.physicsPositionOffset));
            this.model.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));
            
            // todo: refactor extra rotation of mesh into parameter
            this.model.rotateZ(-Math.PI/2);            
            
            this.group.position.copy(Utility.CannonVec3ToThreeVec3(this.body.position).add(this.physicsPositionOffset));
            this.group.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));
        }
    }
}