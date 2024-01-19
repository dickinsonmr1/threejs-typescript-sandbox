import * as THREE from "three";

export default class HealthBar {
    healthBarSprite: THREE.Sprite;
    healthBarSpriteOutline: THREE.Sprite;
    group: THREE.Group = new THREE.Group();


    static maxWidth: number = 0.2;
    static maxHeight: number = 0.05;

    private readonly maxValue: number;
    private currentValue: number;

    /**
     *
     */
    constructor(scene: THREE.Scene, maxValue: number) {

        this.maxValue = maxValue;
        this.currentValue = this.maxValue;

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
        this.healthBarSpriteOutline.center.set( 0, 0.5);
        this.healthBarSpriteOutline.scale.set(HealthBar.maxWidth, HealthBar.maxHeight, 1);
        //this.healthBarSpriteOutline.scale.set(0.25, 0.25, 0.25);
        this.group.add( this.healthBarSpriteOutline );
        
        this.healthBarSprite = new THREE.Sprite( new THREE.SpriteMaterial({
            color: 'green',
            sizeAttenuation: false,
            opacity: 0.7
        }));
        this.healthBarSprite.material.rotation = 0; //Math.PI / 2;
        //this.healthBarSprite.position.set( 8, 2, 8 );
        this.healthBarSprite.center.set( 0, 0.5);
        this.healthBarSprite.scale.set(HealthBar.maxWidth, HealthBar.maxHeight, 1);        
        this.group.add( this.healthBarSprite );
        
        this.healthBarSprite?.position.set(0,1,0);
        this.healthBarSpriteOutline?.position.set(0,1,0);

        scene.add(this.group);
    }

    
    updateValue(value: number): void {
        this.currentValue = value;

        this.healthBarSprite.scale.x = this.calculateCurrentHealthBarWidth();

        if(this.currentValue > 0.5 * this.maxValue) {
            this.healthBarSprite.material.color.set(new THREE.Color('green'));
        }
        else if(this.currentValue <= 0.5 * this.maxValue &&
            this.currentValue > 0.2 * this.maxValue) {
                this.healthBarSprite.material.color.set(new THREE.Color('yellow'));
        }
        else if(this.currentValue <= 0.2 * this.maxValue) {
                this.healthBarSprite.material.color.set(new THREE.Color('red'));
        }
    }


    calculateCurrentHealthBarWidth(): number {
        return (this.currentValue / this.maxValue) * HealthBar.maxWidth;
    }

    update(position: THREE.Vector3) {

        this.group.position.set(
            position.x ,
            position.y,
            position.z
        );            
    }
}