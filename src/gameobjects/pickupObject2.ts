import * as THREE from "three";
import * as CANNON from 'cannon-es'

export class PickupObject2 {
    mesh: THREE.Mesh;
    mesh2: THREE.Mesh;
    sprite: THREE.Sprite;
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
        textureTintColor: number = 0xffffff,
        glowColor: number,
        iconTexture: THREE.Texture | undefined,
        textureScale: number) {

        this.meshMaterial = new THREE.MeshBasicMaterial({
            color: textureTintColor,
            side: THREE.DoubleSide,
            //wireframe: true,
            transparent: true,
            opacity: 1.0,
            depthTest: true,
            map: iconTexture,
            //alphaMap: iconTexture,            
            //lightMap: iconTexture,
            //specularMap: iconTexture,
        })

        this.mesh = new THREE.Mesh(
            
            new THREE.BoxGeometry( height, width, depth),    
            //new THREE.PlaneGeometry(1, 1),        
            //new THREE.SphereGeometry(0.5),
            //new THREE.CylinderGeometry(0.5, 0.25, 1, 8),
            //new THREE.TorusGeometry(0.5, 0.1, 2),
            //new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } 
            this.meshMaterial
        );
    
        this.mesh.position.set(0,0,0);//position.x, position.y, position.z);        
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = false;
        
        this.group.add(this.mesh);

        let meshMaterial2 = new THREE.MeshBasicMaterial({
            color: glowColor,
            side: THREE.DoubleSide,
            //wireframe: true,
            transparent: true,
            opacity: 0.15,
            depthTest: true,
            //map: iconTexture,
            //alphaMap: iconTexture,            
            //lightMap: iconTexture,
            //specularMap: iconTexture,
        })

        this.mesh2 = new THREE.Mesh(            
            //new THREE.BoxGeometry( height * 1.25, width * 1.25, depth * 1.25),            
            new THREE.SphereGeometry(0.75),
            //new THREE.CylinderGeometry(0.5, 0.25, 1, 8),
            //new THREE.TorusGeometry(0.5, 0.1, 2),
            //new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } 
            //new THREE.PlaneGeometry(1, 1),
            meshMaterial2
        );
    
        this.mesh2.position.set(0,0,0);//position.x, position.y, position.z);        
        this.mesh2.castShadow = false;
        this.mesh2.receiveShadow = false;

        this.group.add(this.mesh2);

        let sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: iconTexture,
            depthTest: true
        }));
        sprite.material.blending = THREE.AdditiveBlending;         
        sprite.material.opacity = 0.8;
        sprite.material.color = new THREE.Color('white');

        let size = textureScale;//0.5;
        sprite.scale.set(size, size, size);
        //sprite.position.set(position.x, position.y + 1, position.z);
        //this.group.add(sprite);
        this.sprite = sprite;

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
        this.mesh2.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 32);        
    }

    remove() {
        this.group.clear();    
        this.group.removeFromParent();    
    }
}