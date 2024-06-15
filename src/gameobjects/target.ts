import * as THREE from "three";

export class Target {


    crosshairSprite!: THREE.Sprite;
    targetLocation: THREE.Vector3

    /**
     *
     */
    constructor(scene: THREE.Scene, texture: THREE.Texture, color:THREE.Color, position: THREE.Vector3, depthRender: boolean) {

        this.targetLocation = position

        let material = new THREE.SpriteMaterial( { map: texture, color: color, depthTest: depthRender, depthWrite: depthRender });//,transparent: true, opacity: 0.5 } );
        this.crosshairSprite = new THREE.Sprite( material );
        scene.add(this.crosshairSprite);

    }

    setTargetLocation(position: THREE.Vector3) {
        this.crosshairSprite.position.set(position.x, position.y, position.z);
    }
}