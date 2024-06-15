import * as THREE from "three";
import * as CANNON from 'cannon-es'

export class PickupObject {
    mesh: THREE.Mesh;
    body: CANNON.Body = new CANNON.Body();

    //iconTexture: THREE.Texture | undefined;

    meshMaterial: THREE.Material;
    physicsMaterial?: CANNON.Material;

    group: THREE.Group = new THREE.Group();
    /**
     *
     */
    constructor(scene: THREE.Scene,
        height: number, width: number, depth: number,
        position: THREE.Vector3,
        color: number = 0xffffff,
        iconTexture: THREE.Texture | undefined,
        textureScale: number) {

        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            wireframe: true,
            transparent: true,
            opacity: 0.5,
            depthTest: true
        })

        this.mesh = new THREE.Mesh(
            
            new THREE.BoxGeometry( height, width, depth),            
            //new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } 
            this.meshMaterial
        );
    
        this.mesh.position.set(0,0,0);//position.x, position.y, position.z);        
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = false;
        
        this.group.add(this.mesh);

        let sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: iconTexture,
            depthTest: true
        }));
        sprite.material.blending = THREE.AdditiveBlending;         
        sprite.material.opacity = 0.6;
        sprite.material.color = new THREE.Color('white');

        let size = textureScale;//0.5;
        sprite.scale.set(size, size, size);
        //sprite.position.set(position.x, position.y + 1, position.z);
        this.group.add(sprite);

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
        return this.group?.position;
    }

    update() {
        this.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 32);
    }

    remove() {
        this.group.clear();    
        this.group.removeFromParent();    
    }
}