import * as THREE from "three";

export class PlayerMarker {


    sprite!: THREE.Sprite;
    targetLocation: THREE.Vector3

    /**
     *
     */
    constructor(scene: THREE.Scene, texture: THREE.Texture, color:THREE.Color, position: THREE.Vector3, scale: number, depthRender: boolean) {

        this.targetLocation = position

        let material = new THREE.SpriteMaterial( { map: texture, color: color, depthTest: depthRender, depthWrite: depthRender, sizeAttenuation: false });//,transparent: true, opacity: 0.5 } );
        this.sprite = new THREE.Sprite( material );
        this.sprite.scale.set(scale, scale, scale);
        scene.add(this.sprite);

    }

    setTargetLocation(position: THREE.Vector3) {
        this.sprite.position.set(position.x, position.y, position.z);
    }
}