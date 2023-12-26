import * as THREE from "three";
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es'
import { Utility } from "../utility";

export class GltfObject {
    
    model: THREE.Group;
    mesh: THREE.Mesh; // bounding box mesh
    body?: CANNON.Body;

    physicsPositionOffset: THREE.Vector3;

    meshMaterial: THREE.Material;
    physicsMaterial?: CANNON.Material;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        //asset: string,        
        modelData: GLTF,
        position: THREE.Vector3,
        scale: THREE.Vector3,
        //color: number = 0xffffff,
        physicsObjectSize: THREE.Vector3,
        physicsPositionOffset: THREE.Vector3,
        //meshMaterial?: THREE.Material,
        world?: CANNON.World,
        physicsMaterial?: CANNON.Material) {


        this.physicsPositionOffset = physicsPositionOffset;

        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            wireframe: true
        })

        this.model = modelData.scene;//.children[0];
        this.model.position.set(position.x, position.y, position.z);
        this.model.scale.set(scale.x, scale.y, scale.z);            
        //this.model.castShadow = true;
        //this.model.receiveShadow = true;

        scene.add(this.model);

        this.mesh = new THREE.Mesh(
            
            new THREE.BoxGeometry( physicsObjectSize?.x, physicsObjectSize?.y, physicsObjectSize?.z),            
            //new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } 
            this.meshMaterial
        );

        //this.mesh.position.set(position.x, position.y, position.z);
        //this.mesh.castShadow = true;
        //this.mesh.receiveShadow = true;
        
        scene.add(this.mesh);
        
        if(world != null && physicsObjectSize != null) {

            this.physicsMaterial = physicsMaterial ?? new CANNON.Material();

            this.body = new CANNON.Body({
                // https://stackoverflow.com/questions/26183492/cannonjs-and-three-js-one-unit-off
                shape: new CANNON.Box(new CANNON.Vec3(physicsObjectSize.x / 2, physicsObjectSize.y / 2, physicsObjectSize.z / 2)),
                position: new CANNON.Vec3(position.x, position.y, position.z),
                type: CANNON.Body.DYNAMIC,
                material: this.physicsMaterial,
                angularVelocity: new CANNON.Vec3(0, 10, 0),
                angularDamping: 0.5,
                linearDamping: 0.7,
                mass: 1
            });
            //this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
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
            
            this.model.position.copy(Utility.CannonVec3ToThreeVec3(this.body.position).add(this.physicsPositionOffset));
            this.model.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));

            this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(this.body.position));
            this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));
        }
    }
}