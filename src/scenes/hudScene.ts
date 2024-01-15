import * as THREE from 'three';
import HealthBar from '../gameobjects/healthBar';

export enum HudIconLocation {
    UpperLeft,
    UpperRight,
    Center,
    LowerLeft,
    LowerRight,
}

export default class HudScene extends THREE.Scene {
    /**
     *
     */
    camera: THREE.OrthographicCamera;
    //healthBar: HealthBar = new HealthBar(this);

    constructor(camera: THREE.OrthographicCamera) {
        super();

        this.camera = camera;
    }

    private readonly hudWidth = window.innerWidth / 2.5;
    private readonly hudHeight= window.innerHeight / 2.5;

    async initialize() {



        //var healthBar = new HealthBar(this);
        //this.healthBar.group.position.set(0,0,0);

        var healthBarOutlineSprite = new THREE.Sprite( new THREE.SpriteMaterial({
            //map: healthBarTexture,// this.explosionTexture,
            color: 'grey',
            sizeAttenuation: false,
            rotation: 0,        
            //depthTest: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.2
        }));
        healthBarOutlineSprite.center.set( 0, 0.5);       
        //temp.scale.set(100, 20, 1); // 1x scale = dimensions of image
        healthBarOutlineSprite.scale.set(200, 40, 1); // 1x scale = dimensions of image
        this.add( healthBarOutlineSprite );
        healthBarOutlineSprite.position.set(-this.hudWidth, -this.hudHeight, 0);     

        var healthBarSprite = new THREE.Sprite( new THREE.SpriteMaterial({
            //map: healthBarTexture,// this.explosionTexture,
            color: 'green',
            sizeAttenuation: false,
            rotation: 0,        
            //depthTest: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.5
        }));
        //this.healthBarSpriteOutline.position.set( 8, 2, 8 );
        healthBarSprite.center.set( 0, 0.5);
        
        //temp.scale.set(100, 20, 1); // 1x scale = dimensions of image
        healthBarSprite.scale.set(150, 40, 1); // 1x scale = dimensions of image

        //this.healthBarSpriteOutline.scale.set(0.25, 0.25, 0.25);
        this.add( healthBarSprite );
        healthBarSprite.position.set(-this.hudWidth, -this.hudHeight, 0);     
        
        
        let textureLoader = new THREE.TextureLoader();
        
        let healthIconTexture = textureLoader.load('assets/DPAD.png');
        healthIconTexture.colorSpace = THREE.SRGBColorSpace;

        let rocketTexture = textureLoader.load('assets/rocketIcon-multiple.png');
        healthIconTexture.colorSpace = THREE.SRGBColorSpace;

        let fireIconTexture = textureLoader.load('assets/fire.png');
        healthIconTexture.colorSpace = THREE.SRGBColorSpace;

        let freezeIconTexture = textureLoader.load('assets/freezeIcon.png');
        freezeIconTexture.colorSpace = THREE.SRGBColorSpace;
        
        let turboIconTexture = textureLoader.load('assets/turboIcon.png');
        freezeIconTexture.colorSpace = THREE.SRGBColorSpace;

        let material = new THREE.SpriteMaterial( { map: healthIconTexture });//,transparent: true, opacity: 0.5 } );

        //const spriteWidth = material.map?.image.width;
        //const spriteHeight = material.map?.image.height;

        let spriteWidth = 64;

        let spriteCenter = this.generateIcon(freezeIconTexture, new THREE.Color('white'), HudIconLocation.Center);
        let spriteTL = this.generateIcon(rocketTexture, new THREE.Color('white'), HudIconLocation.UpperLeft);    
        let spriteTR = this.generateIcon(fireIconTexture, new THREE.Color('white'), HudIconLocation.UpperRight);
        let spriteLL = this.generateIcon(healthIconTexture, new THREE.Color('white'), HudIconLocation.LowerLeft);
        let spriteLR = this.generateIcon(turboIconTexture, new THREE.Color('white'), HudIconLocation.LowerRight);    
    }

    generateIcon(texture: THREE.Texture, color: THREE.Color, location: HudIconLocation): THREE.Sprite {

        let spriteWidth: number = 64;
        let spriteHeight: number = 64;
        let spritePosition: THREE.Vector2;

        
        let material = new THREE.SpriteMaterial( { map: texture, color: color });//,transparent: true, opacity: 0.5 } );
        let sprite = new THREE.Sprite( material );
        switch(location) {
            case HudIconLocation.Center:                
                sprite.center.set( 0.5, 0.5 );
                sprite.scale.set( spriteWidth, spriteWidth, 1 );
                this.add(sprite);
                sprite.position.set(0, 0, 0);
                break;
            case HudIconLocation.UpperLeft:
                sprite.center.set( 0.5, 0.5 );
                sprite.scale.set( spriteWidth, spriteWidth, 1 );
                this.add(sprite);
                sprite.position.set(-this.hudWidth, this.hudHeight, 0);               
                break;
            case HudIconLocation.UpperRight:
                sprite.center.set( 0.5, 0.5 );
                sprite.scale.set( spriteWidth, spriteWidth, 1 );
                this.add(sprite);
                sprite.position.set(this.hudWidth, this.hudHeight, 0);
                break;
            case HudIconLocation.LowerLeft:
                sprite.center.set( 0.5, 0.5 );
                sprite.scale.set( spriteWidth, spriteWidth, 1 );
                this.add( sprite);
                sprite.position.set(-this.hudWidth, -this.hudHeight, 0);
                break;
            case HudIconLocation.LowerRight:
                sprite.center.set( 0.5, 0.5 );
                sprite.scale.set( spriteWidth, spriteWidth, 1 );
                this.add(sprite);
                sprite.position.set(this.hudWidth, -this.hudHeight, 0);
                break;
        }

        return sprite;
    }

    update() {
    }
}