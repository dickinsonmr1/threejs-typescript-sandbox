import * as THREE from "three";

export enum HudBarType {
    LowerLeftMain,
    LowerLeftSecondary,    
    LowerRightMain,
    LowerRightSecondary
}

export default class HudHealthBar {
    healthBarSprite: THREE.Sprite;
    healthBarOutlineSprite: THREE.Sprite;
    group: THREE.Group = new THREE.Group();

    colorOverride?: THREE.Color;
    
    private readonly hudBarType: HudBarType;

    private readonly spriteMaxWidth: number;
    private readonly spriteMaxHeight: number;

    private readonly maxValue: number;
    private currentValue: number;

    private readonly hudWidth: number;
    private readonly hudHeight: number;
    /**
     *
     */
    
    // TODO: override color based on value
    constructor(scene: THREE.Scene, hudBarType: HudBarType,
        hudWidth: number, hudHeight: number,
        spriteMaxWidth: number,
        spriteMaxHeight: number,
        maxValue: number,
        iconTexture?: THREE.Texture,
        colorOverride?: THREE.Color) {

        this.hudBarType = hudBarType;

        this.spriteMaxWidth = spriteMaxWidth;
        this.spriteMaxHeight = spriteMaxHeight;
        
        this.maxValue = maxValue;
        this.currentValue = this.maxValue;

        this.hudWidth = hudWidth;
        this.hudHeight = hudHeight;

        this.colorOverride = colorOverride;
        
        let x = 0;
        let y = 0;
        let xAlign = 0;
        let yAlign = 0;
        let iconSize = 64;
        switch(this.hudBarType) {
            case HudBarType.LowerLeftMain:
                x = -this.hudWidth;
                y = -this.hudHeight;
                xAlign = 0;
                yAlign = 0.5;
                break;
            case HudBarType.LowerLeftSecondary:
                x = -this.hudWidth;
                y = -this.hudHeight * 0.9;
                xAlign = 0;
                yAlign = 0.5;
                iconSize = 48;
                break;
            case HudBarType.LowerRightMain:            
                x = this.hudWidth;
                y = -this.hudHeight;
                xAlign = 1;
                yAlign = 0.5;
                break;
            case HudBarType.LowerRightSecondary:
                x = this.hudWidth;
                y = -this.hudHeight * 0.9;
                xAlign = 1;
                yAlign = 0.5;
                iconSize = 48;
                break;
        }

        this.healthBarOutlineSprite = new THREE.Sprite( new THREE.SpriteMaterial({            
            color: 'grey',
            sizeAttenuation: false,
            rotation: 0,        
            blending: THREE.AdditiveBlending,
            opacity: 0.2
        }));
        this.healthBarOutlineSprite.center.set(xAlign, yAlign);
        this.healthBarOutlineSprite.scale.set(this.spriteMaxWidth, this.spriteMaxHeight, 1);
        this.group.add( this.healthBarOutlineSprite );
        this.healthBarOutlineSprite.position.set(x, y, 0);     

        let color = colorOverride ?? new THREE.Color('green');
        this.healthBarSprite = new THREE.Sprite( new THREE.SpriteMaterial({
            color: color,
            sizeAttenuation: false,
            rotation: 0,
            blending: THREE.AdditiveBlending,
            opacity: 0.5
        }));
        this.healthBarSprite.center.set(xAlign, yAlign);
        this.healthBarSprite.scale.set(this.spriteMaxWidth, this.spriteMaxHeight, 1);        
        this.group.add( this.healthBarSprite );
        this.healthBarSprite.position.set(x, y, 0);     
        //this.group.rotateX(Math.PI / 16);// .rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);


        if(iconTexture != null) {
            let material = new THREE.SpriteMaterial( { map: iconTexture });//,transparent: true, opacity: 0.5 } );
            let sprite = new THREE.Sprite( material );
            sprite.center.set( 0.5, 0.5 );
            sprite.scale.set( iconSize, iconSize, 1 );
            this.group.add(sprite);
            sprite.position.set(x, y, 0);
        }
        scene.add(this.group);
    }

    updateValue(value: number): void {
        this.currentValue = value;

        this.healthBarSprite.scale.x = this.calculateCurrentHealthBarWidth();

        if(this.colorOverride)
            return;

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