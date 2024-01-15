import * as THREE from "three";

export default class HudHealthBar {
    healthBarSprite: THREE.Sprite;
    healthBarOutlineSprite: THREE.Sprite;
    group: THREE.Group = new THREE.Group();

    private readonly spriteMaxWidth: number;
    private readonly spriteMaxHeight: number;

    private readonly maxValue: number;
    private currentValue: number;

    private readonly hudWidth: number;
    private readonly hudHeight: number;
    /**
     *
     */
    constructor(scene: THREE.Scene, hudWidth: number, hudHeight: number,
        spriteMaxWidth: number,
        spriteMaxHeight: number,
        maxValue: number) {

        this.spriteMaxWidth = spriteMaxWidth;
        this.spriteMaxHeight = spriteMaxHeight;
        
        this.maxValue = maxValue;
        this.currentValue = this.maxValue;

        this.hudWidth = hudWidth;
        this.hudHeight = hudHeight;

        this.healthBarOutlineSprite = new THREE.Sprite( new THREE.SpriteMaterial({            
            color: 'grey',
            sizeAttenuation: false,
            rotation: 0,        
            blending: THREE.AdditiveBlending,
            opacity: 0.2
        }));
        this.healthBarOutlineSprite.center.set( 0, 0.5);
        this.healthBarOutlineSprite.scale.set(this.spriteMaxWidth, this.spriteMaxHeight, 1);
        this.group.add( this.healthBarOutlineSprite );
        this.healthBarOutlineSprite.position.set(-this.hudWidth, -this.hudHeight, 0);     

        this.healthBarSprite = new THREE.Sprite( new THREE.SpriteMaterial({
            color: 'green',
            sizeAttenuation: false,
            rotation: 0,
            blending: THREE.AdditiveBlending,
            opacity: 0.5
        }));
        this.healthBarSprite.center.set( 0, 0.5);
        this.healthBarSprite.scale.set(this.spriteMaxWidth, this.spriteMaxHeight, 1);        
        this.group.add( this.healthBarSprite );
        this.healthBarSprite.position.set(-this.hudWidth, -this.hudHeight, 0);     

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
        return (this.currentValue / this.maxValue) * this.spriteMaxWidth;
    }


    update(position: THREE.Vector3) {

        this.group.position.set(
            position.x,
            position.y,
            position.z
        );            
    }
}