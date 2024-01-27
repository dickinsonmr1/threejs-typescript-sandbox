import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../../utility";

export class SphereObject {
    mesh: THREE.Mesh;
    body?: CANNON.Body;

    group: THREE.Group = new THREE.Group();

    meshMaterial: THREE.Material;
    physicsMaterial?: CANNON.Material;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        radius: number,
        position: THREE.Vector3,
        color: number = 0xffffff,
        meshMaterial?: THREE.Material,
        world?: CANNON.World,
        physicsMaterial?: CANNON.Material) {

        this.meshMaterial = meshMaterial ?? new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            wireframe: false
        });
        
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius),            
            this.meshMaterial
        );
        this.mesh.position.set(0, 0, 0);    
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;  
        
        this.group.add(this.mesh);
        
        if(world != null) {

            this.physicsMaterial = physicsMaterial ?? new CANNON.Material();
            
            this.body = new CANNON.Body({
                shape: new CANNON.Sphere(radius),
                position: new CANNON.Vec3(position.x, position.y, position.z),
                //type: CANNON.Body.STATIC,    
                linearDamping: 0.31,            
                material: this.physicsMaterial,
                mass: 1
            });
            world.addBody(this.body);
        }

        this.group.position.set(position.x, position.y, position.z);

        scene.add(this.group);
    }

    getPhysicsMaterial(): CANNON.Material {
        
        if(this.physicsMaterial != null)
            return this.physicsMaterial;
        else
            throw new Error("No physics material set!")
    }

    getPosition() {
        return this.group.position;
    }

    kill() {
        this.group.children.forEach( x => this.group.remove(x));
        //this.group.remove(this.mesh);
    }

    update() {
        if(this.body != null) {
            this.group.position.copy(Utility.CannonVec3ToThreeVec3(this.body.position));
            this.group.quaternion.copy(Utility.CannonQuaternionToThreeQuaternion(this.body.quaternion));
        }
    }
}