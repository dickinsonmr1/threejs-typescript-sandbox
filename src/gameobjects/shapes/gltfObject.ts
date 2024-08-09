import * as THREE from "three";
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";
import GameScene from "../../scenes/gameScene";
import { randFloat } from "three/src/math/MathUtils.js";


export enum GltfObjectPhysicsObjectShape {
    Box,
    Cylinder
}

export class GltfObject {
    
    scene: THREE.Scene;
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
        quaternion: THREE.Quaternion,
        scale: THREE.Vector3,
        velocity: THREE.Vector3,
        //color: number = 0xffffff,
        physicsObjectSize: THREE.Vector3,
        physicsPositionOffset: THREE.Vector3,
        //meshMaterial?: THREE.Material,
        world?: CANNON.World,
        physicsMaterial?: CANNON.Material,
        shapeType?: GltfObjectPhysicsObjectShape) {

            
        this.scene = scene;
        this.physicsPositionOffset = physicsPositionOffset;

        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            wireframe: true
        })

        this.model = modelData.clone();

        //this.model.position.set(position.x, position.y, position.z);
        this.model.scale.set(scale.x, scale.y, scale.z);            
                
        scene.add(this.model);

        if(world != null && physicsObjectSize != null) {

            this.physicsMaterial = physicsMaterial ?? new CANNON.Material();

            let shape = new CANNON.Box(new CANNON.Vec3(physicsObjectSize.x / 2, physicsObjectSize.y / 2, physicsObjectSize.z / 2));
            let cylinderShape = new CANNON.Cylinder(0.25, 0.25, 0.5, 16);
            
            this.body = new CANNON.Body({
                // https://stackoverflow.com/questions/26183492/cannonjs-and-three-js-one-unit-off
                shape: shapeType == GltfObjectPhysicsObjectShape.Cylinder
                       ? cylinderShape
                       : shape,
                position: new CANNON.Vec3(position.x, position.y, position.z),
                type: CANNON.Body.DYNAMIC,
                material: this.physicsMaterial,
                angularVelocity: new CANNON.Vec3(0, 0, randFloat(-100, 100)),
                velocity: Utility.ThreeVec3ToCannonVec3(velocity),
                angularDamping: 0.01,
                linearDamping: 0.01,
                mass: 0.1,
            });
            
            const quaternion2 = new THREE.Quaternion();
            quaternion2.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
            
            // Combine the quaternions
            const combinedQuaternion = quaternion.clone().multiply(quaternion2);
            this.body.quaternion.copy(Utility.ThreeQuaternionToCannonQuaternion(combinedQuaternion));            
            world.addBody(this.body);
        }

            setTimeout(() => {
                this.kill();
            }, 3000);
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
            
            //this.group.position.copy(Utility.CannonVec3ToThreeVec3(this.body.position).add(this.physicsPositionOffset));
            //this.group.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));
        }
    }

    kill() {
        if(this.model != null ){
            this.scene.remove(this.model);
        }

        if(this.body != null) {
            let gameScene = <GameScene>this.scene;
            gameScene.world.removeBody(this.body);
        }
    }
}