import * as THREE from "three";
import * as CANNON from 'cannon-es'
import { Utility } from "../utility";

export class PickupObject {
    mesh: THREE.Mesh;
    body: CANNON.Body = new CANNON.Body();

    //iconTexture: THREE.Texture | undefined;

    meshMaterial: THREE.Material;
    physicsMaterial?: CANNON.Material;
    /**
     *
     */
    constructor(scene: THREE.Scene,
        height: number, width: number, depth: number,
        position: THREE.Vector3,
        color: number = 0xffffff,
        iconTexture: THREE.Texture | undefined) {

        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        })

        this.mesh = new THREE.Mesh(
            
            new THREE.BoxGeometry( height, width, depth),            
            //new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } 
            this.meshMaterial
        );
    
        this.mesh.position.set(position.x, position.y, position.z);
        
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = false;
        
        scene.add(this.mesh);

        //this.iconTexture = iconTexture;

        let sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: iconTexture,
            depthTest: true
        }));
        sprite.material.blending = THREE.AdditiveBlending;
         
        sprite.material.opacity = 0.6;
        sprite.material.color = new THREE.Color('white');

        let particleGroup = new THREE.Group();
        particleGroup.position.set(position.x, position.y, position.z);

        let size = 0.5;
        sprite.scale.set(size, size, size);
        //sprite.position.set(position.x, position.y + 1, position.z);
        particleGroup.add(sprite);

        scene.add(particleGroup);
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
        this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 32);
    }
}