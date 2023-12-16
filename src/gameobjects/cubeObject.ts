import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../utility";

export class CubeObject {
    mesh: THREE.Mesh;
    body?: CANNON.Body;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        height: number, width: number, depth: number,
        position: THREE.Vector3,
        color: number = 0xffffff,
        world?: CANNON.World) {

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry( height, width, depth ),
            //new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } 
            new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide,
                wireframe: false
            })
        );
        this.mesh.position.set(position.x, position.y, position.z);
        //this.mesh.rotation.x = - Math.PI / 2;
        this.mesh.receiveShadow = true;  
        
        scene.add(this.mesh);
        
        if(world != null) {
            this.body = new CANNON.Body({
                shape: new CANNON.Box(new CANNON.Vec3(height, width, depth)),
                position: new CANNON.Vec3(position.x, position.y, position.z),
                //type: CANNON.Body.STATIC,
                //material: groundPhysMat,
                mass: 1
            });
            this.body.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
            world.addBody(this.body)
        }
    }

    update() {
        if(this.body != null) {
            this.mesh.position.copy(Utility.CannonVec3ToThreeVec3(this.body.position));
            this.mesh.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));
        }
    }
}