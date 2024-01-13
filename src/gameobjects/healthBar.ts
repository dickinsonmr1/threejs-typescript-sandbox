import * as THREE from "three";

export default class HealthBar {
    healthBarSprite: THREE.Sprite;
    healthBarSpriteOutline: THREE.Sprite;
    group: THREE.Group = new THREE.Group();

    /**
     *
     */
    constructor(scene: THREE.Scene) {
        this.healthBarSpriteOutline = new THREE.Sprite( new THREE.SpriteMaterial({
            //map: healthBarTexture,// this.explosionTexture,
            color: 'grey',
            sizeAttenuation: false,
            rotation: 0,        
            //depthTest: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.3
        }));
        //this.healthBarSpriteOutline.position.set( 8, 2, 8 );
        this.healthBarSpriteOutline.center.set( 0.5, 0.5);
        this.healthBarSpriteOutline.scale.set(0.25, .06, 1);
        //this.healthBarSpriteOutline.scale.set(0.25, 0.25, 0.25);
        this.group.add( this.healthBarSpriteOutline );
        
        this.healthBarSprite = new THREE.Sprite( new THREE.SpriteMaterial({
            color: 'green',
            sizeAttenuation: false,
            opacity: 0.7
        }));
        this.healthBarSprite.material.rotation = 0; //Math.PI / 2;
        //this.healthBarSprite.position.set( 8, 2, 8 );
        this.healthBarSprite.center.set( 0.5, 0.5);
        this.healthBarSprite.scale.set(.1, .05, 1);

        this.healthBarSprite?.position.set(0,1,0);
        this.healthBarSpriteOutline?.position.set(0,1,0);
        
        this.group.add( this.healthBarSprite );

        scene.add(this.group);
    }

    update(position: THREE.Vector3) {

        this.group.position.set(
            position.x ,
            position.y,
            position.z
        );            
    }
}