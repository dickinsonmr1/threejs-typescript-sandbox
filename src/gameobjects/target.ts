import * as THREE from "three";

export class Target {


    crosshairSprite!: THREE.Sprite;
    groundTargetMesh: THREE.Mesh;
    targetLocation: THREE.Vector3

    /**
     *
     */
    constructor(scene: THREE.Scene, texture: THREE.Texture, color:THREE.Color, position: THREE.Vector3, scale: number, depthRender: boolean) {

        this.targetLocation = position

        let material = new THREE.SpriteMaterial({ map: texture, color: color, depthTest: depthRender, depthWrite: depthRender, sizeAttenuation: false });//,transparent: true, opacity: 0.5 } );
        this.crosshairSprite = new THREE.Sprite( material );
        this.crosshairSprite.scale.set(scale, scale, scale);
        scene.add(this.crosshairSprite);

        var meshMaterial = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
            depthTest: true,
            map: texture,
        });

        this.groundTargetMesh = new THREE.Mesh(        
            new THREE.PlaneGeometry(2, 2),
            meshMaterial 
        );
        this.groundTargetMesh.rotateX(Math.PI);

        scene.add(this.groundTargetMesh)

    }

    setTargetLocation(position: THREE.Vector3) {
        this.targetLocation = position;
        this.crosshairSprite.position.set(position.x, position.y, position.z);    
    }

    setTargetMeshPosition(position: THREE.Vector3){
        this.groundTargetMesh.position.set(position.x, position.y + 0.25, position.z);    
    }

    rotateTargetToFaceDown() {
        //this.groundTargetMesh.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        this.groundTargetMesh.rotation.x = -Math.PI / 2;
    }
}