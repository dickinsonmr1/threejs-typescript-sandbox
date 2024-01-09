import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";

export class BoxObject {
    mesh: THREE.Mesh;
    body: CANNON.Body = new CANNON.Body();

    meshMaterial: THREE.Material;
    physicsMaterial?: CANNON.Material;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        height: number, width: number, depth: number,
        position: THREE.Vector3,
        color: number = 0xffffff,
        meshMaterial?: THREE.Material,
        world?: CANNON.World,
        physicsMaterial?: CANNON.Material,
        mass?: number) {

        this.meshMaterial = meshMaterial ?? new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            wireframe: true
        })

        this.mesh = new THREE.Mesh(
            
            new THREE.BoxGeometry( height, width, depth),            
            //new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } 
            this.meshMaterial
        );
        if(!world)
            this.mesh.position.set(position.x, position.y, position.z);
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        scene.add(this.mesh);
        
        if(world) {

            this.physicsMaterial = physicsMaterial ?? new CANNON.Material();

            this.body = new CANNON.Body({
                // https://stackoverflow.com/questions/26183492/cannonjs-and-three-js-one-unit-off
                shape: new CANNON.Box(new CANNON.Vec3(height / 2, width / 2, depth / 2)),
                position: new CANNON.Vec3(position.x, position.y, position.z),
                type: CANNON.Body.DYNAMIC,
                material: this.physicsMaterial,
                angularVelocity: new CANNON.Vec3(0, 10, 0),
                angularDamping: 0.5,
                linearDamping: 0.7,
                mass: mass
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
            this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(this.body.position));
            this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));
        }
    }
}